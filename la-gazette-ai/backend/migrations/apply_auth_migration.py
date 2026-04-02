import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend/.env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

def apply_migration():
    # Try different connection methods
    conn_string = os.getenv('DATABASE_URL')
    if not conn_string:
        host = os.getenv('POSTGRES_HOST')
        port = os.getenv('POSTGRES_PORT')
        db = os.getenv('POSTGRES_DB')
        user = os.getenv('POSTGRES_USER')
        password = os.getenv('POSTGRES_PASSWORD')
        if host and user and password:
            conn_string = f"postgresql://{user}:{password}@{host}:{port}/{db}"
    
    if not conn_string:
        print("ERROR: Could not find database connection details in .env")
        return False

    try:
        print("Connecting to database...")
        conn = psycopg2.connect(conn_string)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Read SQL file
        sql_path = Path(__file__).parent / '02_auth_bookmarks.sql'
        with open(sql_path, 'r') as f:
            sql = f.read()
            
        print("Executing migration...")
        cur.execute(sql)
        print("Migration applied successfully!")
        
        cur.close()
        conn.close()
        return True
    
    except Exception as e:
        print(f"Migration Failed: {e}")
        return False

if __name__ == "__main__":
    success = apply_migration()
    if not success:
        sys.exit(1)
