-- Lebanese Gazette DATABASE REPAIR & OPTIMIZATION
-- Run this in the Supabase SQL Editor to fix constraints and enable Pro features

-- 1. Fix the Issues Constraint
-- We need to allow the same issue_number in different years
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_issue_number_key;
ALTER TABLE issues ADD CONSTRAINT unique_issue_per_year UNIQUE (issue_number, year);

-- 2. Adjust memory for index creation
-- 128MB is a safe value for the standard Pro tier compute (1GB RAM)
SET maintenance_work_mem = '128MB';

-- 3. Enable High-Performance Vector Search (HNSW)
-- This makes semantic search significantly faster as we add more years
DROP INDEX IF EXISTS idx_blocks_embedding;
CREATE INDEX IF NOT EXISTS blocks_embedding_idx 
ON blocks 
USING hnsw (embedding vector_cosine_ops);

-- 4. Update Search Functions to handle the new indexing
CREATE OR REPLACE FUNCTION search_blocks_semantic(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.5, -- Lowered slightly for more results
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
    1 - (b.embedding <=> query_embedding) AS similarity
  FROM blocks b
  JOIN issues i ON b.issue_id = i.id
  WHERE (filter_year IS NULL OR i.year = filter_year)
    AND (filter_issue IS NULL OR i.issue_number::text = filter_issue)
    AND 1 - (b.embedding <=> query_embedding) > match_threshold
  ORDER BY b.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
