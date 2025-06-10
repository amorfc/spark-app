-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create enum for feature types
CREATE TYPE feature_type AS ENUM (
    'district',
    'neighborhood', 
    'bus_stop',
    'tram_station',
    'ferry_terminal',
    'metro_station',
    'other_transport'
);

-- Create the main OSM features table
CREATE TABLE IF NOT EXISTS osm_features (
    supabase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id BIGINT NOT NULL UNIQUE, -- OSM ID
    name TEXT,
    name_en TEXT, -- English name if available
    name_tr TEXT, -- Turkish name if available
    feature_type feature_type NOT NULL,
    full_address TEXT,
    city TEXT, -- City name
    country TEXT DEFAULT 'Turkey', -- Country name
    search_text TEXT, -- Concatenated searchable text
    tags JSONB, -- Store all OSM tags
    
    -- Geometry fields
    geometry GEOMETRY, -- Original geometry (polygon or point)
    center_coordinate GEOMETRY(POINT, 4326), -- Calculated centroid
    
    -- Administrative hierarchy
    admin_level INTEGER,
    parent_district_id BIGINT, -- Reference to parent district
    parent_neighborhood_id BIGINT, -- Reference to parent neighborhood
    
    -- Metadata
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    data_source TEXT DEFAULT 'osm',
    
    -- Search optimization
    search_vector TSVECTOR,
    
    CONSTRAINT valid_geometry CHECK (ST_IsValid(geometry)),
    CONSTRAINT valid_center CHECK (ST_IsValid(center_coordinate))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_osm_features_ref_id 
    ON osm_features (ref_id);

CREATE INDEX IF NOT EXISTS idx_osm_features_feature_type 
    ON osm_features (feature_type);

CREATE INDEX IF NOT EXISTS idx_osm_features_name 
    ON osm_features (name);

CREATE INDEX IF NOT EXISTS idx_osm_features_city 
    ON osm_features (city);

CREATE INDEX IF NOT EXISTS idx_osm_features_country 
    ON osm_features (country);

-- Spatial indexes (most important for performance)
CREATE INDEX IF NOT EXISTS idx_osm_features_geometry_gist 
    ON osm_features USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_osm_features_center_gist 
    ON osm_features USING GIST (center_coordinate);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_osm_features_search_vector 
    ON osm_features USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_osm_features_search_text_gin 
    ON osm_features USING GIN (search_text gin_trgm_ops);

-- JSONB index for tags
CREATE INDEX IF NOT EXISTS idx_osm_features_tags_gin 
    ON osm_features USING GIN (tags);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_osm_features_type_name 
    ON osm_features (feature_type, name);

CREATE INDEX IF NOT EXISTS idx_osm_features_admin_level 
    ON osm_features (admin_level) WHERE admin_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_osm_features_city_type 
    ON osm_features (city, feature_type);

CREATE INDEX IF NOT EXISTS idx_osm_features_country_city 
    ON osm_features (country, city);

-- Function to update search_text and search_vector
CREATE OR REPLACE FUNCTION update_search_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Update search_text with concatenated searchable fields including city and country
    NEW.search_text := COALESCE(NEW.name, '') || ' ' ||
                      COALESCE(NEW.name_en, '') || ' ' ||
                      COALESCE(NEW.name_tr, '') || ' ' ||
                      COALESCE(NEW.full_address, '') || ' ' ||
                      COALESCE(NEW.city, '') || ' ' ||
                      COALESCE(NEW.country, '');
    
    -- Update search_vector for full-text search
    NEW.search_vector := to_tsvector('turkish', NEW.search_text);
    
    -- Auto-calculate center_coordinate if not provided
    IF NEW.center_coordinate IS NULL AND NEW.geometry IS NOT NULL THEN
        NEW.center_coordinate := ST_Centroid(NEW.geometry);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search fields
DROP TRIGGER IF EXISTS update_search_fields_trigger ON osm_features;
CREATE TRIGGER update_search_fields_trigger
    BEFORE INSERT OR UPDATE ON osm_features
    FOR EACH ROW
    EXECUTE FUNCTION update_search_fields();

-- Function for efficient UPSERT (required parameters first, then optional with defaults)
CREATE OR REPLACE FUNCTION upsert_osm_feature(
    p_ref_id BIGINT,
    p_name TEXT,
    p_feature_type feature_type,
    p_name_en TEXT DEFAULT NULL,
    p_name_tr TEXT DEFAULT NULL,
    p_full_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_country TEXT DEFAULT 'Turkey',
    p_tags JSONB DEFAULT NULL,
    p_geometry GEOMETRY DEFAULT NULL,
    p_center_coordinate GEOMETRY DEFAULT NULL,
    p_admin_level INTEGER DEFAULT NULL,
    p_parent_district_id BIGINT DEFAULT NULL,
    p_parent_neighborhood_id BIGINT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
BEGIN
    INSERT INTO osm_features (
        ref_id, name, name_en, name_tr, feature_type, full_address,
        city, country, tags, geometry, center_coordinate, admin_level,
        parent_district_id, parent_neighborhood_id, last_updated
    )
    VALUES (
        p_ref_id, p_name, p_name_en, p_name_tr, p_feature_type, p_full_address,
        p_city, p_country, p_tags, p_geometry, p_center_coordinate, p_admin_level,
        p_parent_district_id, p_parent_neighborhood_id, NOW()
    )
    ON CONFLICT (ref_id) DO UPDATE SET
        name = EXCLUDED.name,
        name_en = EXCLUDED.name_en,
        name_tr = EXCLUDED.name_tr,
        feature_type = EXCLUDED.feature_type,
        full_address = EXCLUDED.full_address,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        tags = EXCLUDED.tags,
        geometry = EXCLUDED.geometry,
        center_coordinate = EXCLUDED.center_coordinate,
        admin_level = EXCLUDED.admin_level,
        parent_district_id = EXCLUDED.parent_district_id,
        parent_neighborhood_id = EXCLUDED.parent_neighborhood_id,
        last_updated = NOW()
    RETURNING supabase_id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get features by bounding box
CREATE OR REPLACE FUNCTION get_features_in_bbox(
    p_bbox_west FLOAT,
    p_bbox_south FLOAT, 
    p_bbox_east FLOAT,
    p_bbox_north FLOAT,
    p_feature_types TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    supabase_id UUID,
    ref_id BIGINT,
    name TEXT,
    name_en TEXT,
    name_tr TEXT,
    feature_type feature_type,
    full_address TEXT,
    city TEXT,
    country TEXT,
    center_lat FLOAT,
    center_lng FLOAT,
    admin_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.supabase_id,
        f.ref_id,
        f.name,
        f.name_en,
        f.name_tr,
        f.feature_type,
        f.full_address,
        f.city,
        f.country,
        ST_Y(f.center_coordinate) as center_lat,
        ST_X(f.center_coordinate) as center_lng,
        f.admin_level
    FROM osm_features f
    WHERE ST_Intersects(
        f.geometry,
        ST_MakeEnvelope(p_bbox_west, p_bbox_south, p_bbox_east, p_bbox_north, 4326)
    )
    AND (p_feature_types IS NULL OR f.feature_type = ANY(p_feature_types))
    ORDER BY f.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function for full-text search
CREATE OR REPLACE FUNCTION search_features_by_text(
    p_search_text TEXT,
    p_feature_types TEXT[] DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    supabase_id UUID,
    ref_id BIGINT,
    name TEXT,
    name_en TEXT,
    name_tr TEXT,
    feature_type feature_type,
    full_address TEXT,
    city TEXT,
    country TEXT,
    center_lat FLOAT,
    center_lng FLOAT,
    admin_level INTEGER,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.supabase_id,
        f.ref_id,
        f.name,
        f.name_en,
        f.name_tr,
        f.feature_type,
        f.full_address,
        f.city,
        f.country,
        ST_Y(f.center_coordinate) as center_lat,
        ST_X(f.center_coordinate) as center_lng,
        f.admin_level,
        ts_rank(f.search_vector, websearch_to_tsquery('turkish', p_search_text)) as rank
    FROM osm_features f
    WHERE f.search_vector @@ websearch_to_tsquery('turkish', p_search_text)
    AND (p_feature_types IS NULL OR f.feature_type = ANY(p_feature_types))
    AND (p_city IS NULL OR f.city = p_city)
    AND (p_country IS NULL OR f.country = p_country)
    ORDER BY rank DESC, f.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies (optional, adjust based on your needs)
ALTER TABLE osm_features ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
DROP POLICY IF EXISTS "Allow read access to osm_features" ON osm_features;
CREATE POLICY "Allow read access to osm_features" 
    ON osm_features FOR SELECT 
    USING (true);

-- Allow insert/update for authenticated users (adjust as needed)
DROP POLICY IF EXISTS "Allow write access to osm_features" ON osm_features;
CREATE POLICY "Allow write access to osm_features" 
    ON osm_features FOR ALL 
    USING (auth.role() = 'authenticated');

-- Create some sample views for common queries
CREATE OR REPLACE VIEW districts AS
SELECT 
    supabase_id,
    ref_id,
    name,
    name_en,
    name_tr,
    city,
    country,
    ST_Y(center_coordinate) as center_lat,
    ST_X(center_coordinate) as center_lng,
    admin_level,
    last_updated
FROM osm_features 
WHERE feature_type = 'district'
ORDER BY name;

CREATE OR REPLACE VIEW neighborhoods AS
SELECT 
    supabase_id,
    ref_id,
    name,
    name_en,
    name_tr,
    city,
    country,
    ST_Y(center_coordinate) as center_lat,
    ST_X(center_coordinate) as center_lng,
    admin_level,
    parent_district_id,
    last_updated
FROM osm_features 
WHERE feature_type = 'neighborhood'
ORDER BY name;

CREATE OR REPLACE VIEW transport_stops AS
SELECT 
    supabase_id,
    ref_id,
    name,
    name_en,
    name_tr,
    feature_type,
    city,
    country,
    ST_Y(center_coordinate) as center_lat,
    ST_X(center_coordinate) as center_lng,
    full_address,
    tags,
    last_updated
FROM osm_features 
WHERE feature_type IN ('bus_stop', 'tram_station', 'ferry_terminal', 'metro_station', 'other_transport')
ORDER BY feature_type, name;

-- Add some utility functions for data analysis
CREATE OR REPLACE FUNCTION get_feature_counts()
RETURNS TABLE (
    feature_type feature_type,
    count BIGINT,
    cities TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.feature_type,
        COUNT(*) as count,
        ARRAY_AGG(DISTINCT f.city ORDER BY f.city) as cities
    FROM osm_features f
    GROUP BY f.feature_type
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get statistics
CREATE OR REPLACE FUNCTION get_osm_stats()
RETURNS TABLE (
    total_features BIGINT,
    districts BIGINT,
    neighborhoods BIGINT,
    transport_stops BIGINT,
    cities BIGINT,
    countries BIGINT,
    last_update TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_features,
        COUNT(*) FILTER (WHERE feature_type = 'district') as districts,
        COUNT(*) FILTER (WHERE feature_type = 'neighborhood') as neighborhoods,
        COUNT(*) FILTER (WHERE feature_type IN ('bus_stop', 'tram_station', 'ferry_terminal', 'metro_station', 'other_transport')) as transport_stops,
        COUNT(DISTINCT city) as cities,
        COUNT(DISTINCT country) as countries,
        MAX(last_updated) as last_update
    FROM osm_features;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE osm_features IS 'OpenStreetMap features including districts, neighborhoods, and transportation stops';
COMMENT ON COLUMN osm_features.ref_id IS 'Original OSM ID (parsed from relation/way/node format)';
COMMENT ON COLUMN osm_features.geometry IS 'Original PostGIS geometry (polygon or point)';
COMMENT ON COLUMN osm_features.center_coordinate IS 'Calculated centroid for quick location queries';
COMMENT ON COLUMN osm_features.search_text IS 'Concatenated searchable text for full-text search';
COMMENT ON COLUMN osm_features.search_vector IS 'Pre-computed tsvector for fast full-text search';
COMMENT ON COLUMN osm_features.tags IS 'All original OSM tags in JSONB format';

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT ON osm_features TO anon;
-- GRANT ALL ON osm_features TO authenticated;
-- GRANT EXECUTE ON FUNCTION upsert_osm_feature TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_features_in_bbox TO anon;
-- GRANT EXECUTE ON FUNCTION search_features_by_text TO anon;

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'OSM Features schema created successfully!';
    RAISE NOTICE 'Tables: osm_features';
    RAISE NOTICE 'Views: districts, neighborhoods, transport_stops';
    RAISE NOTICE 'Functions: upsert_osm_feature, get_features_in_bbox, search_features_by_text, get_feature_counts, get_osm_stats';
    RAISE NOTICE 'Ready to import OSM data!';
END $$;