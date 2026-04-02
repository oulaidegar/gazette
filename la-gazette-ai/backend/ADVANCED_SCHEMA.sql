-- Advanced Gazette Schema for Granular Legal Analysis

-- 1. ENTITIES (The Actors)
-- Ministries, Organizations, People mentioned in the gazette
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- "Ministry of Finance"
    type TEXT CHECK (type IN ('ministry', 'organization', 'person', 'company', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LEGAL UNITS (The Atoms)
-- A specific Law, Decree, or Decision (not just a page)
CREATE TABLE IF NOT EXISTS legal_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
    
    -- Identification
    unit_type TEXT CHECK (unit_type IN ('law', 'decree', 'decision', 'notice', 'circular', 'other')),
    unit_number TEXT, -- "1234" or "1234/2024"
    title TEXT, -- "Decree regulating solar energy"
    
    -- Metadata
    primary_entity_id UUID REFERENCES entities(id), -- Who issued it?
    publication_date DATE, -- From issue
    effective_date DATE, -- Extracted from text
    
    -- Content
    content TEXT NOT NULL, -- The full text of this unit
    summary TEXT, -- AI generated summary
    
    -- Vector Search
    embedding vector(1024), -- Cohere embedding of the content
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. UNIT RELATIONSHIPS (The Citation Graph)
-- How laws connect to each other
CREATE TABLE IF NOT EXISTS unit_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_unit_id UUID REFERENCES legal_units(id) ON DELETE CASCADE,
    target_unit_id UUID REFERENCES legal_units(id) ON DELETE CASCADE,
    relationship_type TEXT CHECK (relationship_type IN ('amends', 'cancels', 'references', 'supplements')),
    description TEXT, -- "Modifies Article 5"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DATA TABLES (Structured Data)
-- Tables extracted from the text (Budget figures, Lists)
CREATE TABLE IF NOT EXISTS data_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_unit_id UUID REFERENCES legal_units(id) ON DELETE CASCADE,
    title TEXT, -- "List of appointed teachers"
    data JSONB NOT NULL, -- The rows and columns as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_legal_units_embedding ON legal_units USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_legal_units_type ON legal_units(unit_type);
CREATE INDEX IF NOT EXISTS idx_legal_units_entity ON legal_units(primary_entity_id);
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
