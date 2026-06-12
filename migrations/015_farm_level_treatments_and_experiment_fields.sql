-- Item 31: Add is_continuous, rate, rate_unit to Experiment_Treatments junction
ALTER TABLE "pgntarg2udzj1f3"."Experiment_Treatments"
  ADD COLUMN IF NOT EXISTS "is_continuous" BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS "rate"          DECIMAL(10,4),
  ADD COLUMN IF NOT EXISTS "rate_unit"     TEXT;

-- Item 32: Experiment → Fields junction for linking fields to an experiment
CREATE TABLE IF NOT EXISTS "pgntarg2udzj1f3"."Experiment_Fields" (
  "experiment_id" INTEGER NOT NULL REFERENCES "pgntarg2udzj1f3"."Farm_Experiments"("id") ON DELETE CASCADE,
  "field_id"      INTEGER NOT NULL REFERENCES "pgntarg2udzj1f3"."Fields"("id")           ON DELETE CASCADE,
  PRIMARY KEY ("experiment_id", "field_id")
);
