-- Migration: Add sort_order to classes table for manual ordering
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ADD SORT_ORDER COLUMN
-- =============================================

ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS sort_order integer;

-- =============================================
-- 2. INITIALIZE SORT_ORDER BASED ON CREATED_AT
-- =============================================

-- Set initial sort_order values based on existing creation order
-- Lower numbers appear first (newest classes get lower numbers)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM public.classes
)
UPDATE public.classes c
SET sort_order = n.rn
FROM numbered n
WHERE c.id = n.id;

-- =============================================
-- 3. ADD INDEX FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_classes_sort_order ON public.classes(sort_order);

-- =============================================
-- 4. SET DEFAULT FOR NEW CLASSES
-- =============================================

-- New classes will get sort_order = 0 by default (top of list)
-- Then can be reordered as needed
ALTER TABLE public.classes
ALTER COLUMN sort_order SET DEFAULT 0;
