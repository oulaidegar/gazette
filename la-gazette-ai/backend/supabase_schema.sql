-- Lebanese Gazette Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number INTEGER UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  publication_date DATE,
  total_pages INTEGER,
  file_path TEXT,
  total_blocks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocks table with pgvector for embeddings
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  block_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  bbox JSONB,
  confidence FLOAT,
  embedding vector(1024), -- Cohere Multilingual v3 dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocks_issue_page ON blocks(issue_id, page_number);
CREATE INDEX IF NOT EXISTS idx_blocks_embedding ON blocks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_issues_year ON issues(year);
CREATE INDEX IF NOT EXISTS idx_issues_number ON issues(issue_number);

-- Full-text search support for Arabic
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS text_search tsvector 
  GENERATED ALWAYS AS (to_tsvector('arabic', text)) STORED;
CREATE INDEX IF NOT EXISTS idx_blocks_fts ON blocks USING gin(text_search);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Enable but allow all for now
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Policies for public read access (adjust based on your needs)
CREATE POLICY "Allow public read access to issues" ON issues
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blocks" ON blocks
    FOR SELECT USING (true);

-- For authenticated insert/update (you'll need service role key)
CREATE POLICY "Allow service role to insert issues" ON issues
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role to insert blocks" ON blocks
    FOR INSERT WITH CHECK (true);

-- Helper view for search results
CREATE OR REPLACE VIEW search_results AS
SELECT 
    b.id,
    b.text,
    b.page_number,
    b.block_index,
    b.confidence,
    b.bbox,
    i.issue_number,
    i.year,
    i.publication_date,
    i.total_pages
FROM blocks b
JOIN issues i ON b.issue_id = i.id;

-- Grant access to the view
GRANT SELECT ON search_results TO anon, authenticated;

COMMENT ON TABLE issues IS 'Lebanese Official Gazette issues metadata';
COMMENT ON TABLE blocks IS 'Text blocks extracted from gazette pages with embeddings';
COMMENT ON COLUMN blocks.embedding IS 'Cohere Multilingual v3 embedding (1024 dimensions)';
COMMENT ON COLUMN blocks.bbox IS 'Bounding box coordinates: {x, y, width, height}';
