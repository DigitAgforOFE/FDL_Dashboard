SET search_path = pgntarg2udzj1f3;

CREATE TABLE IF NOT EXISTS "Documents" (
  id             SERIAL PRIMARY KEY,
  farm_id        INTEGER REFERENCES "Farms"(id) ON DELETE SET NULL,
  project_id     INTEGER REFERENCES "Projects"(id) ON DELETE SET NULL,
  filename       TEXT NOT NULL,
  original_name  TEXT,
  file_type      VARCHAR(20),
  file_size      INTEGER,
  description    TEXT,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
