"""
Migration Script: JSON to Supabase
Imports OCR results from JSON files into Supabase database
Generates Cohere embeddings for semantic search
"""
import os
import json
from pathlib import Path
from typing import List, Dict
import cohere
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime
from tqdm import tqdm

load_dotenv(Path(__file__).parent.parent / ".env")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class GazetteMigration:
    def __init__(self):
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Initialize Cohere client
        cohere_key = os.getenv("COHERE_API_KEY")
        if not cohere_key:
            raise ValueError("COHERE_API_KEY must be set in .env")
        
        self.cohere_client = cohere.ClientV2(api_key=cohere_key)
        
        logger.info("✅ Connected to Supabase and Cohere")
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts using Cohere"""
        try:
            response = self.cohere_client.embed(
                texts=texts,
                model='embed-multilingual-v3.0',
                input_type='search_document',
                embedding_types=["float"]
            )
            return response.embeddings.float_
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return []
    
    def import_issue(self, json_file: Path) -> bool:
        """Import a single issue from JSON file"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            issue_number = data['issue_number']
            year = data['year']
            
            logger.info(f"Importing Issue {issue_number} ({year})...")
            
            # Insert issue metadata
            issue_data = {
                'issue_number': issue_number,
                'year': year,
                'total_pages': data['total_pages'],
                'file_path': data['file_path'],
                'total_blocks': data['total_blocks']
            }
            
            result = self.supabase.table('issues').upsert(issue_data).execute()
            issue_id = result.data[0]['id']
            
            logger.info(f"  ✓ Issue metadata inserted (ID: {issue_id})")
            
            # Process blocks in batches
            blocks = data['blocks']
            batch_size = 96  # Cohere limit
            
            for i in range(0, len(blocks), batch_size):
                batch = blocks[i:i + batch_size]
                
                # Extract texts for embedding
                texts = [block['text'] for block in batch]
                
                # Generate embeddings
                logger.info(f"  Generating embeddings for blocks {i+1}-{min(i+batch_size, len(blocks))}...")
                embeddings = self.generate_embeddings(texts)
                
                if not embeddings:
                    logger.error(f"  Failed to generate embeddings for batch {i}")
                    continue
                
                # Prepare block data
                blocks_data = []
                for block, embedding in zip(batch, embeddings):
                    blocks_data.append({
                        'issue_id': issue_id,
                        'page_number': block['page_number'],
                        'block_index': block['block_index'],
                        'text': block['text'],
                        'bbox': block['bbox'],
                        'confidence': block['confidence'],
                        'embedding': embedding
                    })
                
                # Insert blocks
                self.supabase.table('blocks').insert(blocks_data).execute()
                logger.info(f"  ✓ Inserted {len(blocks_data)} blocks")
            
            logger.info(f"✅ Successfully imported Issue {issue_number}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error importing {json_file.name}: {e}")
            return False
    
    def migrate_all(self, json_dir: Path):
        """Migrate all JSON files from directory"""
        json_files = sorted(json_dir.glob("issue_*.json"))
        
        if not json_files:
            logger.error(f"No JSON files found in {json_dir}")
            return
        
        logger.info(f"Found {len(json_files)} JSON files to migrate")
        
        success_count = 0
        fail_count = 0
        
        for json_file in tqdm(json_files, desc="Migrating issues"):
            if self.import_issue(json_file):
                success_count += 1
            else:
                fail_count += 1
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Migration Complete!")
        logger.info(f"  ✅ Success: {success_count}")
        logger.info(f"  ❌ Failed: {fail_count}")
        logger.info(f"{'='*60}")

def main():
    """Run migration from OCR output to Supabase"""
    import argparse
    parser = argparse.ArgumentParser(description='Migrate OCR JSON to Supabase')
    parser.add_argument('--year', type=int, required=True, help='Year of the gazettes')
    parser.add_argument('--path', type=str, required=True, help='Path to JSON directory')
    args = parser.parse_args()

    logger.info("="*60)
    logger.info("GAZETTE MIGRATION: JSON → Supabase")
    logger.info(f"Target Year: {args.year}")
    logger.info(f"Target Path: {args.path}")
    logger.info("="*60)
    
    try:
        migrator = GazetteMigration()
    except ValueError as e:
        logger.error(f"❌ {e}")
        logger.info("Please add your Supabase service role key and Cohere API key to .env")
        return
    
    json_dir = Path(args.path)
    if not json_dir.exists():
        logger.error(f"Directory not found: {json_dir}")
        return
    
    migrator.migrate_all(json_dir)

if __name__ == "__main__":
    main()
