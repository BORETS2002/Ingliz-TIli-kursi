-- Speaking Hub schema (idempotent)

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  status_updated_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS registrations_created_at_idx ON registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS registrations_status_idx ON registrations (status);

CREATE TABLE IF NOT EXISTS content_kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upsert a default admin user (only if not exists).
-- NOTE: Change via env on first run. This is a safe placeholder and will be overwritten
-- by server bootstrap if ADMIN_USERNAME/ADMIN_PASSWORD are provided.

