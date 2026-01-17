-- Migration: Add Admin CMS, Ratings, Comments, and Purchases
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ADD NEW COLUMNS TO CLASSES TABLE
-- =============================================

ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS focus_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS equipment_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS access_type text DEFAULT 'subscriber' CHECK (access_type IN ('free', 'subscriber', 'one_time')),
ADD COLUMN IF NOT EXISTS one_time_price_cents integer,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS stripe_price_id text,
ADD COLUMN IF NOT EXISTS published boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add trigger for classes updated_at
DROP TRIGGER IF EXISTS handle_classes_updated_at ON public.classes;
CREATE TRIGGER handle_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 2. ADMIN USERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can view admin_users table
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- =============================================
-- 3. CLASS RATINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.class_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(class_id, user_id)
);

ALTER TABLE public.class_ratings ENABLE ROW LEVEL SECURITY;

-- Everyone can read ratings
CREATE POLICY "Anyone can view ratings"
  ON public.class_ratings FOR SELECT
  USING (true);

-- Authenticated users can insert their own ratings
CREATE POLICY "Authenticated users can rate classes"
  ON public.class_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON public.class_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON public.class_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for ratings updated_at
CREATE TRIGGER handle_ratings_updated_at
  BEFORE UPDATE ON public.class_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 4. CLASS COMMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.class_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) <= 2000),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.class_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view published comments
CREATE POLICY "Anyone can view published comments"
  ON public.class_comments FOR SELECT
  USING (status = 'published');

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
  ON public.class_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can add comments"
  ON public.class_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.class_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any comment (for moderation)
CREATE POLICY "Admins can update any comment"
  ON public.class_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Add trigger for comments updated_at
CREATE TRIGGER handle_comments_updated_at
  BEFORE UPDATE ON public.class_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 5. CLASS PURCHASES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.class_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, class_id, status)
);

ALTER TABLE public.class_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own purchases"
  ON public.class_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert purchases (via service role)
CREATE POLICY "Service role can insert purchases"
  ON public.class_purchases FOR INSERT
  WITH CHECK (true);

-- System can update purchases (via service role)
CREATE POLICY "Service role can update purchases"
  ON public.class_purchases FOR UPDATE
  USING (true);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.class_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- =============================================
-- 6. CLASS RATING STATS VIEW
-- =============================================

CREATE OR REPLACE VIEW public.class_rating_stats AS
SELECT
  class_id,
  COUNT(*)::integer AS rating_count,
  ROUND(AVG(rating)::numeric, 2)::float AS average_rating
FROM public.class_ratings
GROUP BY class_id;

-- =============================================
-- 7. ADMIN POLICIES FOR CLASSES TABLE
-- =============================================

-- Allow admins to insert classes
CREATE POLICY "Admins can insert classes"
  ON public.classes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Allow admins to update classes
CREATE POLICY "Admins can update classes"
  ON public.classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- Allow admins to delete classes
CREATE POLICY "Admins can delete classes"
  ON public.classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- =============================================
-- 8. STORAGE BUCKET FOR CLASS MEDIA
-- =============================================

-- Note: Run this in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('class-media', 'class-media', true);

-- Storage policies (run in Supabase dashboard)
-- CREATE POLICY "Anyone can view class media" ON storage.objects FOR SELECT USING (bucket_id = 'class-media');
-- CREATE POLICY "Admins can upload class media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'class-media' AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
-- CREATE POLICY "Admins can update class media" ON storage.objects FOR UPDATE USING (bucket_id = 'class-media' AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));
-- CREATE POLICY "Admins can delete class media" ON storage.objects FOR DELETE USING (bucket_id = 'class-media' AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- =============================================
-- 9. HELPER FUNCTION: CHECK IF USER HAS ACCESS TO CLASS
-- =============================================

CREATE OR REPLACE FUNCTION public.user_has_class_access(p_user_id uuid, p_class_id uuid)
RETURNS boolean AS $$
DECLARE
  v_class public.classes%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_has_purchase boolean;
BEGIN
  -- Get the class
  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Free classes are accessible to everyone
  IF v_class.access_type = 'free' THEN
    RETURN true;
  END IF;

  -- If no user, no access to paid content
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;

  -- Subscribers have access to subscriber-only content
  IF v_class.access_type = 'subscriber' AND v_profile.subscription_status = 'active' THEN
    RETURN true;
  END IF;

  -- Check for one-time purchase
  IF v_class.access_type = 'one_time' THEN
    -- Subscribers also have access to purchasable classes
    IF v_profile.subscription_status = 'active' THEN
      RETURN true;
    END IF;

    -- Check if user has purchased this class
    SELECT EXISTS (
      SELECT 1 FROM public.class_purchases
      WHERE user_id = p_user_id
      AND class_id = p_class_id
      AND status = 'paid'
    ) INTO v_has_purchase;

    RETURN v_has_purchase;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_class_ratings_class_id ON public.class_ratings(class_id);
CREATE INDEX IF NOT EXISTS idx_class_ratings_user_id ON public.class_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_class_comments_class_id ON public.class_comments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_comments_user_id ON public.class_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_class_comments_status ON public.class_comments(status);
CREATE INDEX IF NOT EXISTS idx_class_purchases_user_id ON public.class_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_class_purchases_class_id ON public.class_purchases(class_id);
CREATE INDEX IF NOT EXISTS idx_class_purchases_status ON public.class_purchases(status);
CREATE INDEX IF NOT EXISTS idx_classes_access_type ON public.classes(access_type);
CREATE INDEX IF NOT EXISTS idx_classes_published ON public.classes(published);
