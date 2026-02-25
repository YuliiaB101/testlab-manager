CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS machines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  os TEXT NOT NULL,
  cpu TEXT NOT NULL,
  ram_gb INT NOT NULL,
  gpu TEXT,
  storage_gb INT NOT NULL,
  location TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  machine_id INT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  setup_options JSONB NOT NULL DEFAULT '{}'::jsonb,
  test_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'info'
);

CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  suite TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_duration INT NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS test_runs (
  id SERIAL PRIMARY KEY,
  machine_id INT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running',
  tests_count INT NOT NULL DEFAULT 0,
  test_ids INT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  estimated_duration INT NOT NULL DEFAULT 30
);

CREATE UNIQUE INDEX IF NOT EXISTS tests_suite_name_unique ON tests (suite, name);

CREATE INDEX IF NOT EXISTS idx_machines_name ON machines USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_reservations_machine_id ON reservations(machine_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_machine_status ON test_runs(machine_id, status);
CREATE INDEX IF NOT EXISTS idx_test_runs_estimated_duration ON test_runs(estimated_duration);