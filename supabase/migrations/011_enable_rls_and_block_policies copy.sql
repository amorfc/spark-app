-- posts: enable RLS and hide posts from users you’ve blocked
ALTER TABLE public.posts
  ENABLE ROW LEVEL SECURITY;

-- posts: drop old policy
DROP POLICY IF EXISTS "Hide posts from blocked users" ON public.posts;

CREATE POLICY "Hide posts from blocked users"
  ON public.posts
  FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.blocked_users
      WHERE blocker_id = auth.uid()
        AND blocked_id = public.posts.user_id
    )
  );

-- post_reviews: enable RLS and hide reviews on posts from blocked users
ALTER TABLE public.post_reviews
  ENABLE ROW LEVEL SECURITY;

-- post_reviews: drop old policy
DROP POLICY IF EXISTS "Hide post_reviews from blocked users" ON public.post_reviews;

CREATE POLICY "Hide post_reviews from blocked users"
  ON public.post_reviews
  FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.blocked_users
      WHERE blocker_id = auth.uid()
        AND blocked_id = public.post_reviews.user_id
    )
  );

-- reviews: enable RLS and hide feature reviews from blocked users
ALTER TABLE public.reviews
  ENABLE ROW LEVEL SECURITY;

-- reviews: drop old policy
DROP POLICY IF EXISTS "Hide reviews from blocked users" ON public.reviews;


CREATE POLICY "Hide reviews from blocked users"
  ON public.reviews
  FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1
      FROM public.blocked_users
      WHERE blocker_id = auth.uid()
        AND blocked_id = public.reviews.user_id
    )
  );

-- 1. Make blocker_id default to auth.uid()
ALTER TABLE public.blocked_users
  ALTER COLUMN blocker_id
  SET DEFAULT auth.uid();

-- 2. Ensure RLS is on
ALTER TABLE public.blocked_users
  ENABLE ROW LEVEL SECURITY;

-- 3. Drop any old version…
DROP POLICY IF EXISTS "Users can manage own blocks" 
  ON public.blocked_users;

-- 4. …then recreate it
CREATE POLICY "Users can manage own blocks"
  ON public.blocked_users
  FOR ALL
  USING     (auth.uid() = blocker_id)
  WITH CHECK (auth.uid() = blocker_id);