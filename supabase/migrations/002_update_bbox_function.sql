DROP FUNCTION IF EXISTS get_features_in_bbox(FLOAT, FLOAT, FLOAT, FLOAT, TEXT[], TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION get_features_in_bbox(
    p_bbox_west FLOAT,
    p_bbox_south FLOAT, 
    p_bbox_east FLOAT,
    p_bbox_north FLOAT,
    p_feature_types TEXT[] DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
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
    AND (p_feature_types IS NULL OR f.feature_type::text = ANY(p_feature_types))
    AND (p_city IS NULL OR f.city ILIKE p_city)
    AND (p_country IS NULL OR f.country ILIKE p_country)
    ORDER BY f.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
