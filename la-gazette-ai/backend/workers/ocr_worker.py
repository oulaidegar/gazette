"""
OCR Worker for Lebanese Gazette PDFs
Uses Gemini 2.0 Flash Vision for high-quality Arabic text extraction
"""
import os
import json
from pathlib import Path
from typing import List, Dict, Optional
import google.generativeai as genai
from pdf2image import convert_from_path
from PIL import Image
import cohere
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize APIs
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

# Database connection
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class GazetteOCRWorker:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    def extract_page_text(self, image: Image.Image, page_num: int) -> List[Dict]:
        """
        Extract text blocks from a single page using Gemini Vision
        Returns list of text blocks with bounding boxes and confidence
        """
        prompt = """
        You are analyzing a page from the Lebanese Official Gazette (الجريدة الرسمية).
        Extract ALL Arabic text blocks from this legal document.
        
        Return a JSON array with this structure:
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
        """
        
        try:
            response = self.model.generate_content([prompt, image])
            
            # Parse JSON from response
            text = response.text
            # Extract JSON from markdown code blocks if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
                
            blocks = json.loads(text)
            
            # Add page number to each block
            for block in blocks:
                block['page_number'] = page_num
                
            return blocks
            
        except Exception as e:
            logger.error(f"Error extracting text from page {page_num}: {e}")
            return []
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Cohere Multilingual v3"""
        try:
            response = cohere_client.embed(
                texts=[text],
                model='embed-multilingual-v3.0',
                input_type='search_document'
            )
            return response.embeddings[0]
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None
    
    def process_pdf(self, pdf_path: Path, issue_number: int, year: int):
        """Process a single PDF file"""
        logger.info(f"Processing Issue {issue_number} ({year})")
        
        db = SessionLocal()
        try:
            # Create issue record
            result = db.execute(
                text("""
                INSERT INTO issues (issue_number, year, file_path, total_pages, ocr_status)
                VALUES (:num, :year, :path, 0, 'processing')
                RETURNING id
                """),
                {"num": issue_number, "year": year, "path": str(pdf_path)}
            )
            issue_id = result.fetchone()[0]
            db.commit()
            
            # Convert PDF to images
            logger.info(f"Converting PDF to images...")
            images = convert_from_path(pdf_path, dpi=300)
            
            # Update total pages
            db.execute(
                text("UPDATE issues SET total_pages = :pages WHERE id = :id"),
                {"pages": len(images), "id": issue_id}
            )
            db.commit()
            
            # Process each page
            all_blocks = []
            for page_num, image in enumerate(images, start=1):
                logger.info(f"Processing page {page_num}/{len(images)}")
                
                blocks = self.extract_page_text(image, page_num)
                
                for block in blocks:
                    # Generate embedding
                    embedding = self.generate_embedding(block['text'])
                    if embedding:
                        db.execute(
                            text("""
                            INSERT INTO blocks 
                            (issue_id, page_number, block_index, text, bbox, confidence, embedding)
                            VALUES (:issue_id, :page, :idx, :text, :bbox, :conf, :emb)
                            """),
                            {
                                "issue_id": issue_id,
                                "page": block['page_number'],
                                "idx": block['block_index'],
                                "text": block['text'],
                                "bbox": json.dumps(block['bbox']),
                                "conf": block['confidence'],
                                "emb": embedding
                            }
                        )
                        all_blocks.append(block)
                
                db.commit()
            
            # Mark as completed
            db.execute(
                text("UPDATE issues SET ocr_status = 'completed' WHERE id = :id"),
                {"id": issue_id}
            )
            db.commit()
            
            logger.info(f"✅ Completed Issue {issue_number}: {len(all_blocks)} blocks extracted")
            
        except Exception as e:
            logger.error(f"Error processing PDF: {e}")
            db.rollback()
        finally:
            db.close()

def main():
    """Process first 10 PDFs from Year 2025"""
    worker = GazetteOCRWorker()
    
    # Path to Year 2025 PDFs
    pdf_dir = Path("../../La Gazette/2025")
    
    if not pdf_dir.exists():
        logger.error(f"PDF directory not found: {pdf_dir}")
        return
    
    # Get first 10 PDFs
    pdf_files = sorted(pdf_dir.glob("Gazette_Issue_*.pdf"), reverse=True)[:10]
    
    logger.info(f"Found {len(pdf_files)} PDFs to process")
    
    for pdf_path in pdf_files:
        # Extract issue number from filename
        issue_number = int(pdf_path.stem.split("_")[-1])
        worker.process_pdf(pdf_path, issue_number, 2025)

if __name__ == "__main__":
    main()
