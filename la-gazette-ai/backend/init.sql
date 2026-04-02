-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Issues table
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  issue_number INTEGER UNIQUE NOT NULL,
  year INTEGER NOT NULL,
  publication_date DATE,
  total_pages INTEGER,
  file_path TEXT,
  ocr_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Text blocks table
CREATE TABLE blocks (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  block_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  bbox JSONB, -- {x, y, width, height}
  confidence FLOAT,
  embedding vector(1024), -- Cohere Multilingual v3 dimension
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_blocks_issue_page ON blocks(issue_id, page_number);
CREATE INDEX idx_blocks_embedding ON blocks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_blocks_text_trgm ON blocks USING gin (text gin_trgm_ops);
CREATE INDEX idx_issues_year ON issues(year);
CREATE INDEX idx_issues_number ON issues(issue_number);

-- Full-text search configuration for Arabic
CREATE TEXT SEARCH CONFIGURATION arabic_config (COPY = simple);
