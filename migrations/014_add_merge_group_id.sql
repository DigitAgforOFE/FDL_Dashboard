-- Add merge_group_id to all upload tables so similar uploads can be grouped together.
-- Items sharing the same merge_group_id are displayed as a single collapsed row in Data Sorting.
ALTER TABLE "pgntarg2udzj1f3"."Photos"              ADD COLUMN IF NOT EXISTS merge_group_id VARCHAR(36);
ALTER TABLE "pgntarg2udzj1f3"."Notes"               ADD COLUMN IF NOT EXISTS merge_group_id VARCHAR(36);
ALTER TABLE "pgntarg2udzj1f3"."Recordings"          ADD COLUMN IF NOT EXISTS merge_group_id VARCHAR(36);
ALTER TABLE "pgntarg2udzj1f3"."Locations"           ADD COLUMN IF NOT EXISTS merge_group_id VARCHAR(36);
ALTER TABLE "pgntarg2udzj1f3"."Lab_Member_Uploads"  ADD COLUMN IF NOT EXISTS merge_group_id VARCHAR(36);
