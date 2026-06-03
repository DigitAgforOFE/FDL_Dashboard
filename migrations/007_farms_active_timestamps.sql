-- Add is_active flag to Farms
ALTER TABLE "pgntarg2udzj1f3"."Farms"
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Ensure created_at auto-defaults for new rows and backfill existing nulls
ALTER TABLE "pgntarg2udzj1f3"."Farms"
  ALTER COLUMN created_at SET DEFAULT NOW();
UPDATE "pgntarg2udzj1f3"."Farms"
  SET created_at = NOW() WHERE created_at IS NULL;

-- Backfill updated_at for existing rows
UPDATE "pgntarg2udzj1f3"."Farms"
  SET updated_at = NOW() WHERE updated_at IS NULL;
