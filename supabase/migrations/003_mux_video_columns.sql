-- Add Mux video columns to classes table
-- mux_upload_id: temporary ID used during upload, links webhook to correct class
-- mux_asset_id: permanent Mux asset ID (for management/deletion)
-- mux_playback_id: used by Mux player to stream the video

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS mux_upload_id text,
  ADD COLUMN IF NOT EXISTS mux_asset_id text,
  ADD COLUMN IF NOT EXISTS mux_playback_id text;

-- Index on mux_upload_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_classes_mux_upload_id ON public.classes (mux_upload_id)
  WHERE mux_upload_id IS NOT NULL;
