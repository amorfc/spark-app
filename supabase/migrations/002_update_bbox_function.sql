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
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(
                json_build_object(
                    'type', 'Feature',
                    'id', feature_data.supabase_id,
                    'properties', json_build_object(
                        'supabase_id', feature_data.supabase_id,
                        'ref_id', feature_data.ref_id,
                        'name', feature_data.name,
                        'name_en', feature_data.name_en,
                        'name_tr', feature_data.name_tr,
                        'feature_type', feature_data.feature_type,
                        'full_address', feature_data.full_address,
                        'city', feature_data.city,
                        'country', feature_data.country,
                        'admin_level', feature_data.admin_level
                    ),
                    'geometry', json_build_object(
                        'type', 'Point',
                        'coordinates', json_build_array(
                            feature_data.lng,
                            feature_data.lat
                        )
                    )
                )
            ), '[]'::json)
        )
        FROM (
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
                f.admin_level,
                ST_X(f.center_coordinate) as lng,
                ST_Y(f.center_coordinate) as lat
            FROM osm_features f
            WHERE ST_Intersects(
                f.geometry,
                ST_MakeEnvelope(p_bbox_west, p_bbox_south, p_bbox_east, p_bbox_north, 4326)
            )
            AND (p_feature_types IS NULL OR f.feature_type::text = ANY(p_feature_types))
            AND (p_city IS NULL OR f.city ILIKE p_city)
            AND (p_country IS NULL OR f.country ILIKE p_country)
            ORDER BY f.name
            LIMIT p_limit
        ) feature_data
    );
END;
$$ LANGUAGE plpgsql;