"""
Search API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Literal
from app.models import SearchResponse, SearchResult
from app.services import get_semantic_search, get_keyword_search, get_hybrid_search
import time
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["search"])


@router.get("/search", response_model=SearchResponse)
async def search(
    query: str = Query(..., description="Search query text", min_length=1),
    year: Optional[int] = Query(None, description="Filter by year", ge=2014, le=2025),
    issue_number: Optional[str] = Query(None, description="Filter by issue number"),
    limit: int = Query(10, description="Maximum results", ge=1, le=50),
    offset: int = Query(0, description="Pagination offset", ge=0),
    mode: Literal["hybrid", "semantic", "keyword"] = Query("hybrid", description="Search mode")
):
    """
    Search Lebanese Gazette documents
    
    **Modes:**
    - `hybrid`: Combines semantic and keyword search (default, best results)
    - `semantic`: Vector similarity search (finds conceptually similar content)
    - `keyword`: Full-text search (finds exact terms)
    """
    start_time = time.time()
    
    try:
        # Select search service based on mode
        if mode == "semantic":
            service = get_semantic_search()
        elif mode == "keyword":
            service = get_keyword_search()
        else:  # hybrid
            service = get_hybrid_search()
        
        # Perform search
        results = service.search(
            query=query,
            year=year,
            issue_number=issue_number,
            limit=limit,
            offset=offset
        )
        
        # Calculate search time
        search_time_ms = (time.time() - start_time) * 1000
        
        return SearchResponse(
            query=query,
            total_results=len(results),
            results=[SearchResult(**r) for r in results],
            search_time_ms=search_time_ms
        )
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/search/semantic", response_model=SearchResponse)
async def search_semantic(
    query: str = Query(..., description="Search query text", min_length=1),
    year: Optional[int] = Query(None, description="Filter by year", ge=2014, le=2025),
    issue_number: Optional[str] = Query(None, description="Filter by issue number"),
    limit: int = Query(10, description="Maximum results", ge=1, le=50),
    offset: int = Query(0, description="Pagination offset", ge=0)
):
    """Semantic search using vector similarity"""
    return await search(query, year, issue_number, limit, offset, mode="semantic")


@router.get("/search/keyword", response_model=SearchResponse)
async def search_keyword(
    query: str = Query(..., description="Search query text", min_length=1),
    year: Optional[int] = Query(None, description="Filter by year", ge=2014, le=2025),
    issue_number: Optional[str] = Query(None, description="Filter by issue number"),
    limit: int = Query(10, description="Maximum results", ge=1, le=50),
    offset: int = Query(0, description="Pagination offset", ge=0)
):
    """Keyword search using full-text search"""
    return await search(query, year, issue_number, limit, offset, mode="keyword")
