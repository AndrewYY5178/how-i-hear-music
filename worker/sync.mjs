const encoder = new TextEncoder();
const now = () => Date.now();
const random = () => crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
const allowedReturn = (value, origin) => {
  const url = new URL(String(value || origin), origin);
  if (url.origin !== origin) throw new Error("Sync can only return to the approved site.");
  return url.toString();
};
const readBody = async (request, limit = 1_500_000) => {
  const text = await request.text();
  if (text.length > limit) throw new Error("The encrypted sync package is too large.");
  try { return JSON.parse(text || "{}"); } catch { throw new Error("The sync request is not valid JSON."); }
};
const bearer = (request) => {
  const value = request.headers.get("Authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
};
const configured = (env) => Boolean(env.SYNC_DB && env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.SYNC_CALLBACK_URL);
const response = (headers, status, body) => new Response(JSON.stringify(body), { status, headers });

const session = async (request, env) => {
  const token = bearer(request);
  if (!token) return null;
  const tokenHash = await hash(token);
  const row = await env.SYNC_DB.prepare("SELECT s.user_id, s.expires_at, u.login FROM sync_sessions s JOIN sync_users u ON u.id = s.user_id WHERE s.token_hash = ?").bind(tokenHash).first();
  if (!row || Number(row.expires_at) <= now()) return null;
  return row;
};
const requireSession = async (request, env, headers) => {
  const current = await session(request, env);
  return current || response(headers, 401, { error: "Sign in to sync this archive." });
};
const validateEncrypted = (value) => value && typeof value === "object" && value.format === "how-i-hear-music-encrypted-backup" && typeof value.ciphertext === "string" && typeof value.salt === "string" && typeof value.iv === "string";

export const handleSync = async ({ request, url, env, headers, origin }) => {
  if (!url.pathname.startsWith("/api/sync/")) return null;
  if (!configured(env)) return response(headers, 503, { error: "Private sync is not configured yet." });
  const db = env.SYNC_DB;
  const path = url.pathname;
  if (request.method === "GET" && path === "/api/sync/github/start") {
    try {
      const state = random(); const stateHash = await hash(state); const returnTo = allowedReturn(url.searchParams.get("return_to"), origin); const expiresAt = now() + 10 * 60_000;
      await db.batch([db.prepare("DELETE FROM sync_oauth_states WHERE expires_at <= ?").bind(now()), db.prepare("INSERT INTO sync_oauth_states (state_hash, return_to, expires_at) VALUES (?, ?, ?)").bind(stateHash, returnTo, expiresAt)]);
      const github = new URL("https://github.com/login/oauth/authorize");
      github.search = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, redirect_uri: env.SYNC_CALLBACK_URL, state, scope: "read:user" }).toString();
      return Response.redirect(github.toString(), 302);
    } catch (error) { return response(headers, 400, { error: error.message || "Could not start GitHub sign-in." }); }
  }
  if (request.method === "GET" && path === "/api/sync/github/callback") {
    try {
      const state = String(url.searchParams.get("state") || ""); const code = String(url.searchParams.get("code") || "");
      if (!state || !code) throw new Error("GitHub did not return a complete sign-in response.");
      const stateHash = await hash(state); const stored = await db.prepare("SELECT return_to FROM sync_oauth_states WHERE state_hash = ? AND expires_at > ?").bind(stateHash, now()).first();
      await db.prepare("DELETE FROM sync_oauth_states WHERE state_hash = ?").bind(stateHash).run();
      if (!stored) throw new Error("This sign-in request expired. Start again from Data Desk.");
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: env.SYNC_CALLBACK_URL }) });
      const token = await tokenResponse.json(); if (!tokenResponse.ok || !token.access_token) throw new Error("GitHub could not complete sign-in.");
      const profileResponse = await fetch("https://api.github.com/user", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token.access_token}`, "User-Agent": "How-I-Hear-Music-Sync" } });
      const profile = await profileResponse.json(); if (!profileResponse.ok || !profile.id || !profile.login) throw new Error("GitHub did not return an account identity.");
      const userId = String(profile.id); const sessionToken = random(); const exchangeCode = random(); const expiresAt = now() + 30 * 86400_000;
      await db.batch([
        db.prepare("INSERT INTO sync_users (id, login, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET login = excluded.login").bind(userId, String(profile.login), now()),
        db.prepare("INSERT INTO sync_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await hash(sessionToken), userId, expiresAt),
        db.prepare("INSERT INTO sync_exchanges (code_hash, session_token, user_id, expires_at) VALUES (?, ?, ?, ?)").bind(await hash(exchangeCode), sessionToken, userId, now() + 5 * 60_000),
        db.prepare("DELETE FROM sync_exchanges WHERE expires_at <= ?").bind(now()),
      ]);
      const destination = new URL(stored.return_to); destination.hash = `sync-exchange=${encodeURIComponent(exchangeCode)}`;
      return Response.redirect(destination.toString(), 302);
    } catch (error) { return response(headers, 400, { error: error.message || "Could not complete GitHub sign-in." }); }
  }
  if (request.method === "POST" && path === "/api/sync/exchange") {
    try {
      const body = await readBody(request, 20_000); const codeHash = await hash(String(body.exchangeCode || "")); const pending = await db.prepare("SELECT session_token, user_id, expires_at FROM sync_exchanges WHERE code_hash = ?").bind(codeHash).first();
      await db.prepare("DELETE FROM sync_exchanges WHERE code_hash = ?").bind(codeHash).run();
      if (!pending || Number(pending.expires_at) <= now()) throw new Error("This sign-in handoff expired. Start again from Data Desk.");
      const user = await db.prepare("SELECT login FROM sync_users WHERE id = ?").bind(pending.user_id).first();
      return response(headers, 200, { token: pending.session_token, user: { id: pending.user_id, login: user?.login || "GitHub" }, expiresAt: now() + 30 * 86400_000 });
    } catch (error) { return response(headers, 400, { error: error.message || "Could not complete sign-in." }); }
  }
  if (request.method === "GET" && path === "/api/sync/status") {
    const current = await requireSession(request, env, headers); if (current instanceof Response) return current;
    const blob = await db.prepare("SELECT revision, updated_at FROM sync_blobs WHERE user_id = ?").bind(current.user_id).first();
    return response(headers, 200, { user: { id: current.user_id, login: current.login }, revision: Number(blob?.revision || 0), updatedAt: blob?.updated_at || null });
  }
  if (request.method === "GET" && path === "/api/sync/blob") {
    const current = await requireSession(request, env, headers); if (current instanceof Response) return current;
    const blob = await db.prepare("SELECT revision, encrypted_payload, updated_at FROM sync_blobs WHERE user_id = ?").bind(current.user_id).first();
    return response(headers, 200, blob ? { revision: Number(blob.revision), encrypted: JSON.parse(blob.encrypted_payload), updatedAt: blob.updated_at } : { revision: 0, encrypted: null, updatedAt: null });
  }
  if (request.method === "PUT" && path === "/api/sync/blob") {
    try {
      const current = await requireSession(request, env, headers); if (current instanceof Response) return current;
      const body = await readBody(request); if (!validateEncrypted(body.encrypted)) throw new Error("Only a valid encrypted archive can be synced.");
      const expected = Math.max(0, Number(body.revision) || 0); const existing = await db.prepare("SELECT revision FROM sync_blobs WHERE user_id = ?").bind(current.user_id).first(); const actual = Number(existing?.revision || 0);
      if (actual !== expected) return response(headers, 409, { error: "A newer encrypted archive is available.", revision: actual });
      const revision = actual + 1; const updatedAt = now();
      await db.prepare("INSERT INTO sync_blobs (user_id, revision, encrypted_payload, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET revision = excluded.revision, encrypted_payload = excluded.encrypted_payload, updated_at = excluded.updated_at").bind(current.user_id, revision, JSON.stringify(body.encrypted), updatedAt).run();
      return response(headers, 200, { revision, updatedAt });
    } catch (error) { return response(headers, 400, { error: error.message || "Could not save the encrypted archive." }); }
  }
  if (request.method === "POST" && path === "/api/sync/logout") {
    const token = bearer(request); if (token) await db.prepare("DELETE FROM sync_sessions WHERE token_hash = ?").bind(await hash(token)).run();
    return response(headers, 200, { ok: true });
  }
  return response(headers, 404, { error: "Sync route not found." });
};
