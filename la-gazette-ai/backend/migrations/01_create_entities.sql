-- Create entities table (People, Organizations, Locations, etc.)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- PERSON, ORG, LOC, MISC
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, type)
);

-- Associate entities with legal units (Many-to-Many)
CREATE TABLE IF NOT EXISTS legal_unit_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_unit_id UUID NOT NULL REFERENCES legal_units(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    label TEXT, -- Specific label if needed (e.g., 'Appellant')
    confidence FLOAT, -- Confidence score from GLiNER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(legal_unit_id, entity_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_lue_unit ON legal_unit_entities(legal_unit_id);
CREATE INDEX IF NOT EXISTS idx_lue_entity ON legal_unit_entities(entity_id);

-- Add comments
COMMENT ON TABLE entities IS 'Named entities extracted from legal texts using GLiNER';
COMMENT ON TABLE legal_unit_entities IS 'Association between legal units and extracted entities';
