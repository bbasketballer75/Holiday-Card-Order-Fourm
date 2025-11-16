-- Migration: create forum_likes table
-- Run this in your Supabase SQL editor or via supabase CLI

CREATE TABLE IF NOT EXISTS public.forum_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id text NOT NULL,
  user_name text,
  created_at timestamptz DEFAULT now()
);

-- Ensure uniqueness per user/message so upserts are idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forum_likes_unique_message_user'
  ) THEN
    ALTER TABLE public.forum_likes ADD CONSTRAINT forum_likes_unique_message_user UNIQUE (message_id, user_name);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_forum_likes_message_id ON public.forum_likes (message_id);
