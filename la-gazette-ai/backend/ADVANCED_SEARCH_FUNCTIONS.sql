-- Advanced Search Functions for "Legal Units"
-- Run this in Supabase SQL Editor after ADVANCED_SCHEMA.sql

-- 1. Semantic Search for Legal Units
CREATE OR REPLACE FUNCTION search_units_semantic(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 20,
  filter_year int DEFAULT NULL,
  filter_type text DEFAULT NULL,
  filter_ministry_id uuid DEFAULT NULL
)
RETURNS TABLE (
  unit_id uuid,
  unit_number text,
  title text,
  unit_type text,
  effective_date date,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.unit_number,
    u.title,
    u.unit_type,
    u.effective_date,
    u.content,
    1 - (u.embedding <=> query_embedding) AS similarity
  FROM legal_units u
  JOIN issues i ON u.issue_id = i.id
  WHERE 1 - (u.embedding <=> query_embedding) > match_threshold
    AND (filter_year IS NULL OR i.year = filter_year)
    AND (filter_type IS NULL OR u.unit_type = filter_type)
    AND (filter_ministry_id IS NULL OR u.primary_entity_id = filter_ministry_id)
  ORDER BY u.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Keyword Search for Legal Units (Full Text)
-- Make sure to create the TSVECTOR index first!
CREATE INDEX IF NOT EXISTS idx_legal_units_content_ts 
ON legal_units 
USING GIN (to_tsvector('arabic', content));

CREATE OR REPLACE FUNCTION search_units_keyword(
  search_query text,
  match_count int DEFAULT 20,
  filter_year int DEFAULT NULL,
  filter_type text DEFAULT NULL
)
RETURNS TABLE (
  unit_id uuid,
  unit_number text,
  title text,
  unit_type text,
  effective_date date,
  content text,
  rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.unit_number,
    u.title,
    u.unit_type,
    u.effective_date,
    u.content,
    ts_rank(to_tsvector('arabic', u.content), plainto_tsquery('arabic', search_query)) AS rank
  FROM legal_units u
  JOIN issues i ON u.issue_id = i.id
  WHERE to_tsvector('arabic', u.content) @@ plainto_tsquery('arabic', search_query)
    AND (filter_year IS NULL OR i.year = filter_year)
    AND (filter_type IS NULL OR u.unit_type = filter_type)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
