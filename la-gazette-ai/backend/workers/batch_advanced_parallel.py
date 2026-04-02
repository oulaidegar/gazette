"""
Parallel Batch Runner for Advanced OCR (2025 -> 2014)
Processes PDFs in parallel using multiprocessing to speed up OCR by 3-5x
"""
import os
import time
from pathlib import Path
from advanced_ocr import AdvancedGeminiOCR
import logging
from tqdm import tqdm
from multiprocessing import Pool, cpu_count
from functools import partial

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='batch_2025_parallel.log',
    filemode='a'
)
console = logging.StreamHandler()
console.setLevel(logging.INFO)
logging.getLogger('').addHandler(console)
logger = logging.getLogger(__name__)

def process_single_pdf(pdf_path, year, output_dir):
    """
    Process a single PDF file (used by multiprocessing workers)
    """
    try:
        worker = AdvancedGeminiOCR(output_dir=output_dir)
        issue_number = int(pdf_path.stem.split("_")[-1])
        
        logger.info(f"Worker starting Issue {issue_number}...")
        start_time = time.time()
        worker.process_issue(pdf_path, issue_number, year)
        elapsed = time.time() - start_time
        logger.info(f"Worker finished Issue {issue_number} in {elapsed:.2f}s")
        
        return (issue_number, True, None)
    except Exception as e:
        logger.error(f"Worker failed Issue {issue_number}: {e}")
        return (issue_number, False, str(e))

def process_year_parallel(year: int, num_workers: int = 5):
    """
    Process all PDFs for a given year in parallel
    
    Args:
        year: Year to process
        num_workers: Number of parallel workers (default: 5)
    """
    base_dir = Path(f"/Users/louaimroueh/Desktop/La Gazette/La Gazette/{year}")
    if not base_dir.exists():
        logger.error(f"Directory {base_dir} not found")
        return

    pdfs = sorted(base_dir.glob("Gazette_Issue_*.pdf"), reverse=True)
    logger.info(f"Found {len(pdfs)} PDFs for Year {year}")

    output_dir = f"advanced_output/{year}"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Check what's already done
    existing = {f.name for f in Path(output_dir).glob("*.json")}
    
    # Filter out already processed PDFs
    pdfs_to_process = []
    for pdf in pdfs:
        issue_number = int(pdf.stem.split("_")[-1])
        output_filename = f"issue_{issue_number}_{year}_advanced.json"
        
        if output_filename in existing:
            logger.info(f"Skipping Issue {issue_number} (Already done)")
        else:
            pdfs_to_process.append(pdf)
    
    if not pdfs_to_process:
        logger.info("All PDFs already processed!")
        return
    
    logger.info(f"Processing {len(pdfs_to_process)} remaining PDFs with {num_workers} parallel workers")
    
    # Create a partial function with fixed year and output_dir
    process_func = partial(process_single_pdf, year=year, output_dir=output_dir)
    
    # Process PDFs in parallel
    with Pool(processes=num_workers) as pool:
        results = list(tqdm(
            pool.imap(process_func, pdfs_to_process),
            total=len(pdfs_to_process),
            desc=f"Processing {year}"
        ))
    
    # Summary
    successful = sum(1 for _, success, _ in results if success)
    failed = len(results) - successful
    
    logger.info(f"Batch complete: {successful} successful, {failed} failed")
    
    if failed > 0:
        logger.info("Failed issues:")
        for issue_num, success, error in results:
            if not success:
                logger.info(f"  Issue {issue_num}: {error}")

if __name__ == "__main__":
    # Process 2025 with 5 parallel workers
    # You can adjust num_workers (3-10 recommended, depending on your machine)
    process_year_parallel(2025, num_workers=5)
