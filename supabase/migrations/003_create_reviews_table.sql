-- Complete reviews system migration with all functions and fixes
-- Enhanced migration with ADVANCED PAGINATION for RPC functions

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_ref_id TEXT NOT NULL,
    safety_rating INTEGER NOT NULL CHECK (safety_rating >= 0 AND safety_rating <= 5),
    quality_rating INTEGER NOT NULL CHECK (quality_rating >= 0 AND quality_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to ensure one review per user per feature
ALTER TABLE public.reviews ADD CONSTRAINT unique_user_feature_review 
    UNIQUE (user_id, feature_ref_id);

-- Create indexes for better query performance
CREATE INDEX idx_reviews_feature_ref_id ON public.reviews(feature_ref_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX idx_reviews_composite_feature_user ON public.reviews(feature_ref_id, user_id);
-- Add cursor-based pagination index
CREATE INDEX idx_reviews_cursor_pagination ON public.reviews(created_at DESC, id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for review statistics per feature
CREATE VIEW public.review_stats AS
SELECT 
    feature_ref_id,
    COUNT(*) as total_reviews,
    ROUND(AVG(safety_rating), 2) as avg_safety_rating,
    ROUND(AVG(quality_rating), 2) as avg_quality_rating,
    ROUND(AVG((safety_rating + quality_rating) / 2.0), 2) as avg_overall_rating
FROM public.reviews
GROUP BY feature_ref_id;

-- Grant permissions on the view
GRANT SELECT ON public.review_stats TO authenticated;

-- =====================================================
-- ENHANCED RPC FUNCTIONS WITH ADVANCED PAGINATION
-- =====================================================

-- 1. Get comprehensive feature review data with FIXED cursor pagination
CREATE OR REPLACE FUNCTION get_feature_reviews_complete(
    p_feature_ref_id TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_cursor_id UUID DEFAULT NULL,
    p_cursor_created_at TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_review_data JSON;
    reviews_data JSON;
    stats_data JSON;
    total_count INTEGER;
    current_user_id UUID := auth.uid();
    next_cursor JSON := NULL;
    has_more BOOLEAN := FALSE;
BEGIN
    -- Get user's review (if exists)
    SELECT row_to_json(r) INTO user_review_data
    FROM public.reviews r
    WHERE r.feature_ref_id = p_feature_ref_id 
    AND r.user_id = current_user_id;
    
    -- Get total count for pagination metadata
    SELECT COUNT(*) INTO total_count
    FROM public.reviews r
    WHERE r.feature_ref_id = p_feature_ref_id;
    
    -- Get ALL reviews INCLUDING current user's review
    IF p_cursor_id IS NOT NULL AND p_cursor_created_at IS NOT NULL THEN
        -- Cursor-based pagination
        WITH review_data AS (
            SELECT 
                r.id,
                r.user_id,
                r.feature_ref_id,
                r.safety_rating,
                r.quality_rating,
                r.comment,
                r.created_at,
                r.updated_at,
                ROUND((r.safety_rating + r.quality_rating) / 2.0, 2) as avg_rating
            FROM public.reviews r
            WHERE r.feature_ref_id = p_feature_ref_id 
            -- REMOVED: AND (current_user_id IS NULL OR r.user_id != current_user_id)
            AND (r.created_at < p_cursor_created_at OR 
                 (r.created_at = p_cursor_created_at AND r.id < p_cursor_id))
            ORDER BY r.created_at DESC, r.id
            LIMIT p_limit + 1
        )
        SELECT json_agg(
            json_build_object(
                'id', id,
                'user_id', user_id,
                'feature_ref_id', feature_ref_id,
                'safety_rating', safety_rating,
                'quality_rating', quality_rating,
                'comment', comment,
                'created_at', created_at,
                'updated_at', updated_at,
                'avg_rating', avg_rating
            )
        ) INTO reviews_data
        FROM review_data;
    ELSE
        -- Offset-based pagination
        WITH review_data AS (
            SELECT 
                r.id,
                r.user_id,
                r.feature_ref_id,
                r.safety_rating,
                r.quality_rating,
                r.comment,
                r.created_at,
                r.updated_at,
                ROUND((r.safety_rating + r.quality_rating) / 2.0, 2) as avg_rating
            FROM public.reviews r
            WHERE r.feature_ref_id = p_feature_ref_id 
            -- REMOVED: AND (current_user_id IS NULL OR r.user_id != current_user_id)
            ORDER BY r.created_at DESC, r.id
            LIMIT p_limit + 1 OFFSET p_offset
        )
        SELECT json_agg(
            json_build_object(
                'id', id,
                'user_id', user_id,
                'feature_ref_id', feature_ref_id,
                'safety_rating', safety_rating,
                'quality_rating', quality_rating,
                'comment', comment,
                'created_at', created_at,
                'updated_at', updated_at,
                'avg_rating', avg_rating
            )
        ) INTO reviews_data
        FROM review_data;
    END IF;
    
    -- Handle pagination metadata
    IF json_array_length(COALESCE(reviews_data, '[]'::json)) > p_limit THEN
        has_more := TRUE;
        
        -- Remove the extra item
        SELECT json_agg(item) INTO reviews_data
        FROM (
            SELECT value as item
            FROM json_array_elements(reviews_data) WITH ORDINALITY
            WHERE ordinality <= p_limit
        ) sub;
        
        -- Get cursor from the last item
        IF json_array_length(reviews_data) > 0 THEN
            SELECT json_build_object(
                'id', last_item->>'id',
                'created_at', last_item->>'created_at'
            ) INTO next_cursor
            FROM (
                SELECT value as last_item
                FROM json_array_elements(reviews_data) WITH ORDINALITY
                WHERE ordinality = p_limit
            ) sub;
        END IF;
    END IF;
    
    -- Get statistics
    SELECT row_to_json(s) INTO stats_data
    FROM public.review_stats s
    WHERE s.feature_ref_id = p_feature_ref_id;
    
    -- Combine all data
    result := json_build_object(
        'data', json_build_object(
            'reviews', COALESCE(reviews_data, '[]'::json),
            'user_review', user_review_data,
            'stats', stats_data
        ),
        'pagination', json_build_object(
            'total_count', total_count,
            'page_size', p_limit,
            'current_offset', p_offset,
            'has_more', has_more,
            'has_previous', (p_offset > 0 OR p_cursor_id IS NOT NULL),
            'next_cursor', next_cursor,
            'total_pages', CEIL(total_count::DECIMAL / p_limit)
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enhanced recent reviews with advanced pagination
CREATE OR REPLACE FUNCTION get_recent_reviews_paginated(
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_cursor_id UUID DEFAULT NULL,
    p_cursor_created_at TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    reviews_data JSON;
    total_count INTEGER;
    next_cursor JSON := NULL;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count FROM public.reviews;
    
    -- Get reviews with cursor or offset pagination
    IF p_cursor_id IS NOT NULL AND p_cursor_created_at IS NOT NULL THEN
        -- Cursor-based pagination
        SELECT json_agg(
            json_build_object(
                'id', r.id,
                'feature_ref_id', r.feature_ref_id,
                'safety_rating', r.safety_rating,
                'quality_rating', r.quality_rating,
                'comment', r.comment,
                'created_at', r.created_at,
                'updated_at', r.updated_at,
                'avg_rating', ROUND((r.safety_rating + r.quality_rating) / 2.0, 2)
            ) ORDER BY r.created_at DESC, r.id
        ) INTO reviews_data
        FROM public.reviews r
        WHERE (r.created_at < p_cursor_created_at OR 
               (r.created_at = p_cursor_created_at AND r.id < p_cursor_id))
        ORDER BY r.created_at DESC, r.id
        LIMIT p_limit + 1;
    ELSE
        -- Offset-based pagination
        SELECT json_agg(
            json_build_object(
                'id', r.id,
                'feature_ref_id', r.feature_ref_id,
                'safety_rating', r.safety_rating,
                'quality_rating', r.quality_rating,
                'comment', r.comment,
                'created_at', r.created_at,
                'updated_at', r.updated_at,
                'avg_rating', ROUND((r.safety_rating + r.quality_rating) / 2.0, 2)
            ) ORDER BY r.created_at DESC, r.id
        ) INTO reviews_data
        FROM public.reviews r
        ORDER BY r.created_at DESC, r.id
        LIMIT p_limit + 1 OFFSET p_offset;
    END IF;
    
    -- Handle pagination metadata (simplified for brevity)
    IF json_array_length(COALESCE(reviews_data, '[]'::json)) > p_limit THEN
        -- Remove the extra item
        WITH ordered_reviews AS (
            SELECT 
                item,
                ROW_NUMBER() OVER (ORDER BY (item->>'created_at') DESC) as rn
            FROM json_array_elements(reviews_data) AS item
        )
        SELECT json_agg(item ORDER BY (item->>'created_at') DESC) INTO reviews_data
        FROM ordered_reviews
        WHERE rn <= p_limit;
    END IF;
    
    result := json_build_object(
        'data', COALESCE(reviews_data, '[]'::json),
        'pagination', json_build_object(
            'total_count', total_count,
            'page_size', p_limit,
            'current_offset', p_offset,
            'has_more', json_array_length(COALESCE(reviews_data, '[]'::json)) = p_limit,
            'has_previous', (p_offset > 0 OR p_cursor_id IS NOT NULL),
            'total_pages', CEIL(total_count::DECIMAL / p_limit)
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Advanced search reviews with comprehensive filters
CREATE OR REPLACE FUNCTION search_reviews_paginated(
    p_feature_ref_id TEXT DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT NULL,
    p_max_rating DECIMAL DEFAULT NULL,
    p_search_text TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0,
    p_cursor_id UUID DEFAULT NULL,
    p_cursor_created_at TIMESTAMP DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    reviews_data JSON;
    total_count INTEGER;
    where_clause TEXT := 'WHERE 1=1';
    count_query TEXT;
    data_query TEXT;
    next_cursor JSON := NULL;
BEGIN
    -- Build dynamic WHERE clause
    IF p_feature_ref_id IS NOT NULL THEN
        where_clause := where_clause || ' AND feature_ref_id = ''' || p_feature_ref_id || '''';
    END IF;
    
    IF p_min_rating IS NOT NULL THEN
        where_clause := where_clause || ' AND (safety_rating + quality_rating) / 2.0 >= ' || p_min_rating;
    END IF;
    
    IF p_max_rating IS NOT NULL THEN
        where_clause := where_clause || ' AND (safety_rating + quality_rating) / 2.0 <= ' || p_max_rating;
    END IF;
    
    IF p_search_text IS NOT NULL THEN
        where_clause := where_clause || ' AND comment ILIKE ''%' || p_search_text || '%''';
    END IF;
    
    -- Get total count
    count_query := 'SELECT COUNT(*) FROM public.reviews ' || where_clause;
    EXECUTE count_query INTO total_count;
    
    -- Build and execute data query
    IF p_cursor_id IS NOT NULL AND p_cursor_created_at IS NOT NULL THEN
        data_query := 'SELECT json_agg(
            json_build_object(
                ''id'', id,
                ''feature_ref_id'', feature_ref_id,
                ''safety_rating'', safety_rating,
                ''quality_rating'', quality_rating,
                ''comment'', comment,
                ''created_at'', created_at,
                ''updated_at'', updated_at,
                ''avg_rating'', ROUND((safety_rating + quality_rating) / 2.0, 2)
            ) ORDER BY created_at DESC, id
        )
        FROM public.reviews ' || where_clause || '
        AND (created_at < ''' || p_cursor_created_at || ''' OR 
             (created_at = ''' || p_cursor_created_at || ''' AND id < ''' || p_cursor_id || '''))
        ORDER BY created_at DESC, id
        LIMIT ' || (p_limit + 1);
    ELSE
        data_query := 'SELECT json_agg(
            json_build_object(
                ''id'', id,
                ''feature_ref_id'', feature_ref_id,
                ''safety_rating'', safety_rating,
                ''quality_rating'', quality_rating,
                ''comment'', comment,
                ''created_at'', created_at,
                ''updated_at'', updated_at,
                ''avg_rating'', ROUND((safety_rating + quality_rating) / 2.0, 2)
            ) ORDER BY created_at DESC, id
        )
        FROM public.reviews ' || where_clause || '
        ORDER BY created_at DESC, id
        LIMIT ' || (p_limit + 1) || ' OFFSET ' || p_offset;
    END IF;
    
    EXECUTE data_query INTO reviews_data;
    
    result := json_build_object(
        'data', COALESCE(reviews_data, '[]'::json),
        'pagination', json_build_object(
            'total_count', total_count,
            'page_size', p_limit,
            'current_offset', p_offset,
            'has_more', json_array_length(COALESCE(reviews_data, '[]'::json)) = p_limit,
            'has_previous', (p_offset > 0 OR p_cursor_id IS NOT NULL),
            'total_pages', CEIL(total_count::DECIMAL / p_limit)
        ),
        'filters', json_build_object(
            'feature_ref_id', p_feature_ref_id,
            'min_rating', p_min_rating,
            'max_rating', p_max_rating,
            'search_text', p_search_text
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Upsert review
CREATE OR REPLACE FUNCTION upsert_review(
    p_feature_ref_id TEXT,
    p_safety_rating INTEGER,
    p_quality_rating INTEGER,
    p_comment TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_user_id UUID := auth.uid();
    review_record public.reviews;
BEGIN
    -- Validate user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to submit reviews';
    END IF;
    
    -- Validate ratings
    IF p_safety_rating < 0 OR p_safety_rating > 5 OR p_quality_rating < 0 OR p_quality_rating > 5 THEN
        RAISE EXCEPTION 'Ratings must be between 0 and 5';
    END IF;
    
    -- Upsert the review
    INSERT INTO public.reviews (user_id, feature_ref_id, safety_rating, quality_rating, comment)
    VALUES (current_user_id, p_feature_ref_id, p_safety_rating, p_quality_rating, p_comment)
    ON CONFLICT (user_id, feature_ref_id) 
    DO UPDATE SET 
        safety_rating = EXCLUDED.safety_rating,
        quality_rating = EXCLUDED.quality_rating,
        comment = EXCLUDED.comment,
        updated_at = NOW()
    RETURNING * INTO review_record;
    
    result := json_build_object(
        'id', review_record.id,
        'user_id', review_record.user_id,
        'feature_ref_id', review_record.feature_ref_id,
        'safety_rating', review_record.safety_rating,
        'quality_rating', review_record.quality_rating,
        'comment', review_record.comment,
        'created_at', review_record.created_at,
        'updated_at', review_record.updated_at,
        'avg_rating', ROUND((review_record.safety_rating + review_record.quality_rating) / 2.0, 2),
        'was_updated', review_record.created_at != review_record.updated_at
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Delete user's review
CREATE OR REPLACE FUNCTION delete_user_review(
    p_feature_ref_id TEXT
)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID := auth.uid();
    deleted_count INTEGER;
BEGIN
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to delete reviews';
    END IF;
    
    DELETE FROM public.reviews 
    WHERE user_id = current_user_id 
    AND feature_ref_id = p_feature_ref_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count = 0 THEN
        RAISE EXCEPTION 'No review found to delete for this feature';
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Review deleted successfully',
        'feature_ref_id', p_feature_ref_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Get review statistics for multiple features
CREATE OR REPLACE FUNCTION get_features_review_stats(
    p_feature_ref_ids TEXT[]
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_object_agg(
        feature_ref_id,
        json_build_object(
            'total_reviews', total_reviews,
            'avg_safety_rating', avg_safety_rating,
            'avg_quality_rating', avg_quality_rating,
            'avg_overall_rating', avg_overall_rating
        )
    ) INTO result
    FROM public.review_stats
    WHERE feature_ref_id = ANY(p_feature_ref_ids);
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Get user's review status for multiple features
CREATE OR REPLACE FUNCTION get_user_reviews_batch(
    p_feature_ref_ids TEXT[]
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_user_id UUID := auth.uid();
BEGIN
    IF current_user_id IS NULL THEN
        RETURN '{}'::json;
    END IF;
    
    SELECT json_object_agg(
        feature_ref_id,
        json_build_object(
            'id', id,
            'safety_rating', safety_rating,
            'quality_rating', quality_rating,
            'comment', comment,
            'created_at', created_at,
            'updated_at', updated_at,
            'avg_rating', ROUND((safety_rating + quality_rating) / 2.0, 2)
        )
    ) INTO result
    FROM public.reviews
    WHERE user_id = current_user_id 
    AND feature_ref_id = ANY(p_feature_ref_ids);
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. NEW: Get current user's review for a specific feature
CREATE OR REPLACE FUNCTION get_user_review_by_feature(
    p_feature_ref_id TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    current_user_id UUID := auth.uid();
    review_record public.reviews;
    review_count INTEGER;
BEGIN
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'data', NULL,
            'error', 'User must be authenticated'
        );
    END IF;
    
    -- Extra security: Count how many reviews this user has for this feature
    SELECT COUNT(*) INTO review_count
    FROM public.reviews
    WHERE user_id = current_user_id 
    AND feature_ref_id = p_feature_ref_id;
    
    -- Should be 0 or 1 due to unique constraint
    IF review_count > 1 THEN
        RAISE EXCEPTION 'Data integrity error: Multiple reviews found for user';
    END IF;
    
    IF review_count = 0 THEN
        RETURN json_build_object(
            'data', NULL,
            'message', 'No review found for this feature'
        );
    END IF;
    
    -- Get the specific review with explicit user validation
    SELECT * INTO review_record
    FROM public.reviews
    WHERE user_id = current_user_id 
    AND feature_ref_id = p_feature_ref_id
    LIMIT 1; -- Extra safety
    
    -- Double-check the user_id matches (paranoid security)
    IF review_record.user_id != current_user_id THEN
        RAISE EXCEPTION 'Security violation: Review user_id mismatch';
    END IF;
    
    -- Return the review data
    result := json_build_object(
        'data', json_build_object(
            'id', review_record.id,
            'user_id', review_record.user_id,
            'feature_ref_id', review_record.feature_ref_id,
            'safety_rating', review_record.safety_rating,
            'quality_rating', review_record.quality_rating,
            'comment', review_record.comment,
            'created_at', review_record.created_at,
            'updated_at', review_record.updated_at,
            'avg_rating', ROUND((review_record.safety_rating + review_record.quality_rating) / 2.0, 2),
            'was_updated', review_record.created_at != review_record.updated_at
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_feature_reviews_complete(TEXT, INTEGER, INTEGER, UUID, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_reviews_paginated(INTEGER, INTEGER, UUID, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION search_reviews_paginated(TEXT, DECIMAL, DECIMAL, TEXT, INTEGER, INTEGER, UUID, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_review(TEXT, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_review(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_features_review_stats(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_reviews_batch(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_review_by_feature(TEXT) TO authenticated;