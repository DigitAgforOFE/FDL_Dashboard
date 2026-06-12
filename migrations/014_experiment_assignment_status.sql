-- Add status field to experiment assignment junction tables.
-- Dates and status live on the assignment, not on the Test/Drone record itself.

ALTER TABLE "pgntarg2udzj1f3"."Experiment_Tests"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(50);

ALTER TABLE "pgntarg2udzj1f3"."Experiment_Drone_Flights"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(50);
