"""Test Supabase connection"""
import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client

load_dotenv(Path(__file__).parent.parent / ".env")

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Supabase URL: {supabase_url}")
print(f"Supabase Key: {supabase_key[:20]}...")

try:
    supabase = create_client(supabase_url, supabase_key)
    print("✅ Supabase client created")
    
    # Test query
    result = supabase.table('issues').select("*").limit(1).execute()
    print(f"✅ Query successful: {len(result.data)} rows")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
