"""
Hybrid search service combining semantic and keyword search
"""
from typing import List, Dict, Any, Optional
from app.services.semantic_search import get_semantic_search
from app.services.keyword_search import get_keyword_search
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class HybridSearchService:
    """Hybrid search combining semantic and keyword search"""
    
    def __init__(self):
        self.semantic_search = get_semantic_search()
        self.keyword_search = get_keyword_search()
    
    def search(
        self,
        query: str,
        year: Optional[int] = None,
        issue_number: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining semantic and keyword results
        
        Args:
            query: Search query text
            year: Filter by year (optional)
            issue_number: Filter by issue number (optional)
            limit: Maximum results to return
            offset: Pagination offset
            
        Returns:
            List of search results with combined scores
        """
        try:
            # Get results from both search methods
            semantic_results = []
            try:
                semantic_results = self.semantic_search.search(
                    query, year, issue_number, limit=50, offset=0
                )
            except Exception as semantic_e:
                logger.error(f"Semantic search failed (possibly API billing issue), falling back to keyword only: {semantic_e}")
                
            keyword_results = self.keyword_search.search(
                query, year, issue_number, limit=50, offset=0
            )
            
            # Combine and re-rank results
            combined = self._combine_results(semantic_results, keyword_results)
            
            # Apply pagination
            return combined[offset:offset + limit]
            
        except Exception as e:
            logger.error(f"Hybrid search error: {e}")
            raise
    
    def _combine_results(
        self,
        semantic_results: List[Dict[str, Any]],
        keyword_results: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Combine and re-rank results from semantic and keyword search
        
        Uses weighted scoring: semantic_weight * semantic_score + keyword_weight * keyword_score
        """
        # Create a dictionary to store combined scores
        combined_scores = {}
        
        # Add semantic results
        for result in semantic_results:
            key = result["id"]
            combined_scores[key] = {
                **result,
                "semantic_score": result["similarity"],
                "keyword_score": 0.0,
                "final_score": result["similarity"] * settings.SEMANTIC_WEIGHT
            }
        
        # Add keyword results
        for result in keyword_results:
            key = result["id"]
            if key in combined_scores:
                # Result appears in both - update scores
                combined_scores[key]["keyword_score"] = result["similarity"]
                combined_scores[key]["final_score"] += result["similarity"] * settings.KEYWORD_WEIGHT
            else:
                # Result only in keyword search
                combined_scores[key] = {
                    **result,
                    "semantic_score": 0.0,
                    "keyword_score": result["similarity"],
                    "final_score": result["similarity"] * settings.KEYWORD_WEIGHT
                }
        
        # Convert to list and sort by final score
        results = list(combined_scores.values())
        results.sort(key=lambda x: x["final_score"], reverse=True)
        
        # Update match_type and score
        for result in results:
            if result["semantic_score"] > 0 and result["keyword_score"] > 0:
                result["match_type"] = "hybrid"
            result["similarity"] = result["final_score"]
            # Remove intermediate scores
            del result["semantic_score"]
            del result["keyword_score"]
            del result["final_score"]
        
        return results


# Singleton instance
_hybrid_search_service = None

def get_hybrid_search() -> HybridSearchService:
    """Get hybrid search service instance"""
    global _hybrid_search_service
    if _hybrid_search_service is None:
        _hybrid_search_service = HybridSearchService()
    return _hybrid_search_service
