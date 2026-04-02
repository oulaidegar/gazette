"""
Pydantic models for search requests and responses
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class SearchRequest(BaseModel):
    """Search request parameters"""
    query: str = Field(..., description="Search query text", min_length=1)
    year: Optional[int] = Field(None, description="Filter by year", ge=2014, le=2025)
    issue_number: Optional[str] = Field(None, description="Filter by issue number")
    limit: int = Field(10, description="Maximum results to return", ge=1, le=50)
    offset: int = Field(0, description="Pagination offset", ge=0)
    mode: Literal["hybrid", "semantic", "keyword"] = Field(
        "hybrid",
        description="Search mode"
    )


class SourceModel(BaseModel):
    issue_number: int
    year: int
    page_number: Optional[int] = None

class SearchResult(BaseModel):
    """Single search result matching LegalUnitSummary shape"""
    id: str = Field(default="")
    issue_id: str = Field(default="")
    type: Optional[str] = None
    unit_number: Optional[str] = None
    title: Optional[str] = None
    issuer: Optional[str] = None
    effective_date: Optional[str] = None
    is_table: bool = False
    content_preview: str
    similarity: float = Field(..., description="Relevance score (0-1)")
    source: SourceModel
    match_type: Literal["semantic", "keyword", "hybrid"]


class SearchResponse(BaseModel):
    """Search response with results"""
    query: str
    total_results: int
    results: List[SearchResult]
    search_time_ms: float


class IssueMetadata(BaseModel):
    """Issue metadata"""
    id: str
    issue_number: str
    year: int
    total_pages: int
    total_blocks: int
    file_path: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    database: str
