SET search_path = pgntarg2udzj1f3;

-- Remove N_Samples from Tests (moved to per-experiment test entries)
ALTER TABLE "Tests" DROP COLUMN IF EXISTS "N_Samples";

-- Core experiment record per farm
CREATE TABLE IF NOT EXISTS "Farm_Experiments" (
  id                SERIAL PRIMARY KEY,
  farm_id           INTEGER REFERENCES "Farms"(id) ON DELETE CASCADE,
  experiment_name   TEXT,
  start_date        DATE,
  hypothesis        TEXT,
  experiment_desc   TEXT,
  measurements      TEXT,
  criteria          TEXT,
  lab_description   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-experiment test entries (test type + sample count + expected date)
CREATE TABLE IF NOT EXISTS "Experiment_Tests" (
  id              SERIAL PRIMARY KEY,
  experiment_id   INTEGER NOT NULL REFERENCES "Farm_Experiments"(id) ON DELETE CASCADE,
  test_id         INTEGER NOT NULL REFERENCES "Tests"(id) ON DELETE CASCADE,
  n_samples       INTEGER,
  expected_date   DATE
);

-- Per-experiment drone flight entries
CREATE TABLE IF NOT EXISTS "Experiment_Drone_Flights" (
  id              SERIAL PRIMARY KEY,
  experiment_id   INTEGER NOT NULL REFERENCES "Farm_Experiments"(id) ON DELETE CASCADE,
  drone_id        INTEGER NOT NULL REFERENCES "Drones"(id) ON DELETE CASCADE,
  n_flights       INTEGER,
  expected_date   DATE
);

-- Experiment → Treatments junction
CREATE TABLE IF NOT EXISTS "Experiment_Treatments" (
  experiment_id   INTEGER NOT NULL REFERENCES "Farm_Experiments"(id) ON DELETE CASCADE,
  treatment_id    INTEGER NOT NULL REFERENCES "Treatments"(id) ON DELETE CASCADE,
  PRIMARY KEY (experiment_id, treatment_id)
);
