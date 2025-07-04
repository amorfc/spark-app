CREATE OR REPLACE FUNCTION get_posts_feed_cursor(
    page_limit INTEGER DEFAULT 10,
    cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    posts JSON,
    next_cursor TIMESTAMP WITH TIME ZONE,
    has_more BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_data JSON[];
    last_created_at TIMESTAMP WITH TIME ZONE;
    total_found INTEGER;
BEGIN
    -- Get posts with cursor pagination, but hide any from users you've blocked
    SELECT array_agg(
        json_build_object(
            'id', p.id,
            'user_id', p.user_id,
            'content', p.content,
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'author_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'full_name', prof.full_name
                    )
                    FROM profiles prof 
                    WHERE prof.id = p.user_id
                ),
                json_build_object(
                    'id', p.user_id,
                    'first_name', null,
                    'last_name', null,
                    'full_name', null
                )
            ),
            'recent_reviews', COALESCE(
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', pr.id,
                            'user_id', pr.user_id,
                            'text', pr.text,
                            'created_at', pr.created_at,
                            'reviewer_profile', COALESCE(
                                (
                                    SELECT json_build_object(
                                        'id', rprof.id,
                                        'first_name', rprof.first_name,
                                        'last_name', rprof.last_name,
                                        'full_name', rprof.full_name
                                    )
                                    FROM profiles rprof 
                                    WHERE rprof.id = pr.user_id
                                ),
                                json_build_object(
                                    'id', pr.user_id,
                                    'first_name', null,
                                    'last_name', null,
                                    'full_name', null
                                )
                            )
                        ) ORDER BY pr.created_at DESC
                    )
                    FROM (
                        SELECT * FROM post_reviews 
                        WHERE post_id = p.id 
                          -- also hide reviews by blocked reviewers if you like:
                          AND NOT EXISTS (
                            SELECT 1 
                            FROM public.blocked_users b
                            WHERE b.blocker_id = auth.uid()
                              AND b.blocked_id = post_reviews.user_id
                          )
                        ORDER BY created_at DESC 
                        LIMIT 3
                    ) pr
                ),
                '[]'::json
            ),
            'total_reviews_count', COALESCE(
                (SELECT COUNT(*) FROM post_reviews pr 
                  WHERE pr.post_id = p.id
                    -- same filter here if you want to exclude blocked reviewers from the count:
                    AND NOT EXISTS (
                      SELECT 1 
                      FROM public.blocked_users b
                      WHERE b.blocker_id = auth.uid()
                        AND b.blocked_id = pr.user_id
                    )
                ), 0
            )
        ) ORDER BY p.created_at DESC
    ), COUNT(*)
    INTO post_data, total_found
    FROM (
        SELECT * FROM posts p
        WHERE (cursor_timestamp IS NULL OR p.created_at < cursor_timestamp)
          -- **hide posts from authors you've blocked**
          AND NOT EXISTS (
            SELECT 1
            FROM public.blocked_users b
            WHERE b.blocker_id = auth.uid()
              AND b.blocked_id = p.user_id
          )
        ORDER BY p.created_at DESC
        LIMIT page_limit + 1  -- Get one extra to check if there are more
    ) p;

    -- Derive next cursor
    IF total_found > 0 THEN
        last_created_at := (post_data[array_length(post_data, 1)]->>'created_at')::TIMESTAMP WITH TIME ZONE;
    END IF;

    IF total_found > page_limit THEN
        post_data := post_data[1:page_limit];
        RETURN QUERY SELECT 
            array_to_json(post_data)::JSON,
            last_created_at,
            true;
    ELSE
        RETURN QUERY SELECT 
            array_to_json(post_data)::JSON,
            last_created_at,
            false;
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION get_post_reviews_cursor(
    post_uuid UUID,
    page_limit INTEGER DEFAULT 10,
    cursor_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    reviews JSON,
    next_cursor TIMESTAMP WITH TIME ZONE,
    has_more BOOLEAN,
    total_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    review_data JSON[];
    last_created_at TIMESTAMP WITH TIME ZONE;
    total_found INTEGER;
    total_reviews BIGINT;
BEGIN
    -- Total count, minus any from blocked users
    SELECT COUNT(*) 
    INTO total_reviews
    FROM post_reviews pr
    WHERE pr.post_id = post_uuid
      AND NOT EXISTS (
        SELECT 1
        FROM public.blocked_users b
        WHERE b.blocker_id = auth.uid()
          AND b.blocked_id = pr.user_id
      );

    -- Cursor-paginated slice, also hiding blocked users’ reviews
    SELECT array_agg(
        json_build_object(
            'id', pr.id,
            'post_id', pr.post_id,
            'user_id', pr.user_id,
            'text', pr.text,
            'created_at', pr.created_at,
            'updated_at', pr.updated_at,
            'reviewer_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'full_name', prof.full_name
                    )
                    FROM profiles prof 
                    WHERE prof.id = pr.user_id
                ),
                json_build_object(
                    'id', pr.user_id,
                    'first_name', null,
                    'last_name', null,
                    'full_name', null
                )
            )
        ) ORDER BY pr.created_at DESC
    ), COUNT(*)
    INTO review_data, total_found
    FROM (
        SELECT * 
        FROM post_reviews pr
        WHERE pr.post_id = post_uuid
          AND (cursor_timestamp IS NULL OR pr.created_at < cursor_timestamp)
          AND NOT EXISTS (
            SELECT 1
            FROM public.blocked_users b
            WHERE b.blocker_id = auth.uid()
              AND b.blocked_id = pr.user_id
          )
        ORDER BY pr.created_at DESC
        LIMIT page_limit + 1
    ) pr;

    IF total_found > 0 THEN
        last_created_at := 
          (review_data[array_length(review_data,1)]->>'created_at')::TIMESTAMP WITH TIME ZONE;
    END IF;

    IF total_found > page_limit THEN
        review_data := review_data[1:page_limit];
        RETURN QUERY SELECT 
            array_to_json(review_data)::JSON,
            last_created_at,
            true,
            total_reviews;
    ELSE
        RETURN QUERY SELECT 
            array_to_json(review_data)::JSON,
            last_created_at,
            false,
            total_reviews;
    END IF;
END;
$$;


-- 2) search_reviews_paginated: exclude blocked users in both count & results
DROP FUNCTION IF EXISTS public.search_reviews_paginated(TEXT, DECIMAL, DECIMAL, TEXT, INTEGER, INTEGER, UUID, TIMESTAMP);

CREATE OR REPLACE FUNCTION search_reviews_paginated(
    p_feature_ref_id    TEXT     DEFAULT NULL,
    p_min_rating        DECIMAL  DEFAULT NULL,
    p_max_rating        DECIMAL  DEFAULT NULL,
    p_search_text       TEXT     DEFAULT NULL,
    p_limit             INTEGER  DEFAULT 20,
    p_offset            INTEGER  DEFAULT 0,
    p_cursor_id         UUID     DEFAULT NULL,
    p_cursor_created_at TIMESTAMP DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result       JSON;
    reviews_data JSON;
    total_count  INTEGER;
    current_user_id UUID;
BEGIN
    -- Get current user ID first and store it
    current_user_id := auth.uid();
    
    -- Debug: Log the current user ID (you can remove this later)
    RAISE NOTICE 'Current user ID: %', current_user_id;
    
    ------------------------------------------------------------------------
    -- 2a) Compute total_count excluding blocked reviewers
    ------------------------------------------------------------------------
    SELECT COUNT(*) 
    INTO total_count
    FROM public.reviews r
    WHERE (p_feature_ref_id IS NULL OR r.feature_ref_id = p_feature_ref_id)
      AND (p_min_rating IS NULL OR (r.safety_rating + r.quality_rating)/2.0 >= p_min_rating)
      AND (p_max_rating IS NULL OR (r.safety_rating + r.quality_rating)/2.0 <= p_max_rating)
      AND (p_search_text IS NULL OR r.comment ILIKE '%' || p_search_text || '%')
      -- Use NOT EXISTS instead of LEFT JOIN for better clarity
      AND NOT EXISTS (
          SELECT 1 
          FROM public.blocked_users b
          WHERE b.blocker_id = current_user_id
            AND b.blocked_id = r.user_id
      );

    ------------------------------------------------------------------------
    -- 2b) Fetch the paginated slice, with same filters
    ------------------------------------------------------------------------
    IF p_cursor_id IS NOT NULL AND p_cursor_created_at IS NOT NULL THEN
        SELECT json_agg(
            json_build_object(
                'id',             r.id,
                'feature_ref_id', r.feature_ref_id,
                'safety_rating',  r.safety_rating,
                'quality_rating', r.quality_rating,
                'comment',        r.comment,
                'created_at',     r.created_at,
                'updated_at',     r.updated_at,
                'user_id',        r.user_id,  -- Add this for debugging
                'avg_rating',     ROUND((r.safety_rating + r.quality_rating)/2.0, 2)
            ) ORDER BY r.created_at DESC, r.id
        ) INTO reviews_data
        FROM (
            SELECT *
            FROM public.reviews r
            WHERE (p_feature_ref_id IS NULL OR r.feature_ref_id = p_feature_ref_id)
              AND (p_min_rating IS NULL OR (r.safety_rating + r.quality_rating)/2.0 >= p_min_rating)
              AND (p_max_rating IS NULL OR (r.safety_rating + r.quality_rating)/2.0 <= p_max_rating)
              AND (p_search_text IS NULL OR r.comment ILIKE '%' || p_search_text || '%')
              AND (r.created_at < p_cursor_created_at
                   OR (r.created_at = p_cursor_created_at AND r.id < p_cursor_id))
              -- Use NOT EXISTS instead of LEFT JOIN
              AND NOT EXISTS (
                  SELECT 1 
                  FROM public.blocked_users b
                  WHERE b.blocker_id = current_user_id
                    AND b.blocked_id = r.user_id
              )
            ORDER BY r.created_at DESC, r.id
            LIMIT p_limit + 1
        ) r;
    ELSE
        SELECT json_agg(
            json_build_object(
                'id',             r.id,
                'feature_ref_id', r.feature_ref_id,
                'safety_rating',  r.safety_rating,
                'quality_rating', r.quality_rating,
                'comment',        r.comment,
                'created_at',     r.created_at,
                'updated_at',     r.updated_at,
                'user_id',        r.user_id,  -- Add this for debugging
                'avg_rating',     ROUND((r.safety_rating + r.quality_rating)/2.0, 2)
            ) ORDER BY r.created_at DESC, r.id
        ) INTO reviews_data
        FROM (
            SELECT *
            FROM public.reviews r
            WHERE (p_feature_ref_id IS NULL OR r.feature_ref_id = p_feature_ref_id)
              AND (p_min_rating IS NULL OR (r.safety_rating + r.quality_rating)/2.0 >= p_min_rating)
              AND (p_max_rating IS NULL OR (r.safety_rating + r.quality_rating)/2.0 <= p_max_rating)
              AND (p_search_text IS NULL OR r.comment ILIKE '%' || p_search_text || '%')
              -- Use NOT EXISTS instead of LEFT JOIN
              AND NOT EXISTS (
                  SELECT 1 
                  FROM public.blocked_users b
                  WHERE b.blocker_id = current_user_id
                    AND b.blocked_id = r.user_id
              )
            ORDER BY r.created_at DESC, r.id
            LIMIT p_limit + 1
            OFFSET p_offset
        ) r;
    END IF;

    ------------------------------------------------------------------------
    -- 2c) Build and return the final JSON
    ------------------------------------------------------------------------
    result := json_build_object(
        'data',       COALESCE(reviews_data, '[]'::json),
        'debug_info', json_build_object(  -- Add debug info
            'current_user_id', current_user_id,
            'blocked_users_count', (
                SELECT COUNT(*) 
                FROM public.blocked_users 
                WHERE blocker_id = current_user_id
            )
        ),
        'pagination', json_build_object(
            'total_count',    total_count,
            'page_size',      p_limit,
            'current_offset', p_offset,
            'has_more',       json_array_length(COALESCE(reviews_data,'[]'::json)) = p_limit,
            'has_previous',   (p_offset > 0 OR p_cursor_id IS NOT NULL),
            'total_pages',    CEIL(total_count::DECIMAL / p_limit)
        ),
        'filters',    json_build_object(
            'feature_ref_id', p_feature_ref_id,
            'min_rating',     p_min_rating,
            'max_rating',     p_max_rating,
            'search_text',    p_search_text
        )
    );

    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_feature_reviews_complete(
    p_feature_ref_id    TEXT,
    p_limit             INTEGER DEFAULT 20,
    p_offset            INTEGER DEFAULT 0,
    p_cursor_id         UUID    DEFAULT NULL,
    p_cursor_created_at TIMESTAMP DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result           JSON;
    user_review_data JSON;
    reviews_data     JSON;
    stats_data       JSON;
    total_count      INTEGER;
    current_user_id  UUID := auth.uid();
    next_cursor      JSON := NULL;
    has_more         BOOLEAN := FALSE;
BEGIN
    -- 1) grab the caller’s own review (if any)
    SELECT row_to_json(r) 
    INTO   user_review_data
    FROM   public.reviews r
    WHERE  r.feature_ref_id = p_feature_ref_id
      AND  r.user_id        = current_user_id;

    -- 2) total_count excluding blocked users
    SELECT COUNT(*) 
    INTO   total_count
    FROM   public.reviews r
    LEFT   JOIN public.blocked_users b
      ON   b.blocker_id = current_user_id
     AND   b.blocked_id = r.user_id
    WHERE  b.blocked_id IS NULL
      AND  r.feature_ref_id = p_feature_ref_id;

    -- 3) fetch paginated reviews (cursor or offset), excluding blocked users
    IF p_cursor_id IS NOT NULL AND p_cursor_created_at IS NOT NULL THEN
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
            ROUND((r.safety_rating + r.quality_rating)/2.0, 2) AS avg_rating
          FROM   public.reviews r
          LEFT   JOIN public.blocked_users b
            ON   b.blocker_id = current_user_id
           AND   b.blocked_id = r.user_id
          WHERE  b.blocked_id IS NULL
            AND  r.feature_ref_id = p_feature_ref_id
            AND  (
                  r.created_at < p_cursor_created_at
               OR (r.created_at = p_cursor_created_at AND r.id < p_cursor_id)
                 )
          ORDER BY r.created_at DESC, r.id
          LIMIT  p_limit + 1
        )
        SELECT json_agg(
            json_build_object(
              'id',              id,
              'user_id',         user_id,
              'feature_ref_id',  feature_ref_id,
              'safety_rating',   safety_rating,
              'quality_rating',  quality_rating,
              'comment',         comment,
              'created_at',      created_at,
              'updated_at',      updated_at,
              'avg_rating',      avg_rating
            )
          )
        INTO   reviews_data
        FROM   review_data;
    ELSE
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
            ROUND((r.safety_rating + r.quality_rating)/2.0, 2) AS avg_rating
          FROM   public.reviews r
          LEFT   JOIN public.blocked_users b
            ON   b.blocker_id = current_user_id
           AND   b.blocked_id = r.user_id
          WHERE  b.blocked_id IS NULL
            AND  r.feature_ref_id = p_feature_ref_id
          ORDER BY r.created_at DESC, r.id
          LIMIT  p_limit + 1
          OFFSET p_offset
        )
        SELECT json_agg(
            json_build_object(
              'id',              id,
              'user_id',         user_id,
              'feature_ref_id',  feature_ref_id,
              'safety_rating',   safety_rating,
              'quality_rating',  quality_rating,
              'comment',         comment,
              'created_at',      created_at,
              'updated_at',      updated_at,
              'avg_rating',      avg_rating
            )
          )
        INTO   reviews_data
        FROM   review_data;
    END IF;

    -- 4) handle has_more + next_cursor
    IF json_array_length(COALESCE(reviews_data, '[]'::json)) > p_limit THEN
        has_more := TRUE;
        -- trim to p_limit
        SELECT json_agg(item) INTO reviews_data
        FROM (
          SELECT value AS item
          FROM   json_array_elements(reviews_data) WITH ORDINALITY
          WHERE  ordinality <= p_limit
        ) sub;
        -- build cursor from last element
        SELECT json_build_object(
                 'id',           last_item->>'id',
                 'created_at',   last_item->>'created_at'
               )
        INTO   next_cursor
        FROM (
          SELECT value AS last_item
          FROM   json_array_elements(reviews_data) WITH ORDINALITY
          WHERE  ordinality = p_limit
        ) sub;
    END IF;

    -- 5) grab stats
    SELECT row_to_json(s)
    INTO   stats_data
    FROM   public.review_stats s
    WHERE  s.feature_ref_id = p_feature_ref_id;

    -- 6) assemble final JSON
    result := json_build_object(
      'data',       json_build_object(
                       'reviews',     COALESCE(reviews_data, '[]'::json),
                       'user_review', user_review_data,
                       'stats',       stats_data
                   ),
      'pagination', json_build_object(
                       'total_count',    total_count,
                       'page_size',      p_limit,
                       'current_offset', p_offset,
                       'has_more',       has_more,
                       'has_previous',   (p_offset > 0 OR p_cursor_id IS NOT NULL),
                       'next_cursor',    next_cursor,
                       'total_pages',    CEIL(total_count::DECIMAL / p_limit)
                   )
    );

    RETURN result;
END;
$$;
