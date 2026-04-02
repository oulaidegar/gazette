"""
Issues API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models import IssueMetadata
from app.db import get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["issues"])


@router.get("/issues", response_model=List[IssueMetadata])
async def list_issues(
    year: int | None = None,
    limit: int = 100,
    offset: int = 0
):
    """
    List all gazette issues
    
    Args:
        year: Filter by year (optional)
        limit: Maximum results to return
        offset: Pagination offset
    """
    try:
        supabase = get_supabase()
        query = supabase.table("issues").select("*")
        
        if year:
            query = query.eq("year", year)
        
        query = query.order("year", desc=True).order("issue_number", desc=True)
        query = query.range(offset, offset + limit - 1)
        
        response = query.execute()
        
        return [IssueMetadata(**row) for row in response.data]
        
    except Exception as e:
        logger.error(f"Error listing issues: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list issues: {str(e)}")


@router.get("/issues/{issue_id}", response_model=IssueMetadata)
async def get_issue(issue_id: str):
    """Get issue details by ID"""
    try:
        supabase = get_supabase()
        response = supabase.table("issues").select("*").eq("id", issue_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Issue not found")
        
        return IssueMetadata(**response.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting issue: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get issue: {str(e)}")
