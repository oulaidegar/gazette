import httpx
import asyncio
import sys

API_URL = "http://127.0.0.1:8000"

from dotenv import load_dotenv
load_dotenv()

async def main():
    async with httpx.AsyncClient() as client:
        print("1. Fetching recent legal units for extraction...")
        print("1. Fetching recent legal units for extraction...")
        # Direct DB fetch to avoid Search API dependencies
        from supabase import create_client
        import os
        
        supabase = create_client(
            os.environ.get("SUPABASE_URL"),
            os.environ.get("SUPABASE_SERVICE_KEY")
        )
        
        try:
            # Fetch 10 random units (or recent)
            # We use a simple select for now
            res = supabase.table("legal_units").select("id, title").limit(10).execute()
            units = res.data
            print(f"Found {len(units)} units to process via direct DB fetch.")
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Fatal: Failed to fetch units from DB: {repr(e)}")
            sys.exit(1)

        # 2. Extract for each
        for unit in units:
            uid = unit["id"]
            title = unit.get("title", "Untitled")[:50]
            print(f"\nProcessing: {title}...")
            print(f"ID: {uid}")
            
            try:
                # 60s timeout for model inference
                ext_resp = await client.post(f"{API_URL}/extract/{uid}", timeout=120.0)
                
                if ext_resp.status_code == 200:
                    res = ext_resp.json()
                    print(f"✅ Success! Extracted {res.get('extracted_count')} entities.")
                else:
                    print(f"❌ Failed (Status {ext_resp.status_code}): {ext_resp.text}")
            except Exception as e:
                print(f"⚠️ Error extracting {uid}: {e}")

    print("\nDone! Refresh the Explorer page.")

if __name__ == "__main__":
    asyncio.run(main())
