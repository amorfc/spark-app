-- Create reports table for content moderation
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- What is being reported (only one should be set)
    reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reported_review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reported_post_review_id UUID REFERENCES post_reviews(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Report details
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'inappropriate_content',
        'spam',
        'harassment',
        'hate_speech',
        'violence',
        'misinformation',
        'copyright',
        'other'
    )),
    description TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_post_id ON reports(reported_post_id);
CREATE INDEX idx_reports_review_id ON reports(reported_review_id);
CREATE INDEX idx_reports_post_review_id ON reports(reported_post_review_id);
CREATE INDEX idx_reports_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Ensure only one target is set per report
ALTER TABLE reports ADD CONSTRAINT reports_single_target_check 
CHECK (
    (reported_post_id IS NOT NULL)::int + 
    (reported_review_id IS NOT NULL)::int + 
    (reported_post_review_id IS NOT NULL)::int + 
    (reported_user_id IS NOT NULL)::int = 1
);

-- Create blocked_users table for user blocking
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id)
);

-- Create index for blocked users
CREATE INDEX idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked_id ON blocked_users(blocked_id);

-- Prevent users from blocking themselves
ALTER TABLE blocked_users ADD CONSTRAINT blocked_users_no_self_block 
CHECK (blocker_id != blocked_id);

-- Create banned_keywords table for content filtering
CREATE TABLE IF NOT EXISTS banned_keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword VARCHAR(255) NOT NULL UNIQUE,
    severity VARCHAR(20) DEFAULT 'moderate' CHECK (severity IN ('low', 'moderate', 'high')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create index for keyword lookup
CREATE INDEX idx_banned_keywords_keyword ON banned_keywords(keyword);
CREATE INDEX idx_banned_keywords_active ON banned_keywords(is_active);

-- RLS Policies for reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports" ON reports
    FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT 
    USING (auth.uid() = reporter_id);

-- RLS Policies for blocked_users table
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can manage their own blocks
CREATE POLICY "Users can manage own blocks" ON blocked_users
    FOR ALL 
    USING (auth.uid() = blocker_id)
    WITH CHECK (auth.uid() = blocker_id);

-- Users can see if they are blocked by others (for filtering content)
CREATE POLICY "Users can see blocks against them" ON blocked_users
    FOR SELECT 
    USING (auth.uid() = blocked_id);

-- RLS Policies for banned_keywords table  
ALTER TABLE banned_keywords ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active keywords for filtering
CREATE POLICY "Users can read active keywords" ON banned_keywords
    FOR SELECT 
    USING (is_active = true AND auth.role() = 'authenticated');

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default banned keywords
INSERT INTO banned_keywords (keyword, severity) VALUES
    ('spam', 'moderate'),
    ('scam', 'high'),
    ('fake', 'moderate'),
    ('hate', 'high'),
    ('kill', 'high'),
    ('die', 'high')
ON CONFLICT (keyword) DO NOTHING; 