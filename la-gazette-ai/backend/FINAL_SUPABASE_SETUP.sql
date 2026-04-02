-- Lebanese Gazette COMPLETE DATABASE SETUP
-- Run this in the Supabase SQL Editor to ensure everything is correctly configured

-- 0. Enable Vector Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Fix the Issues Constraint
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_issue_number_key;
ALTER TABLE issues DROP CONSTRAINT IF EXISTS unique_issue_per_year;
ALTER TABLE issues ADD CONSTRAINT unique_issue_per_year UNIQUE (issue_number, year);

-- 2. Adjust memory for index creation
SET maintenance_work_mem = '128MB';

-- 3. Enable High-Performance Vector Search (HNSW)
DROP INDEX IF EXISTS idx_blocks_embedding;
DROP INDEX IF EXISTS blocks_embedding_idx;
CREATE INDEX IF NOT EXISTS blocks_embedding_idx 
ON blocks 
USING hnsw (embedding vector_cosine_ops);

-- 4. Create index for full-text search
CREATE INDEX IF NOT EXISTS blocks_text_search_idx 
ON blocks 
USING GIN (to_tsvector('arabic', text));

-- 5. Semantic Search Function
CREATE OR REPLACE FUNCTION search_blocks_semantic(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10,
  filter_year int DEFAULT NULL,
  filter_issue text DEFAULT NULL
)
RETURNS TABLE (
  issue_id uuid,
  issue_number text,
  year int,
  page_number int,
  block_index int,
  text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.issue_id,
    i.issue_number::text,
    i.year,
    b.page_number,
    b.block_index,
    b.text,
    (1 - (b.embedding <=> query_embedding))::float8 AS similarity
  FROM blocks b
  JOIN issues i ON b.issue_id = i.id
  WHERE (filter_year IS NULL OR i.year = filter_year)
    AND (filter_issue IS NULL OR i.issue_number::text = filter_issue)
    AND 1 - (b.embedding <=> query_embedding) > match_threshold
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Keyword Search Function
CREATE OR REPLACE FUNCTION search_blocks_keyword(
  search_query text,
  match_count int DEFAULT 10,
  filter_year int DEFAULT NULL,
  filter_issue text DEFAULT NULL
)
RETURNS TABLE (
  issue_id uuid,
  issue_number text,
  year int,
  page_number int,
  block_index int,
  text text,
  rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.issue_id,
    i.issue_number::text,
    i.year,
    b.page_number,
    b.block_index,
    b.text,
    ts_rank(to_tsvector('arabic', b.text), plainto_tsquery('arabic', search_query))::float8 AS rank
  FROM blocks b
  JOIN issues i ON b.issue_id = i.id
  WHERE to_tsvector('arabic', b.text) @@ plainto_tsquery('arabic', search_query)
    AND (filter_year IS NULL OR i.year = filter_year)
    AND (filter_issue IS NULL OR i.issue_number::text = filter_issue)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
