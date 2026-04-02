"""
Advanced OCR Worker for Lebanese Gazette
Implements the "Atomic Granularity" extraction strategy.
Extracts: Legal Units, Entities, Dates, and Tables.
"""
import os
import json
import base64
import time
from pathlib import Path
from typing import List, Dict, Optional
import requests
from pdf2image import convert_from_path
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import logging
from datetime import datetime

# Load .env
load_dotenv(Path(__file__).parent.parent / ".env")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AdvancedGeminiOCR:
    def __init__(self, output_dir: str = "advanced_output"):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in .env file")
        
        # Using Gemini 2.5 Flash for speed and cost efficiency
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def image_to_base64(self, image: Image.Image) -> str:
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    def construct_prompt(self) -> str:
        return """You are a specialized Legal Data Extractor for the Lebanese Official Gazette (الجريدة الرسمية).
Your goal is to digitize this page into structured data.

### HIERARCHY DETECTION
Analyze the page layout to identify **Legal Units**. A "Unit" is a distinct law, decree, decision, or notice.
- A single page might contain multiple small units (e.g., 3 short notices).
- A single unit might span the whole page (e.g., a long decree).

### EXTRACTION RULES
For EACH Unit found, extract the following into a JSON object:

1.  **type**: One of ["law", "decree", "decision", "notice", "circular", "table", "budget", "supplement", "other"].
2.  **unit_number**: The official number (e.g., "1234" or "104/2024"). If none, use null.
3.  **title**: The concise title/subject (e.g., "تعديل سعر الصرف الجمركي").
4.  **issuer**: Who issued this? (e.g., "Ministry of Finance", "Council of Ministers").
5.  **effective_date**: Look for "يعمل به فور نشره" (Immediate) or specific dates like "1/1/2024". Format as YYYY-MM-DD if possible, or null.
6.  **content**: The FULL Arabic text of the unit. Preserve lines.
7.  **is_table**: Boolean. Set to true if this is primarily a data table (budget, names list).
8.  **table_data**: If `is_table` is true, extract the rows as a JSON Array of objects.
9.  **is_supplement**: Boolean. Set to true if the page header mentions "ملحق" (Appendix) or "موازنة" (Budget).

### JSON OUTPUT FORMAT
Return strictly a JSON object with a single key "units" containing an array:
{
  "units": [
    {
      "type": "decree",
      "unit_number": "112",
      "title": "Establishment of a new university branch",
      "issuer": "Ministry of Education",
      "effective_date": "2024-02-01",
      "content": "Full arabic text...",
      "is_table": false,
      "table_data": null
    }
  ]
}

- Output Arabic text exactly as it appears.
- If a page cuts off a unit (it continues to next page), mark "continues": true.
- DO NOT return Markdown. JUST the JSON.
"""

    def extract_page_data(self, image: Image.Image, page_num: int) -> Dict:
        """Send page to Gemini and get structured JSON with Retry Logic"""
        max_retries = 3
        base_delay = 5  # seconds

        for attempt in range(max_retries + 1):
            try:
                image_base64 = self.image_to_base64(image)
                
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": self.construct_prompt()},
                            {
                                "inline_data": {
                                    "mime_type": "image/png",
                                    "data": image_base64
                                }
                            }
                        ]
                    }],
                    "generationConfig": {
                        "response_mime_type": "application/json",
                        "temperature": 0.1
                    }
                }
                
                response = requests.post(
                    f"{self.base_url}?key={self.api_key}",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=60  # Increased timeout to 60s
                )
                
                if response.status_code != 200:
                    logger.error(f"API Error {response.status_code}: {response.text}")
                    if response.status_code in [429, 500, 502, 503, 504]:
                        # Retryable errors
                        if attempt < max_retries:
                            sleep_time = base_delay * (2 ** attempt)
                            logger.info(f"Retrying page {page_num} in {sleep_time}s (Attempt {attempt+1}/{max_retries})...")
                            time.sleep(sleep_time)
                            continue
                    return {"units": []}
                
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    raw_json = result['candidates'][0]['content']['parts'][0]['text']
                    return json.loads(raw_json)
                
                return {"units": []}

            except Exception as e:
                logger.error(f"Error processing page {page_num}: {e}")
                if attempt < max_retries:
                    sleep_time = base_delay * (2 ** attempt)
                    logger.info(f"Retrying page {page_num} in {sleep_time}s (Attempt {attempt+1}/{max_retries})...")
                    time.sleep(sleep_time)
                    continue
                return {"units": []}

    def process_issue(self, pdf_path: Path, issue_number: int, year: int):
        """Process a full PDF issue (Memory Efficient)"""
        logger.info(f"Processing Issue {issue_number} ({year})...")
        
        try:
            from pdf2image import pdfinfo_from_path, convert_from_path
            
            # Get total pages without loading images
            info = pdfinfo_from_path(pdf_path)
            total_pages = info["Pages"]
            logger.info(f"  Total Pages: {total_pages}")
            
            full_issue_data = []
            output_file = self.output_dir / f"issue_{issue_number}_{year}_advanced.json"
            
            # Resume if partially done? (Optional, but good for big files)
            # For now, just overwrite
            
            for i in range(1, total_pages + 1):
                logger.info(f"  Analysing Page {i}/{total_pages}...")
                
                # Convert ONLY one page
                images = convert_from_path(pdf_path, dpi=200, first_page=i, last_page=i)
                if not images:
                    continue
                    
                image = images[0]
                page_data = self.extract_page_data(image, i)
                
                # Free memory
                del images
                del image
                
                if page_data and "units" in page_data:
                    units = page_data["units"]
                    logger.info(f"    -> Found {len(units)} units")
                    
                    # Enrich with page metadata
                    for unit in units:
                        unit["page_number"] = i
                        unit["issue_number"] = issue_number
                        unit["year"] = year
                    
                    full_issue_data.extend(units)
                
                # Save Result continuously (Append mode would be better for huge files, but JSON structure makes it hard)
                # Rewriting full JSON every page is safer than losing data
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(full_issue_data, f, ensure_ascii=False, indent=2)
                
                # Rate limit guard
                time.sleep(1) 

            logger.info(f"✅ Saved advanced data to {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"❌ Error processing issue {issue_number}: {e}")
            raise e

def main():
    # Test on a 2025 PDF
    worker = AdvancedGeminiOCR()
    pdf_dir = Path("/Users/louaimroueh/Desktop/La Gazette/La Gazette/2025")
    
    # Grab the latest PDF
    pdfs = sorted(pdf_dir.glob("Gazette_Issue_*.pdf"), reverse=True)
    if pdfs:
        target_pdf = pdfs[0]
        issue_number = int(target_pdf.stem.split("_")[-1])
        worker.process_issue(target_pdf, issue_number, 2025)
    else:
        logger.error("No 2025 PDFs found to test.")

if __name__ == "__main__":
    main()
