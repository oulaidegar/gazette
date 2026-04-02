from supabase import create_client, Client
import os
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import time

# Load env variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

class FolderSchema(BaseModel):
    id: str
    name: str
    user_id: str
    parent_id: Optional[str] = None
    created_at: str

class BookmarkSchema(BaseModel):
    id: str
    user_id: str
    legal_unit_id: str
    folder_id: Optional[str] = None
    note: Optional[str] = None
    created_at: str
    # Expanded unit details
    unit_title: Optional[str] = None
    unit_number: Optional[str] = None
    unit_date: Optional[str] = None

class BookmarkService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise ValueError("Supabase URL or Key not found")
        self.supabase: Client = create_client(url, key)

    def get_user_library(self, user_id: str) -> Dict[str, Any]:
        """Fetch all folders and bookmarks for a user."""
        
        # Fetch Folders
        folders = self.supabase.table('folders').select('*').eq('user_id', user_id).execute()
        
        # Fetch Bookmarks with Legal Unit details
        # Using a join if possible, or fetch separate
        # Join: bookmarks -> legal_units
        bookmarks_query = self.supabase.table('bookmarks')\
            .select('*, legal_units!inner(title, unit_number, effective_date)')\
            .eq('user_id', user_id)\
            .execute()
            
        # Format bookmarks
        formatted_bookmarks = []
        for b in bookmarks_query.data:
            unit = b.get('legal_units', {})
            formatted_bookmarks.append({
                'id': b['id'],
                'user_id': b['user_id'],
                'legal_unit_id': b['legal_unit_id'],
                'folder_id': b['folder_id'],
                'note': b['note'],
                'created_at': b['created_at'],
                'unit_title': unit.get('title'),
                'unit_number': unit.get('unit_number'),
                'unit_date': unit.get('effective_date')
            })
            
        return {
            "folders": folders.data,
            "bookmarks": formatted_bookmarks
        }

    def create_folder(self, user_id: str, name: str, parent_id: Optional[str] = None) -> Dict:
        data = {
            "user_id": user_id,
            "name": name,
            "parent_id": parent_id
        }
        res = self.supabase.table('folders').insert(data).execute()
        return res.data[0] if res.data else {}

    def delete_folder(self, user_id: str, folder_id: str) -> bool:
        # RLS ensures user owns folder, but since we use Service Key, we MUST filter by user_id explicitely
        res = self.supabase.table('folders').delete().eq('id', folder_id).eq('user_id', user_id).execute()
        return len(res.data) > 0

    def add_bookmark(self, user_id: str, legal_unit_id: str, folder_id: Optional[str] = None, note: Optional[str] = None) -> Dict:
        data = {
            "user_id": user_id,
            "legal_unit_id": legal_unit_id,
            "folder_id": folder_id,
            "note": note
        }
        res = self.supabase.table('bookmarks').insert(data).execute()
        return res.data[0] if res.data else {}

    def remove_bookmark(self, user_id: str, bookmark_id: str) -> bool:
        res = self.supabase.table('bookmarks').delete().eq('id', bookmark_id).eq('user_id', user_id).execute()
        return len(res.data) > 0
