"""
Migration Script: Advanced OCR JSON to Supabase
Migrates legal units from advanced OCR output to Supabase with Cohere embeddings
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
import time

load_dotenv(Path(__file__).parent.parent / ".env")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration_2025_advanced.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AdvancedGazetteMigration:
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
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.cohere_client.embed(
                    texts=texts,
                    model='embed-multilingual-v3.0',
                    input_type='search_document',
                    embedding_types=["float"]
                )
                return response.embeddings.float_
            except Exception as e:
                logger.error(f"Error generating embeddings (attempt {attempt+1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(5 * (attempt + 1))  # Exponential backoff
                else:
                    return []
        return []
    
    def import_issue(self, json_file: Path) -> bool:
        """Import a single issue from advanced JSON file"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                legal_units = json.load(f)
            
            if not legal_units or len(legal_units) == 0:
                logger.warning(f"Empty JSON file: {json_file.name}")
                return False
            
            # Extract issue metadata from first unit
            first_unit = legal_units[0]
            issue_number = first_unit['issue_number']
            year = first_unit['year']
            
            logger.info(f"Importing Issue {issue_number} ({year}) with {len(legal_units)} units...")
            
            # Insert issue metadata
            issue_data = {
                'issue_number': issue_number,
                'year': year,
                'total_pages': max([u.get('page_number', 0) for u in legal_units]),
                'publication_date': None  # We don't have this in the JSON
            }
            
            # Upsert issue (in case it already exists)
            result = self.supabase.table('issues').upsert(issue_data, on_conflict='issue_number').execute()
            issue_id = result.data[0]['id']
            
            logger.info(f"  ✓ Issue metadata inserted (ID: {issue_id})")
            
            # Process legal units in batches
            batch_size = 96  # Cohere limit
            total_inserted = 0
            
            for i in range(0, len(legal_units), batch_size):
                batch = legal_units[i:i + batch_size]
                
                # Extract texts for embedding
                texts = [unit['content'] for unit in batch]
                
                # Generate embeddings
                logger.info(f"  Generating embeddings for units {i+1}-{min(i+batch_size, len(legal_units))}...")
                embeddings = self.generate_embeddings(texts)
                
                if not embeddings or len(embeddings) != len(batch):
                    logger.error(f"  Failed to generate embeddings for batch {i}")
                    continue
                
                # Prepare legal unit data with validation
                units_data = []
                skipped = 0
                valid_types = {'law', 'decree', 'decision', 'notice', 'circular', 'table', 'other'}
                
                for unit, embedding in zip(batch, embeddings):
                    # Skip units with null content
                    if not unit.get('content'):
                        skipped += 1
                        continue
                    
                    # Clean up type (map unknown types to 'other')
                    unit_type = unit.get('type')
                    if unit_type not in valid_types:
                        unit_type = 'other'
                    
                    # Clean up effective_date (convert string "null" to None)
                    effective_date = unit.get('effective_date')
                    if effective_date == "null" or effective_date == "":
                        effective_date = None
                    elif effective_date:
                        # Validate date format (must be YYYY-MM-DD)
                        # If invalid (like "2025", "2024-2025", or Arabic text), set to None
                        import re
                        if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(effective_date)):
                            effective_date = None
                    
                    units_data.append({
                        'issue_id': issue_id,
                        'type': unit_type,
                        'unit_number': unit.get('unit_number'),
                        'title': unit.get('title'),
                        'issuer': unit.get('issuer'),
                        'effective_date': effective_date,
                        'content': unit['content'],
                        'is_table': unit.get('is_table', False),
                        'table_data': unit.get('table_data'),
                        'page_number': unit.get('page_number'),
                        'is_supplement': unit.get('is_supplement', False),
                        'embedding': embedding
                    })
                
                # Insert legal units
                if units_data:
                    self.supabase.table('legal_units').insert(units_data).execute()
                    total_inserted += len(units_data)
                    logger.info(f"  ✓ Inserted {len(units_data)} units (Total: {total_inserted}/{len(legal_units)}) [Skipped: {skipped}]")
                else:
                    logger.warning(f"  ⚠️  Skipped entire batch ({skipped} units with null content)")
            
            logger.info(f"✅ Successfully imported Issue {issue_number} ({total_inserted} units)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error importing {json_file.name}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    def migrate_all(self, json_dir: Path):
        """Migrate all JSON files from directory"""
        json_files = sorted(json_dir.glob("issue_*_advanced.json"))
        
        if not json_files:
            logger.error(f"No JSON files found in {json_dir}")
            return
        
        logger.info(f"Found {len(json_files)} JSON files to migrate")
        
        success_count = 0
        fail_count = 0
        start_time = time.time()
        
        for json_file in tqdm(json_files, desc="Migrating issues"):
            if self.import_issue(json_file):
                success_count += 1
            else:
                fail_count += 1
        
        elapsed = time.time() - start_time
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Migration Complete!")
        logger.info(f"  ✅ Success: {success_count}")
        logger.info(f"  ❌ Failed: {fail_count}")
        logger.info(f"  ⏱️  Duration: {elapsed/60:.1f} minutes")
        logger.info(f"{'='*60}")

def main():
    """Run migration from advanced OCR output to Supabase"""
    import argparse
    parser = argparse.ArgumentParser(description='Migrate Advanced OCR JSON to Supabase')
    parser.add_argument('--year', type=int, required=True, help='Year of the gazettes')
    parser.add_argument('--path', type=str, required=True, help='Path to JSON directory')
    args = parser.parse_args()

    logger.info("="*60)
    logger.info("ADVANCED GAZETTE MIGRATION: JSON → Supabase")
    logger.info(f"Target Year: {args.year}")
    logger.info(f"Target Path: {args.path}")
    logger.info("="*60)
    
    try:
        migrator = AdvancedGazetteMigration()
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
