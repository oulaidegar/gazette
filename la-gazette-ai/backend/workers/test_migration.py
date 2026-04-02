"""
Test Migration: Verify Supabase + Cohere integration
Tests with 2 completed JSON files before running full migration
"""
import os
import json
from pathlib import Path
from typing import List
import cohere
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv(Path(__file__).parent.parent / ".env")
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_connection():
    """Test Supabase and Cohere connections"""
    logger.info("Testing API connections...")
    
    # Test Supabase
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        logger.error("❌ SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
        return False
    
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        # Test query
        result = supabase.table('issues').select("*").limit(1).execute()
        logger.info(f"✅ Supabase connected (found {len(result.data)} existing issues)")
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")
        return False
    
    # Test Cohere
    cohere_key = os.getenv("COHERE_API_KEY")
    if not cohere_key:
        logger.error("❌ COHERE_API_KEY not set")
        return False
    
    try:
        cohere_client = cohere.Client(cohere_key)
        # Test embedding
        response = cohere_client.embed(
            texts=["test"],
            model='embed-multilingual-v3.0',
            input_type='search_document'
        )
        logger.info(f"✅ Cohere connected (embedding dimension: {len(response.embeddings[0])})")
    except Exception as e:
        logger.error(f"❌ Cohere connection failed: {e}")
        return False
    
    return True

def test_migration_single_issue():
    """Test migration with one issue"""
    logger.info("\nTesting migration with Issue 9235...")
    
    supabase: Client = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )
    cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))
    
    # Load test JSON
    json_file = Path(__file__).parent / "ocr_output" / "issue_9235_2025.json"
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    logger.info(f"  Issue: {data['issue_number']}")
    logger.info(f"  Year: {data['year']}")
    logger.info(f"  Blocks: {data['total_blocks']}")
    
    # Insert issue
    issue_data = {
        'issue_number': data['issue_number'],
        'year': data['year'],
        'total_pages': data['total_pages'],
        'file_path': data['file_path'],
        'total_blocks': data['total_blocks']
    }
    
    result = supabase.table('issues').upsert(issue_data).execute()
    issue_id = result.data[0]['id']
    logger.info(f"  ✓ Issue inserted (ID: {issue_id})")
    
    # Test with first 5 blocks only
    blocks = data['blocks'][:5]
    texts = [block['text'] for block in blocks]
    
    logger.info(f"  Generating embeddings for {len(texts)} blocks...")
    response = cohere_client.embed(
        texts=texts,
        model='embed-multilingual-v3.0',
        input_type='search_document'
    )
    embeddings = response.embeddings
    logger.info(f"  ✓ Embeddings generated")
    
    # Insert blocks
    blocks_data = []
    for block, embedding in zip(blocks, embeddings):
        blocks_data.append({
            'issue_id': issue_id,
            'page_number': block['page_number'],
            'block_index': block['block_index'],
            'text': block['text'],
            'bbox': block['bbox'],
            'confidence': block['confidence'],
            'embedding': embedding
        })
    
    supabase.table('blocks').insert(blocks_data).execute()
    logger.info(f"  ✓ {len(blocks_data)} blocks inserted")
    
    # Verify data
    verify_result = supabase.table('blocks').select("*").eq('issue_id', issue_id).execute()
    logger.info(f"  ✓ Verified: {len(verify_result.data)} blocks in database")
    
    logger.info("\n✅ Test migration successful!")
    return True

def main():
    logger.info("="*60)
    logger.info("MIGRATION TEST")
    logger.info("="*60)
    
    if not test_connection():
        logger.error("\n❌ Connection test failed. Please check your API keys.")
        return
    
    logger.info("\n" + "="*60)
    
    if not test_migration_single_issue():
        logger.error("\n❌ Migration test failed.")
        return
    
    logger.info("\n" + "="*60)
    logger.info("🎉 ALL TESTS PASSED!")
    logger.info("Ready to run full migration when OCR completes.")
    logger.info("="*60)

if __name__ == "__main__":
    main()
