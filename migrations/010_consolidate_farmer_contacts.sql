-- Item 17: Consolidate farmer contact info into the Contacts table.
-- Step 1: Seed a Contact record from Farm fields for any farm that has Farmer_Name
--         set but no existing non-lab-member Contact already linked to it.
INSERT INTO "pgntarg2udzj1f3"."Contacts" (name, phone, email, farms_id, is_lab_member, token, created_at)
SELECT
  f."Farmer_Name",
  f."Contact_Phone",
  f."Contact_Email",
  f.id,
  false,
  '',
  NOW()
FROM "pgntarg2udzj1f3"."Farms" f
WHERE f."Farmer_Name" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "pgntarg2udzj1f3"."Contacts" c
    WHERE c.farms_id = f.id
      AND c.is_lab_member = false
  );

-- Step 2: Drop the now-redundant contact fields from Farms.
ALTER TABLE "pgntarg2udzj1f3"."Farms"
  DROP COLUMN IF EXISTS "Farmer_Name",
  DROP COLUMN IF EXISTS "Contact_Phone",
  DROP COLUMN IF EXISTS "Contact_Email";
