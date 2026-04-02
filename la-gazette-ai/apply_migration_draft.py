
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('backend/.env')
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
    exit(1)

supabase = create_client(url, key)

with open('backend/migrations/01_create_entities.sql', 'r') as f:
    sql_commands = f.read()

# Split by command (simple split, might need more robust parsing if ; inside strings)
# But for now, valid SQL usually works with one exec if supported, 
# or split by ;
commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]

print(f"Applying {len(commands)} commands...")

for i, cmd in enumerate(commands):
    try:
        # Supabase-py doesn't expose raw SQL exec comfortably in all versions, 
        # but the 'rpc' interface or postgrest might not support arbitrary SQL.
        # However, the python client usually allows .rpc() if we wrap it in a function,
        # OR we can use the `postgres` library if installed. 
        # BUT wait, the `supabase` python client is just a wrapper.
        # Direct SQL execution is restricted via API usually.
        # I should check if I have `psycopg2` installed (it is in requirements.txt).
        # If I have connection string, I can use psycopg2.
        
        pass
    except Exception as e:
        print(f"Error executing command {i}: {e}")

# Re-plan: use psycopg2 if I can construct the DB URL.
# The SUPABASE_URL is usually https://xyz.supabase.co
# The DB URL is postgres://postgres:[PASSWORD]@db.xyz.supabase.co:5432/postgres
# I might not have the DB password in .env, only the SERVICE_KEY.
# If I don't have the password, I can't use psycopg2 easily from local unless I have the connection string.
#
# Alternative: Use the Dashboard SQL Editor? No, I must do it via code.
#
# Check .env for DATABASE_URL.
