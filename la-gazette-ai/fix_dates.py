import os
from dotenv import load_dotenv
from supabase import create_client
from datetime import date, timedelta
import random

load_dotenv('backend/.env')

url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')

if not url or not key:
    print('Missing Env Vars')
    exit(1)

supabase = create_client(url, key)

# Fetch issues
res = supabase.table('issues').select('*').execute()
issues = res.data
print(f"Found {len(issues)} issues")

# Update dates
# Start from first Thursday of 2025
base_date = date(2025, 1, 2) 

for i, issue in enumerate(issues):
    # Distribute them roughly weekly
    # Issue numbers aren't necessarily sequential in our sample, but let's just spread them
    # week_offset = i % 52
    
    # Or randomize slightly for visual variety
    week_offset = random.randint(0, 50)
    pub_date = base_date + timedelta(weeks=week_offset)
    
    # Update
    supabase.table('issues').update({'publication_date': str(pub_date)}).eq('id', issue['id']).execute()
    print(f"Updated issue {issue['issue_number']} to {pub_date}")

print("Done updating dates.")
