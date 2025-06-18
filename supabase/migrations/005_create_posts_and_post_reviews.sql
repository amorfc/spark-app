-- Migration: Create posts and post_reviews tables with RLS and optimized queries
-- Created: $(date)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_reviews table
CREATE TABLE IF NOT EXISTS post_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Unique constraint to prevent duplicate reviews per user per post
    CONSTRAINT unique_user_post_review UNIQUE (post_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_post_id ON post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_user_id ON post_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created_at ON post_reviews(created_at DESC);


-- Create composite index for efficient post-user lookups
CREATE INDEX IF NOT EXISTS idx_post_reviews_post_user ON post_reviews(post_id, user_id);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts table
-- Users can read all posts (you can modify this based on your privacy requirements)
CREATE POLICY "Posts are viewable by everyone" ON posts
    FOR SELECT USING (true);

-- Users can insert their own posts
CREATE POLICY "Users can insert their own posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_reviews table
-- Users can read all post reviews
CREATE POLICY "Post reviews are viewable by everyone" ON post_reviews
    FOR SELECT USING (true);

-- Users can insert reviews for any post (but not their own posts)
CREATE POLICY "Users can insert reviews for others' posts" ON post_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        auth.uid() != (SELECT user_id FROM posts WHERE id = post_id)
    );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON post_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON post_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_reviews_updated_at BEFORE UPDATE ON post_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get paginated feed with embedded reviews and profiles (offset-based)
CREATE OR REPLACE FUNCTION get_posts_feed(
    page_limit INTEGER DEFAULT 10,
    page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    author_profile JSON,
    recent_reviews JSON,
    total_reviews_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.content,
        p.created_at,
        p.updated_at,
        -- Author profile from profiles table
        COALESCE(
            (
                SELECT json_build_object(
                    'id', prof.id,
                    'first_name', prof.first_name,
                    'last_name', prof.last_name,
                    'username', prof.username,
                    'avatar_url', prof.avatar_url
                )
                FROM profiles prof 
                WHERE prof.id = p.user_id
            ),
            json_build_object(
                'id', p.user_id,
                'first_name', null,
                'last_name', null,
                'username', null,
                'avatar_url', null
            )
        ) as author_profile,
        -- Recent reviews with reviewer profiles
        COALESCE(
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
                                    'username', rprof.username,
                                    'avatar_url', rprof.avatar_url
                                )
                                FROM profiles rprof 
                                WHERE rprof.id = pr.user_id
                            ),
                            json_build_object(
                                'id', pr.user_id,
                                'first_name', null,
                                'last_name', null,
                                'username', null,
                                'avatar_url', null
                            )
                        )
                    ) ORDER BY pr.created_at DESC
                )
                FROM (
                    SELECT * FROM post_reviews 
                    WHERE post_id = p.id 
                    ORDER BY created_at DESC 
                    LIMIT 3
                ) pr
            ),
            '[]'::json
        ) as recent_reviews,
        COALESCE(
            (SELECT COUNT(*) FROM post_reviews WHERE post_id = p.id),
            0
        ) as total_reviews_count
    FROM posts p
    ORDER BY p.created_at DESC
    LIMIT page_limit OFFSET page_offset;
END;
$$;

-- Create function to get cursor-based paginated feed with embedded reviews and profiles
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
    -- Get posts with cursor pagination
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
                        'username', prof.username,
                        'avatar_url', prof.avatar_url
                    )
                    FROM profiles prof 
                    WHERE prof.id = p.user_id
                ),
                json_build_object(
                    'id', p.user_id,
                    'first_name', null,
                    'last_name', null,
                    'username', null,
                    'avatar_url', null
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
                                        'username', rprof.username,
                                        'avatar_url', rprof.avatar_url
                                    )
                                    FROM profiles rprof 
                                    WHERE rprof.id = pr.user_id
                                ),
                                json_build_object(
                                    'id', pr.user_id,
                                    'first_name', null,
                                    'last_name', null,
                                    'username', null,
                                    'avatar_url', null
                                )
                            )
                        ) ORDER BY pr.created_at DESC
                    )
                    FROM (
                        SELECT * FROM post_reviews 
                        WHERE post_id = p.id 
                        ORDER BY created_at DESC 
                        LIMIT 3
                    ) pr
                ),
                '[]'::json
            ),
            'total_reviews_count', COALESCE(
                (SELECT COUNT(*) FROM post_reviews WHERE post_id = p.id),
                0
            )
        ) ORDER BY p.created_at DESC
    ), COUNT(*)
    INTO post_data, total_found
    FROM (
        SELECT * FROM posts p
        WHERE (cursor_timestamp IS NULL OR p.created_at < cursor_timestamp)
        ORDER BY p.created_at DESC
        LIMIT page_limit + 1  -- Get one extra to check if there are more
    ) p;

    -- Get the last created_at timestamp for next cursor
    IF total_found > 0 THEN
        last_created_at := (post_data[array_length(post_data, 1)]->>'created_at')::TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Check if we have more posts (if we got limit + 1 results)
    IF total_found > page_limit THEN
        -- Remove the extra post and set has_more to true
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

-- Create function to get post details with all reviews (paginated) and profiles
CREATE OR REPLACE FUNCTION get_post_details(
    post_uuid UUID,
    reviews_limit INTEGER DEFAULT 10,
    reviews_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    post_data JSON,
    reviews_data JSON,
    total_reviews_count BIGINT,
    has_more_reviews BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count BIGINT;
BEGIN
    -- Get total reviews count
    SELECT COUNT(*) INTO total_count 
    FROM post_reviews 
    WHERE post_id = post_uuid;
    
    RETURN QUERY
    SELECT 
        -- Post data with author profile
        (
            SELECT json_build_object(
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
                            'username', prof.username,
                            'avatar_url', prof.avatar_url
                        )
                        FROM profiles prof 
                        WHERE prof.id = p.user_id
                    ),
                    json_build_object(
                        'id', p.user_id,
                        'first_name', null,
                        'last_name', null,
                        'username', null,
                        'avatar_url', null
                    )
                ),
                'total_reviews', total_count
            )
            FROM posts p 
            WHERE p.id = post_uuid
        ) as post_data,
        
        -- Reviews data (paginated) with reviewer profiles
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', pr.id,
                        'user_id', pr.user_id,
                        'text', pr.text,
                        'created_at', pr.created_at,
                        'updated_at', pr.updated_at,
                        'reviewer_profile', COALESCE(
                            (
                                SELECT json_build_object(
                                    'id', rprof.id,
                                    'first_name', rprof.first_name,
                                    'last_name', rprof.last_name,
                                    'username', rprof.username,
                                    'avatar_url', rprof.avatar_url
                                )
                                FROM profiles rprof 
                                WHERE rprof.id = pr.user_id
                            ),
                            json_build_object(
                                'id', pr.user_id,
                                'first_name', null,
                                'last_name', null,
                                'username', null,
                                'avatar_url', null
                            )
                        )
                    ) ORDER BY pr.created_at DESC
                )
                FROM (
                    SELECT * FROM post_reviews 
                    WHERE post_id = post_uuid 
                    ORDER BY created_at DESC 
                    LIMIT reviews_limit OFFSET reviews_offset
                ) pr
            ),
            '[]'::json
        ) as reviews_data,
        
        total_count as total_reviews_count,
        (total_count > reviews_offset + reviews_limit) as has_more_reviews;
END;
$$;

-- Create function to get cursor-based paginated post reviews
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
    -- Get total count of reviews for this post
    SELECT COUNT(*) INTO total_reviews
    FROM post_reviews 
    WHERE post_id = post_uuid;

    -- Get reviews with cursor pagination
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
                        'username', prof.username,
                        'avatar_url', prof.avatar_url
                    )
                    FROM profiles prof 
                    WHERE prof.id = pr.user_id
                ),
                json_build_object(
                    'id', pr.user_id,
                    'first_name', null,
                    'last_name', null,
                    'username', null,
                    'avatar_url', null
                )
            )
        ) ORDER BY pr.created_at DESC
    ), COUNT(*)
    INTO review_data, total_found
    FROM (
        SELECT * FROM post_reviews pr
        WHERE pr.post_id = post_uuid 
        AND (cursor_timestamp IS NULL OR pr.created_at < cursor_timestamp)
        ORDER BY pr.created_at DESC
        LIMIT page_limit + 1  -- Get one extra to check if there are more
    ) pr;

    -- Get the last created_at timestamp for next cursor
    IF total_found > 0 THEN
        last_created_at := (review_data[array_length(review_data, 1)]->>'created_at')::TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Check if we have more reviews (if we got limit + 1 results)
    IF total_found > page_limit THEN
        -- Remove the extra review and set has_more to true
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

-- Create function to upsert post review (insert or update) with profile data
CREATE OR REPLACE FUNCTION upsert_post_review(
    post_uuid UUID,
    review_text TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_review post_reviews%ROWTYPE;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is trying to review their own post
    IF EXISTS (SELECT 1 FROM posts WHERE id = post_uuid AND user_id = current_user_id) THEN
        RAISE EXCEPTION 'Users cannot review their own posts';
    END IF;
    
    -- Validate text
    IF review_text IS NULL OR trim(review_text) = '' THEN
        RAISE EXCEPTION 'Review text cannot be empty';
    END IF;
    
    -- Upsert the review
    INSERT INTO post_reviews (post_id, user_id, text)
    VALUES (post_uuid, current_user_id, review_text)
    ON CONFLICT (post_id, user_id)
    DO UPDATE SET 
        text = EXCLUDED.text,
        updated_at = now()
    RETURNING * INTO result_review;
    
    -- Return the review as JSON with reviewer profile
    RETURN (
        SELECT json_build_object(
            'id', result_review.id,
            'post_id', result_review.post_id,
            'user_id', result_review.user_id,
            'text', result_review.text,
            'created_at', result_review.created_at,
            'updated_at', result_review.updated_at,
            'reviewer_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'username', prof.username,
                        'avatar_url', prof.avatar_url
                    )
                    FROM profiles prof 
                    WHERE prof.id = result_review.user_id
                ),
                json_build_object(
                    'id', result_review.user_id,
                    'first_name', null,
                    'last_name', null,
                    'username', null,
                    'avatar_url', null
                )
            )
        )
    );
END;
$$;

-- Create function to get user's review for a specific post with profile
CREATE OR REPLACE FUNCTION get_user_post_review(post_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_review post_reviews%ROWTYPE;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    SELECT * INTO user_review
    FROM post_reviews 
    WHERE post_id = post_uuid AND user_id = current_user_id;
    
    IF user_review.id IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN (
        SELECT json_build_object(
            'id', user_review.id,
            'post_id', user_review.post_id,
            'user_id', user_review.user_id,
            'text', user_review.text,
            'created_at', user_review.created_at,
            'updated_at', user_review.updated_at,
            'reviewer_profile', COALESCE(
                (
                    SELECT json_build_object(
                        'id', prof.id,
                        'first_name', prof.first_name,
                        'last_name', prof.last_name,
                        'username', prof.username,
                        'avatar_url', prof.avatar_url
                    )
                    FROM profiles prof 
                    WHERE prof.id = user_review.user_id
                ),
                json_build_object(
                    'id', user_review.user_id,
                    'first_name', null,
                    'last_name', null,
                    'username', null,
                    'avatar_url', null
                )
            )
        )
    );
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON posts TO authenticated;
GRANT ALL ON post_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION get_posts_feed TO authenticated;
GRANT EXECUTE ON FUNCTION get_posts_feed_cursor TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_reviews_cursor TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_post_review TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_post_review TO authenticated; 