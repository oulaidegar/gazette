"""
Simplified OCR Worker using Gemini REST API
Bypasses Python 3.14 compatibility issues with the official SDK
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

# Load .env from parent directory
load_dotenv(Path(__file__).parent.parent / ".env")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiRestOCR:
    def __init__(self, output_dir: str = "ocr_output"):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    def extract_page_text(self, image: Image.Image, page_num: int) -> List[Dict]:
        """
        Extract text blocks from a single page using Gemini REST API
        """
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
                headers={"Content-Type": "application/json"}
            )
            
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
            logger.error(f"Error extracting text from page {page_num}: {e}")
            return []
    
    def process_pdf(self, pdf_path: Path, issue_number: int, year: int):
        """Process a single PDF file and save results to JSON"""
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing Issue {issue_number} ({year})")
        logger.info(f"{'='*60}")
        
        try:
            # Convert PDF to images (lower DPI for faster processing)
            logger.info(f"Converting PDF to images...")
            images = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=3)  # Only first 3 pages for testing
            logger.info(f"✓ Converted {len(images)} pages")
            
            # Process each page
            all_blocks = []
            for page_num, image in enumerate(images, start=1):
                logger.info(f"\nProcessing page {page_num}/{len(images)}...")
                
                blocks = self.extract_page_text(image, page_num)
                
                if blocks:
                    logger.info(f"✓ Extracted {len(blocks)} text blocks")
                    all_blocks.extend(blocks)
                else:
                    logger.warning(f"⚠ No blocks extracted from page {page_num}")
            
            # Save results to JSON
            output_file = self.output_dir / f"issue_{issue_number}_{year}.json"
            result = {
                "issue_number": issue_number,
                "year": year,
                "total_pages": len(images),
                "file_path": str(pdf_path),
                "total_blocks": len(all_blocks),
                "blocks": all_blocks
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            logger.info(f"\n{'='*60}")
            logger.info(f"✅ SUCCESS: Issue {issue_number}")
            logger.info(f"   Total blocks: {len(all_blocks)}")
            logger.info(f"   Saved to: {output_file}")
            logger.info(f"{'='*60}\n")
            
        except Exception as e:
            logger.error(f"❌ Error processing PDF: {e}")

def main():
    """Process first 2 PDFs from Year 2025 for testing"""
    
    logger.info("Starting Gemini REST OCR Worker")
    logger.info("="*60)
    
    try:
        worker = GeminiRestOCR()
    except ValueError as e:
        logger.error(f"❌ {e}")
        logger.info("Please add your Gemini API key to backend/.env")
        logger.info("Get your key from: https://makersuite.google.com/app/apikey")
        return
    
    # Path to Year 2025 PDFs (using absolute path)
    pdf_dir = Path("/Users/louaimroueh/Desktop/La Gazette/La Gazette/2025")
    
    if not pdf_dir.exists():
        logger.error(f"❌ PDF directory not found: {pdf_dir.absolute()}")
        return
    
    # Get first 2 PDFs for testing
    pdf_files = sorted(pdf_dir.glob("Gazette_Issue_*.pdf"), reverse=True)[:2]
    
    if not pdf_files:
        logger.error("❌ No PDF files found")
        return
    
    logger.info(f"Found {len(pdf_files)} PDFs to process\n")
    
    for i, pdf_path in enumerate(pdf_files, 1):
        # Extract issue number from filename
        issue_number = int(pdf_path.stem.split("_")[-1])
        logger.info(f"[{i}/{len(pdf_files)}] Starting: {pdf_path.name}")
        worker.process_pdf(pdf_path, issue_number, 2025)
    
    logger.info("\n" + "="*60)
    logger.info("✅ ALL PROCESSING COMPLETE")
    logger.info(f"Check results in: {worker.output_dir.absolute()}")
    logger.info("="*60)

if __name__ == "__main__":
    main()
