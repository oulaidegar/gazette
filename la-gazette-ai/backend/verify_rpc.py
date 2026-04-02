
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

supabase = create_client(url, key)

try:
    print("Testing search_units_keyword...")
    # Try a dummy search
    res = supabase.rpc('search_units_keyword', {
        'search_query': 'test', 
        'match_count': 1
    }).execute()
    print("Success:", res)
except Exception as e:
    print("Error:", e)
