"""
Batch Runner for Advanced OCR (2025 -> 2014)
Processes PDFs in parallel (sequentially for now to be safe) using the AdvancedGeminiOCR worker.
"""
import os
import time
from pathlib import Path
from advanced_ocr import AdvancedGeminiOCR
import logging
from tqdm import tqdm

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='batch_processing.log',
    filemode='a'
)
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logging.getLogger('').addHandler(console)
logger = logging.getLogger(__name__)

def process_year(year: int):
    base_dir = Path(f"/Users/louaimroueh/Desktop/La Gazette/La Gazette/{year}")
    if not base_dir.exists():
        logger.error(f"Directory {base_dir} not found")
        return

    pdfs = sorted(base_dir.glob("Gazette_Issue_*.pdf"), reverse=True)
    logger.info(f"Found {len(pdfs)} PDFs for Year {year}")

    worker = AdvancedGeminiOCR(output_dir=f"advanced_output/{year}")
    
    # Check what's already done
    existing = {f.name for f in worker.output_dir.glob("*.json")}
    
    for i, pdf in enumerate(tqdm(pdfs)):
        issue_number = int(pdf.stem.split("_")[-1])
        output_filename = f"issue_{issue_number}_{year}_advanced.json"
        
        if output_filename in existing:
            logger.info(f"Skipping Issue {issue_number} (Already done)")
            continue

        try:
            logger.info(f"Starting Issue {issue_number}...")
            start_time = time.time()
            worker.process_issue(pdf, issue_number, year)
            elapsed = time.time() - start_time
            logger.info(f"Finished Issue {issue_number} in {elapsed:.2f}s")
            
            # Tiny cool-down to be nice to API
            time.sleep(2)
            
        except Exception as e:
            logger.error(f"Failed Issue {issue_number}: {e}")

if __name__ == "__main__":
    # Start with 2025
    process_year(2025)
