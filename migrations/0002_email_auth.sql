ALTER TABLE sync_users ADD COLUMN email_hash TEXT;
ALTER TABLE sync_users ADD COLUMN provider TEXT NOT NULL DEFAULT 'github';

CREATE UNIQUE INDEX IF NOT EXISTS sync_users_email_hash_idx
  ON sync_users(email_hash)
  WHERE email_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS email_auth_challenges (
  challenge_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS email_auth_challenges_expiry_idx
  ON email_auth_challenges(expires_at);
