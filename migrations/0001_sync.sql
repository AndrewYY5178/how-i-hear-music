CREATE TABLE IF NOT EXISTS sync_oauth_states (
  state_hash TEXT PRIMARY KEY,
  return_to TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_users (
  id TEXT PRIMARY KEY,
  login TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_exchanges (
  code_hash TEXT PRIMARY KEY,
  session_token TEXT NOT NULL,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_blobs (
  user_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL,
  encrypted_payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
