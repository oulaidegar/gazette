"""
Configuration management using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", description="API host")
    API_PORT: int = Field(default=8000, description="API port")
    API_WORKERS: int = Field(default=4, description="Number of workers")
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000"],
        description="Allowed CORS origins"
    )
    
    # Supabase Configuration
    SUPABASE_URL: str = Field(..., description="Supabase project URL")
    SUPABASE_SERVICE_KEY: str = Field(..., description="Supabase service role key")
    
    # Cohere Configuration
    COHERE_API_KEY: str = Field(..., description="Cohere API key")
    
    # Search Configuration
    SEMANTIC_WEIGHT: float = Field(default=0.6, description="Weight for semantic search")
    KEYWORD_WEIGHT: float = Field(default=0.4, description="Weight for keyword search")
    SIMILARITY_THRESHOLD: float = Field(default=0.7, description="Minimum similarity score")
    MAX_RESULTS: int = Field(default=50, description="Maximum results per query")
    
    # Redis Configuration (optional)
    REDIS_HOST: str = Field(default="localhost", description="Redis host")
    REDIS_PORT: int = Field(default=6379, description="Redis port")
    REDIS_DB: int = Field(default=0, description="Redis database number")
    REDIS_PASSWORD: str = Field(default="", description="Redis password")
    REDIS_ENABLED: bool = Field(default=False, description="Enable Redis caching")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, description="Enable rate limiting")
    RATE_LIMIT_ANONYMOUS: int = Field(default=60, description="Requests per hour for anonymous users")
    RATE_LIMIT_AUTHENTICATED: int = Field(default=300, description="Requests per hour for authenticated users")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Global settings instance
settings = Settings()
