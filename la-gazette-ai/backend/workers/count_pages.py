"""
Quick script to count total pages across all years (2014-2025)
"""
from pathlib import Path
from pdf2image import pdfinfo_from_path

def count_pages_in_year(year: int):
    base_dir = Path(f"/Users/louaimroueh/Desktop/La Gazette/La Gazette/{year}")
    if not base_dir.exists():
        return 0, 0
    
    pdfs = list(base_dir.glob("Gazette_Issue_*.pdf"))
    total_pages = 0
    
    for pdf in pdfs:
        try:
            info = pdfinfo_from_path(pdf)
            total_pages += info["Pages"]
        except Exception as e:
            print(f"Error reading {pdf.name}: {e}")
    
    return len(pdfs), total_pages

if __name__ == "__main__":
    grand_total_pdfs = 0
    grand_total_pages = 0
    
    print("Year | PDFs | Pages")
    print("-" * 30)
    
    for year in range(2025, 2013, -1):  # 2025 down to 2014
        num_pdfs, num_pages = count_pages_in_year(year)
        grand_total_pdfs += num_pdfs
        grand_total_pages += num_pages
        print(f"{year} | {num_pdfs:4d} | {num_pages:6d}")
    
    print("-" * 30)
    print(f"TOTAL | {grand_total_pdfs:4d} | {grand_total_pages:6d}")
    print(f"\nEstimated processing time at 10s/page: {grand_total_pages * 10 / 3600:.1f} hours")
    print(f"With 5 parallel workers: {grand_total_pages * 10 / 3600 / 5:.1f} hours")
