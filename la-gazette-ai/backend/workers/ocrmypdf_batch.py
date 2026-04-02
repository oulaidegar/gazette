"""
OCRmyPDF Batch Processor
Processes all Lebanese Gazette PDFs using OCRmyPDF with Arabic support
Much faster and free compared to Gemini API
"""
import os
import subprocess
import json
from pathlib import Path
from datetime import datetime
import PyPDF2
from tqdm import tqdm
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class OCRmyPDFProcessor:
    def __init__(self, pdf_dir, output_dir):
        self.pdf_dir = Path(pdf_dir)
        # Extract year from directory name if possible
        try:
            self.year = int(self.pdf_dir.name)
        except ValueError:
            self.year = 2024 # Default
            
        self.output_dir = Path(output_dir)
        self.ocr_output_dir = self.output_dir / str(self.year) / "ocr_pdfs"
        self.json_output_dir = self.output_dir / str(self.year) / "ocr_output"
        
        # Create output directories
        self.ocr_output_dir.mkdir(parents=True, exist_ok=True)
        self.json_output_dir.mkdir(parents=True, exist_ok=True)
        
        # Progress tracking
        self.progress_file = self.json_output_dir / "progress.json"
        self.load_progress()

    def load_progress(self):
        """Load progress from previous run"""
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                self.progress = json.load(f)
        else:
            self.progress = {
                "completed_files": [],
                "failed_files": [],
                "last_updated": None
            }
    
    def save_progress(self):
        """Save current progress"""
        self.progress["last_updated"] = datetime.now().isoformat()
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def ocr_pdf(self, pdf_path):
        """Run OCRmyPDF on a single PDF"""
        output_path = self.ocr_output_dir / pdf_path.name
        
        try:
            # Run OCRmyPDF with Arabic language - optimized for accuracy
            result = subprocess.run([
                'ocrmypdf',
                '--language', 'ara',  # Arabic
                '--deskew',  # Fix rotation
                '--clean',  # Clean up artifacts
                '--force-ocr',  # Force OCR on all pages
                '--optimize', '0',  # No optimization, preserve quality
                '--output-type', 'pdf',  # Output as PDF
                str(pdf_path),
                str(output_path)
            ], capture_output=True, text=True, timeout=900)  # 15 minute timeout
            
            if result.returncode == 0:
                logger.info(f"✅ OCR completed: {pdf_path.name}")
                return output_path
            else:
                logger.error(f"❌ OCR failed for {pdf_path.name}: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            logger.error(f"⏱️ Timeout processing {pdf_path.name}")
            return None
        except Exception as e:
            logger.error(f"❌ Error processing {pdf_path.name}: {e}")
            return None
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from OCR'd PDF"""
        try:
            with open(pdf_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                
                blocks = []
                for page_num, page in enumerate(reader.pages, 1):
                    text = page.extract_text()
                    
                    if text.strip():
                        # Split into paragraphs/blocks
                        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                        
                        for idx, para in enumerate(paragraphs):
                            blocks.append({
                                'page_number': page_num,
                                'block_index': idx,
                                'text': para,
                                'bbox': None,  # OCRmyPDF doesn't provide bounding boxes
                                'confidence': None  # No confidence scores
                            })
                
                return blocks
                
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {e}")
            return []

    def process_single_pdf(self, pdf_path):
        """Process a single PDF: OCR + extract text + save JSON"""
        # Extract issue number from filename
        # Format: Gazette_Issue_9236.pdf
        filename = pdf_path.stem
        parts = filename.split('_')
        
        if len(parts) >= 3 and parts[0] == 'Gazette' and parts[1] == 'Issue':
            issue_number = parts[2]
        else:
            issue_number = filename
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing Issue {issue_number} ({self.year})")
        logger.info(f"{'='*60}")
        
        # Step 1: OCR the PDF
        logger.info("Running OCR...")
        ocr_pdf_path = self.ocr_pdf(pdf_path)
        
        if not ocr_pdf_path:
            self.progress["failed_files"].append(str(pdf_path))
            self.save_progress()
            return False
        
        # Step 2: Extract text
        logger.info("Extracting text...")
        blocks = self.extract_text_from_pdf(ocr_pdf_path)
        
        if not blocks:
            logger.warning(f"⚠️ No text extracted from {pdf_path.name}")
        
        # Step 3: Save to JSON
        json_data = {
            'issue_number': issue_number,
            'year': self.year,
            'total_pages': len(PyPDF2.PdfReader(open(ocr_pdf_path, 'rb')).pages),
            'file_path': str(pdf_path),
            'total_blocks': len(blocks),
            'blocks': blocks,
            'ocr_method': 'ocrmypdf',
            'processed_at': datetime.now().isoformat()
        }
        
        json_path = self.json_output_dir / f"issue_{issue_number}_{self.year}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ SUCCESS: Issue {issue_number}")
        logger.info(f"   Total blocks: {len(blocks)}")
        logger.info(f"   Saved to: {json_path.name}")
        logger.info(f"{'='*60}\n")
        
        self.progress["completed_files"].append(str(pdf_path))
        self.save_progress()
        return True

    def process_all(self):
        """Process all PDFs in the directory"""
        pdf_files = sorted(self.pdf_dir.glob("Gazette_Issue_*.pdf"))
        
        if not pdf_files:
            logger.error(f"No PDF files found in {self.pdf_dir}")
            return
        
        logger.info(f"Found {len(pdf_files)} PDF files to process for year {self.year}")
        
        # Filter out already completed files
        completed_paths = set(self.progress["completed_files"])
        remaining_files = [f for f in pdf_files if str(f) not in completed_paths]
        
        if not remaining_files:
            logger.info("All files already processed!")
            return
        
        logger.info(f"Resuming: {len(remaining_files)} files remaining")
        
        success_count = 0
        fail_count = 0
        
        for pdf_file in tqdm(remaining_files, desc="Processing PDFs"):
            if self.process_single_pdf(pdf_file):
                success_count += 1
            else:
                fail_count += 1
        
        logger.info(f"\n{'='*60}")
        logger.info(f"BATCH PROCESSING COMPLETE!")
        logger.info(f"  ✅ Success: {success_count}")
        logger.info(f"  ❌ Failed: {fail_count}")
        logger.info(f"  📊 Total: {len(pdf_files)}")
        logger.info(f"{'='*60}")

def main():
    """Run OCRmyPDF batch processing"""
    import sys
    
    # Default path for 2024 if no arg provided
    default_pdf_dir = "/Users/louaimroueh/Desktop/La Gazette/La Gazette/2024"
    pdf_dir = sys.argv[1] if len(sys.argv) > 1 else default_pdf_dir
    
    logger.info("="*60)
    logger.info("OCRmyPDF BATCH PROCESSOR")
    logger.info(f"Target Directory: {pdf_dir}")
    logger.info("="*60)
    
    output_dir = Path(__file__).parent
    
    processor = OCRmyPDFProcessor(pdf_dir, output_dir)
    processor.process_all()

if __name__ == "__main__":
    main()
