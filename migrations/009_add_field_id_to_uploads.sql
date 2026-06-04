-- Add field_id FK to all upload tables for field-level spatial matching
ALTER TABLE "pgntarg2udzj1f3"."Photos"
  ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES "pgntarg2udzj1f3"."Fields"(id) ON DELETE SET NULL;

ALTER TABLE "pgntarg2udzj1f3"."Recordings"
  ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES "pgntarg2udzj1f3"."Fields"(id) ON DELETE SET NULL;

ALTER TABLE "pgntarg2udzj1f3"."Notes"
  ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES "pgntarg2udzj1f3"."Fields"(id) ON DELETE SET NULL;

ALTER TABLE "pgntarg2udzj1f3"."Locations"
  ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES "pgntarg2udzj1f3"."Fields"(id) ON DELETE SET NULL;

ALTER TABLE "pgntarg2udzj1f3"."Lab_Member_Uploads"
  ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES "pgntarg2udzj1f3"."Fields"(id) ON DELETE SET NULL;
