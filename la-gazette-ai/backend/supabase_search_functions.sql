-- Backend Search Schema Migration for advanced legal_units

-- 1. Keyword Search RPC
CREATE OR REPLACE FUNCTION search_legal_units_keyword(
    search_query text,
    match_count int,
    filter_year int DEFAULT NULL,
    filter_issue text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    issue_id uuid,
    issue_number text,
    year int,
    page_number int,
    title text,
    type text,
    issuer text,
    content text,
    rank real
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.issue_id,
        i.issue_number,
        i.year,
        l.page_number,
        l.title,
        l.type,
        l.issuer,
        l.content,
        ts_rank(to_tsvector('arabic', COALESCE(l.content, '')), plainto_tsquery('arabic', search_query))::real AS rank
    FROM legal_units l
    JOIN issues i ON l.issue_id = i.id
    WHERE
        to_tsvector('arabic', COALESCE(l.content, '')) @@ plainto_tsquery('arabic', search_query)
        AND (filter_year IS NULL OR i.year = filter_year)
        AND (filter_issue IS NULL OR i.issue_number = filter_issue)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$;


-- 2. Semantic Search RPC
CREATE OR REPLACE FUNCTION search_legal_units_semantic(
    query_embedding vector(1024), -- Adjust dimensions if your Cohere model outputs different dims (embed-multilingual-v3.0 is 1024)
    match_threshold float,
    match_count int,
    filter_year int DEFAULT NULL,
    filter_issue text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    issue_id uuid,
    issue_number text,
    year int,
    page_number int,
    title text,
    type text,
    issuer text,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.id,
        l.issue_id,
        i.issue_number,
        i.year,
        l.page_number,
        l.title,
        l.type,
        l.issuer,
        l.content,
        1 - (l.embedding <=> query_embedding) AS similarity
    FROM legal_units l
    JOIN issues i ON l.issue_id = i.id
    WHERE
        1 - (l.embedding <=> query_embedding) > match_threshold
        AND (filter_year IS NULL OR i.year = filter_year)
        AND (filter_issue IS NULL OR i.issue_number = filter_issue)
    ORDER BY l.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
