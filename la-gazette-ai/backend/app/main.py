"""
Lebanese Gazette Search API
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models import HealthResponse
from app.api.v1 import search_router, issues_router
from app.db import get_supabase
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Lebanese Gazette Search API",
    description="Semantic and keyword search for Lebanese Official Gazette documents",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search_router)
app.include_router(issues_router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting Lebanese Gazette Search API")
    try:
        # Test database connection
        supabase = get_supabase()
        result = supabase.table("issues").select("id").limit(1).execute()
        logger.info(f"✅ Database connection successful ({len(result.data)} issues)")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise


from pydantic import BaseModel
from typing import Optional, Any, Dict

class FrontendSearchRequest(BaseModel):
    query: str
    limit: int = 10
    filters: Optional[Dict[str, Any]] = None

@app.post("/search", tags=["search"])
async def root_search_post(request: FrontendSearchRequest):
    """Support for POST /search from frontend api.ts"""
    from app.services import get_hybrid_search
    import time
    start_time = time.time()
    
    year = None
    issue_number = None
    if request.filters:
        try:
            if request.filters.get("year"):
                year = int(request.filters.get("year"))
        except:
            pass
        issue_number = request.filters.get("issue_number")
        if issue_number:
            issue_number = str(issue_number)
            
    service = get_hybrid_search()
    results = service.search(
        query=request.query,
        year=year,
        issue_number=issue_number,
        limit=request.limit,
        offset=0
    )
    
    query_time_ms = (time.time() - start_time) * 1000
    
    return {
        "results": results,
        "total": len(results),
        "query_time_ms": query_time_ms
    }

@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint"""
    try:
        supabase = get_supabase()
        supabase.table("issues").select("id").limit(1).execute()
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "disconnected"
    
    return HealthResponse(
        status="healthy" if db_status == "connected" else "unhealthy",
        version="1.0.0",
        database=db_status
    )


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Lebanese Gazette Search API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
