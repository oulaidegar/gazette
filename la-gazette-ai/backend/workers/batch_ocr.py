"""
Batch OCR Worker for Lebanese Gazette PDFs
Processes all years (2014-2025) with progress tracking and error recovery
"""
import os
import json
import base64
from pathlib import Path
from typing import List, Dict
import requests
from pdf2image import convert_from_path
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import logging
from datetime import datetime
import time

# Load .env from parent directory
load_dotenv(Path(__file__).parent.parent / ".env")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BatchGazetteOCR:
    def __init__(self, output_dir: str = "ocr_output"):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Progress tracking
        self.progress_file = self.output_dir / "progress.json"
        self.load_progress()
        
    def load_progress(self):
        """Load processing progress from file"""
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
        """Save processing progress to file"""
        self.progress["last_updated"] = datetime.now().isoformat()
        with open(self.progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    def extract_page_text(self, image: Image.Image, page_num: int) -> List[Dict]:
        """Extract text blocks from a single page using Gemini REST API"""
        prompt = """You are analyzing a page from the Lebanese Official Gazette (الجريدة الرسمية).
Extract ALL Arabic text blocks from this legal document.

Return ONLY a JSON array with this exact structure (no markdown, no explanation):
[
  {
    "text": "extracted Arabic text",
    "bbox": {"x": 0, "y": 0, "width": 100, "height": 50},
    "confidence": 0.95,
    "block_index": 0
  }
]

Rules:
- Preserve exact Arabic text including diacritics
- Include law numbers, dates, and legal terminology
- Assign confidence based on text clarity (0.0-1.0)
- Order blocks top-to-bottom, right-to-left (RTL)
- Return ONLY the JSON array, nothing else"""
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Convert image to base64
                image_base64 = self.image_to_base64(image)
                
                # Prepare request payload
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": "image/png",
                                    "data": image_base64
                                }
                            }
                        ]
                    }]
                }
                
                # Make API request
                response = requests.post(
                    f"{self.base_url}?key={self.api_key}",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                if response.status_code == 429:
                    # Rate limit - wait and retry
                    wait_time = 60 * (attempt + 1)
                    logger.warning(f"Rate limit hit, waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                
                if response.status_code != 200:
                    logger.error(f"API Error: {response.status_code} - {response.text}")
                    return []
                
                result = response.json()
                
                # Extract text from response
                if 'candidates' in result and len(result['candidates']) > 0:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Clean up markdown code blocks if present
                    if "```json" in text:
                        text = text.split("```json")[1].split("```")[0].strip()
                    elif "```" in text:
                        text = text.split("```")[1].split("```")[0].strip()
                    
                    blocks = json.loads(text)
                    
                    # Add page number to each block
                    for block in blocks:
                        block['page_number'] = page_num
                    
                    return blocks
                else:
                    logger.error(f"No candidates in response: {result}")
                    return []
                    
            except Exception as e:
                logger.error(f"Error extracting text from page {page_num} (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)
                    continue
                return []
        
        return []
    
    def process_pdf(self, pdf_path: Path, issue_number: int, year: int) -> bool:
        """Process a single PDF file and save results to JSON"""
        
        # Check if already processed
        output_file = self.output_dir / f"issue_{issue_number}_{year}.json"
        if str(pdf_path) in self.progress["completed_files"]:
            logger.info(f"⏭️  Skipping {pdf_path.name} (already processed)")
            return True
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing Issue {issue_number} ({year})")
        logger.info(f"{'='*60}")
        
        try:
            # Convert PDF to images
            logger.info(f"Converting PDF to images...")
            images = convert_from_path(pdf_path, dpi=150)
            logger.info(f"✓ Converted {len(images)} pages")
            
            # Process each page
            all_blocks = []
            for page_num, image in enumerate(images, start=1):
                logger.info(f"Processing page {page_num}/{len(images)}...")
                
                blocks = self.extract_page_text(image, page_num)
                
                if blocks:
                    logger.info(f"✓ Extracted {len(blocks)} text blocks")
                    all_blocks.extend(blocks)
                else:
                    logger.warning(f"⚠ No blocks extracted from page {page_num}")
                
                # Rate limiting: wait between pages
                time.sleep(2)
            
            # Save results to JSON
            result = {
                "issue_number": issue_number,
                "year": year,
                "total_pages": len(images),
                "file_path": str(pdf_path),
                "total_blocks": len(all_blocks),
                "processed_at": datetime.now().isoformat(),
                "blocks": all_blocks
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            # Update progress
            self.progress["completed_files"].append(str(pdf_path))
            self.save_progress()
            
            logger.info(f"\n{'='*60}")
            logger.info(f"✅ SUCCESS: Issue {issue_number}")
            logger.info(f"   Total blocks: {len(all_blocks)}")
            logger.info(f"   Saved to: {output_file}")
            logger.info(f"{'='*60}\n")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error processing PDF: {e}")
            self.progress["failed_files"].append({
                "file": str(pdf_path),
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            self.save_progress()
            return False

def main():
    """Process all PDFs from Year 2025 first, then other years"""
    
    logger.info("="*60)
    logger.info("BATCH GAZETTE OCR WORKER")
    logger.info("="*60)
    
    try:
        worker = BatchGazetteOCR()
    except ValueError as e:
        logger.error(f"❌ {e}")
        return
    
    # Base path to PDFs
    base_path = Path("/Users/louaimroueh/Desktop/La Gazette/La Gazette")
    
    # Process Year 2025 first (most recent)
    years_to_process = [2025]  # Start with 2025, add others later
    
    total_processed = 0
    total_failed = 0
    
    for year in years_to_process:
        year_dir = base_path / str(year)
        
        if not year_dir.exists():
            logger.warning(f"⚠️  Directory not found: {year_dir}")
            continue
        
        # Get all PDFs for this year
        pdf_files = sorted(year_dir.glob("Gazette_Issue_*.pdf"), reverse=True)
        
        if not pdf_files:
            logger.warning(f"⚠️  No PDFs found in {year_dir}")
            continue
        
        logger.info(f"\n{'='*60}")
        logger.info(f"YEAR {year}: Found {len(pdf_files)} PDFs")
        logger.info(f"{'='*60}\n")
        
        for i, pdf_path in enumerate(pdf_files, 1):
            # Extract issue number from filename
            issue_number = int(pdf_path.stem.split("_")[-1])
            
            logger.info(f"[{i}/{len(pdf_files)}] Starting: {pdf_path.name}")
            
            success = worker.process_pdf(pdf_path, issue_number, year)
            
            if success:
                total_processed += 1
            else:
                total_failed += 1
            
            # Progress summary every 10 files
            if i % 10 == 0:
                logger.info(f"\n📊 Progress: {i}/{len(pdf_files)} files processed")
                logger.info(f"   ✅ Success: {total_processed}")
                logger.info(f"   ❌ Failed: {total_failed}\n")
    
    # Final summary
    logger.info(f"\n{'='*60}")
    logger.info(f"🎉 BATCH PROCESSING COMPLETE")
    logger.info(f"{'='*60}")
    logger.info(f"Total Processed: {total_processed}")
    logger.info(f"Total Failed: {total_failed}")
    logger.info(f"Output Directory: {worker.output_dir.absolute()}")
    logger.info(f"{'='*60}\n")

if __name__ == "__main__":
    main()
