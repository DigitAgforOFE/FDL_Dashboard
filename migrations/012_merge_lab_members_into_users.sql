-- Migration 012: Merge Lab Members into public.users
-- Lab Members table is dropped; all profile fields move onto users.

-- 1. Add lab profile fields to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bearer_token VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR,
  ADD COLUMN IF NOT EXISTS faa_part_107 BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT;

-- 2. Copy data from Lab Members into matched users (by email)
UPDATE public.users u
SET
  bearer_token  = lm.token,
  position      = lm."Position",
  contact_phone = lm."Contact_Phone",
  faa_part_107  = COALESCE(lm."FAA_Part_107", false),
  status        = lm."Status"
FROM "pgntarg2udzj1f3"."Lab Members" lm
WHERE lm."Contact_Email" IS NOT NULL
  AND lm."Contact_Email" <> ''
  AND u.email = lm."Contact_Email";

-- 3. Handle Lab Members without email: match by first name
UPDATE public.users u
SET
  bearer_token  = lm.token,
  position      = lm."Position",
  contact_phone = lm."Contact_Phone",
  faa_part_107  = COALESCE(lm."FAA_Part_107", false),
  status        = lm."Status"
FROM "pgntarg2udzj1f3"."Lab Members" lm
WHERE (lm."Contact_Email" IS NULL OR lm."Contact_Email" = '')
  AND u.bearer_token IS NULL
  AND u.name ILIKE '%' || split_part(COALESCE(lm."Name", ''), ' ', 1) || '%';

-- 4. Create stub users for any Lab Members still unmatched (e.g. Test account)
INSERT INTO public.users (id, name, email, password, role, bearer_token, position, contact_phone, faa_part_107, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  lm."Name",
  LOWER(REPLACE(COALESCE(lm."Name", 'member'), ' ', '.')) || '@lab.local',
  '__disabled__',
  'member',
  lm.token,
  lm."Position",
  lm."Contact_Phone",
  COALESCE(lm."FAA_Part_107", false),
  lm."Status",
  NOW(),
  NOW()
FROM "pgntarg2udzj1f3"."Lab Members" lm
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.bearer_token = lm.token
)
ON CONFLICT (email) DO NOTHING;

-- 5. Update Lab_Member_Uploads: INT lab_member_id → TEXT (user id)
ALTER TABLE "pgntarg2udzj1f3"."Lab_Member_Uploads"
  ADD COLUMN IF NOT EXISTS _new_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL;

UPDATE "pgntarg2udzj1f3"."Lab_Member_Uploads" u
SET _new_user_id = us.id
FROM "pgntarg2udzj1f3"."Lab Members" lm
JOIN public.users us ON us.bearer_token = lm.token
WHERE u.lab_member_id = lm.id;

ALTER TABLE "pgntarg2udzj1f3"."Lab_Member_Uploads"
  DROP CONSTRAINT IF EXISTS "Lab_Member_Uploads_lab_member_id_fkey",
  DROP COLUMN lab_member_id;

ALTER TABLE "pgntarg2udzj1f3"."Lab_Member_Uploads"
  RENAME COLUMN _new_user_id TO lab_member_id;

-- 6. Update _nc_m2m_Projects_Lab Members junction: INT Lab Members_id → TEXT user_id
ALTER TABLE "pgntarg2udzj1f3"."_nc_m2m_Projects_Lab Members"
  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE;

UPDATE "pgntarg2udzj1f3"."_nc_m2m_Projects_Lab Members" j
SET user_id = us.id
FROM "pgntarg2udzj1f3"."Lab Members" lm
JOIN public.users us ON us.bearer_token = lm.token
WHERE j."Lab Members_id" = lm.id;

-- Remove rows that couldn't be mapped
DELETE FROM "pgntarg2udzj1f3"."_nc_m2m_Projects_Lab Members" WHERE user_id IS NULL;

ALTER TABLE "pgntarg2udzj1f3"."_nc_m2m_Projects_Lab Members"
  DROP CONSTRAINT IF EXISTS "_nc_m2m_Projects_Lab Members_pkey",
  DROP COLUMN "Lab Members_id";

ALTER TABLE "pgntarg2udzj1f3"."_nc_m2m_Projects_Lab Members"
  ALTER COLUMN user_id SET NOT NULL,
  ADD CONSTRAINT "_nc_m2m_Projects_Lab Members_pkey" PRIMARY KEY (user_id, "Projects_id");

-- 7. Drop the now-merged Lab Members table
DROP TABLE IF EXISTS "pgntarg2udzj1f3"."Lab Members";
