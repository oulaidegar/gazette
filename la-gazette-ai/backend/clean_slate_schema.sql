-- Clean Slate Schema for Lebanese Gazette Advanced OCR Data
-- This schema is optimized for legal unit search and retrieval

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop old tables if they exist (clean slate)
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS issues CASCADE;

-- ============================================
-- ISSUES TABLE
-- ============================================
-- Stores metadata for each Gazette issue
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_number INTEGER NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    total_pages INTEGER,
    publication_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEGAL UNITS TABLE
-- ============================================
-- Stores individual legal units (laws, decrees, decisions, etc.)
CREATE TABLE legal_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    
    -- Identification
    type TEXT CHECK (type IN ('law', 'decree', 'decision', 'notice', 'circular', 'table', 'other')),
    unit_number TEXT,  -- e.g., "14539" or "2024/12"
    title TEXT,
    issuer TEXT,  -- e.g., "وزارة المالية" (Ministry of Finance)
    
    -- Dates
    effective_date DATE,
    
    -- Content
    content TEXT NOT NULL,  -- Full Arabic text
    
    -- Table support
    is_table BOOLEAN DEFAULT FALSE,
    table_data JSONB,  -- Structured table data if is_table = true
    
    -- Metadata
    page_number INTEGER,
    is_supplement BOOLEAN DEFAULT FALSE,
    
    -- Vector search
    embedding vector(1024),  -- Cohere embed-multilingual-v3.0
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Vector similarity search (HNSW index for fast approximate nearest neighbor)
CREATE INDEX idx_legal_units_embedding ON legal_units 
USING hnsw (embedding vector_cosine_ops);

-- Filter indexes
CREATE INDEX idx_legal_units_type ON legal_units(type);
CREATE INDEX idx_legal_units_issuer ON legal_units(issuer);
CREATE INDEX idx_legal_units_year ON legal_units(issue_id);
CREATE INDEX idx_legal_units_effective_date ON legal_units(effective_date);

-- Full-text search index for Arabic content
CREATE INDEX idx_legal_units_content_fts ON legal_units 
USING gin(to_tsvector('arabic', content));

-- Issue lookup
CREATE INDEX idx_issues_year ON issues(year);
CREATE INDEX idx_issues_number ON issues(issue_number);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search legal units by semantic similarity
CREATE OR REPLACE FUNCTION search_legal_units(
    query_embedding vector(1024),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    type text,
    unit_number text,
    title text,
    issuer text,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        legal_units.id,
        legal_units.type,
        legal_units.unit_number,
        legal_units.title,
        legal_units.issuer,
        legal_units.content,
        1 - (legal_units.embedding <=> query_embedding) as similarity
    FROM legal_units
    WHERE 1 - (legal_units.embedding <=> query_embedding) > match_threshold
    ORDER BY legal_units.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE issues IS 'Metadata for each Lebanese Official Gazette issue';
COMMENT ON TABLE legal_units IS 'Individual legal units (laws, decrees, decisions) extracted from Gazette issues';
COMMENT ON COLUMN legal_units.embedding IS 'Cohere multilingual embedding (1024 dimensions) for semantic search';
COMMENT ON COLUMN legal_units.table_data IS 'Structured JSON data if the unit contains a table';
COMMENT ON FUNCTION search_legal_units IS 'Semantic search function using vector similarity';
