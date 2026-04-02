"""
Keyword search service using PostgreSQL full-text search
"""
from typing import List, Dict, Any, Optional
from app.db import get_supabase
import logging

logger = logging.getLogger(__name__)


class KeywordSearchService:
    """Keyword search using PostgreSQL full-text search"""
    
    def __init__(self):
        self.supabase = get_supabase()
    
    def search(
        self,
        query: str,
        year: Optional[int] = None,
        issue_number: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Perform keyword search using PostgreSQL full-text search
        
        Args:
            query: Search query text
            year: Filter by year (optional)
            issue_number: Filter by issue number (optional)
            limit: Maximum results to return
            offset: Pagination offset
            
        Returns:
            List of search results with relevance scores
        """
        try:
            # Build RPC call for full-text search
            rpc_params = {
                "search_query": query,
                "match_count": limit + offset
            }
            
            # Add filters if provided
            if year:
                rpc_params["filter_year"] = year
            if issue_number:
                rpc_params["filter_issue"] = issue_number
            
            # Execute search
            response = self.supabase.rpc(
                "search_legal_units_keyword",
                rpc_params
            ).execute()
            
            results = []
            for row in response.data[offset:offset + limit]:
                results.append({
                    "id": str(row["id"]),
                    "issue_id": row["issue_id"],
                    "type": row.get("type"),
                    "unit_number": row.get("unit_number"),
                    "title": row.get("title"),
                    "issuer": row.get("issuer"),
                    "effective_date": row.get("effective_date"),
                    "is_table": row.get("is_table", False),
                    "content_preview": row.get("content", ""),
                    "similarity": float(row["rank"]),
                    "source": {
                        "issue_number": int(row["issue_number"]) if str(row["issue_number"]).isdigit() else 0,
                        "year": row["year"],
                        "page_number": row.get("page_number")
                    },
                    "match_type": "keyword"
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Keyword search error: {e}")
            raise


# Singleton instance
_keyword_search_service = None

def get_keyword_search() -> KeywordSearchService:
    """Get keyword search service instance"""
    global _keyword_search_service
    if _keyword_search_service is None:
        _keyword_search_service = KeywordSearchService()
    return _keyword_search_service
