-- Migration 011: Role-based access control + global edit mode + lab member user linking

-- 1. Add role column to dashboard users (admin | member | viewer)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';

-- 2. Promote the oldest existing user to admin so there's always a way in
UPDATE public.users
SET role = 'admin'
WHERE id = (SELECT id FROM public.users ORDER BY "createdAt" ASC LIMIT 1);

-- 3. Create global site config table for edit mode and future settings
CREATE TABLE IF NOT EXISTS public.site_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT 'false'
);

-- 4. Seed the edit mode row (off by default)
INSERT INTO public.site_config (key, value) VALUES ('edit_mode', 'false') ON CONFLICT DO NOTHING;

-- 5. Add optional link from Lab Members to a dashboard user account
ALTER TABLE "pgntarg2udzj1f3"."Lab Members"
  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL;
