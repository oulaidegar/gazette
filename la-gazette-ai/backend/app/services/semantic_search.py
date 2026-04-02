"""
Semantic search service using Cohere embeddings and pgvector
"""
from typing import List, Dict, Any, Optional
import cohere
from app.config import settings
from app.db import get_supabase
import logging

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """Semantic search using vector similarity"""
    
    def __init__(self):
        self.cohere_client = cohere.ClientV2(api_key=settings.COHERE_API_KEY)
        self.supabase = get_supabase()
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for query text"""
        try:
            response = self.cohere_client.embed(
                texts=[text],
                model='embed-multilingual-v3.0',
                input_type='search_query',
                embedding_types=["float"]
            )
            return response.embeddings.float_[0]
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def search(
        self,
        query: str,
        year: Optional[int] = None,
        issue_number: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic search using vector similarity
        
        Args:
            query: Search query text
            year: Filter by year (optional)
            issue_number: Filter by issue number (optional)
            limit: Maximum results to return
            offset: Pagination offset
            
        Returns:
            List of search results with similarity scores
        """
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Build RPC call for vector similarity search
            rpc_params = {
                "query_embedding": query_embedding,
                "match_threshold": settings.SIMILARITY_THRESHOLD,
                "match_count": min(limit, settings.MAX_RESULTS)
            }
            
            # Add filters if provided
            if year:
                rpc_params["filter_year"] = year
            if issue_number:
                rpc_params["filter_issue"] = issue_number
            
            # Execute search
            response = self.supabase.rpc(
                "search_legal_units_semantic",
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
                    "similarity": float(row["similarity"]),
                    "source": {
                        "issue_number": int(row["issue_number"]) if str(row["issue_number"]).isdigit() else 0,
                        "year": row["year"],
                        "page_number": row.get("page_number")
                    },
                    "match_type": "semantic"
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Semantic search error: {e}")
            raise


# Singleton instance
_semantic_search_service = None

def get_semantic_search() -> SemanticSearchService:
    """Get semantic search service instance"""
    global _semantic_search_service
    if _semantic_search_service is None:
        _semantic_search_service = SemanticSearchService()
    return _semantic_search_service
