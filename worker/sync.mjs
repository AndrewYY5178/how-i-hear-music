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
const emailConfigured = (env) => Boolean(configured(env) && env.RESEND_API_KEY);
const response = (headers, status, body) => new Response(JSON.stringify(body), { status, headers });
const bytesToBase64 = (value) => { let binary = ""; new Uint8Array(value).forEach((byte) => { binary += String.fromCharCode(byte); }); return btoa(binary); };
const base64ToBytes = (value) => Uint8Array.from(atob(String(value || "")), (character) => character.charCodeAt(0));
const accountKey = async (env, userId, usage) => {
  const material = await crypto.subtle.digest("SHA-256", encoder.encode(`${env.GITHUB_CLIENT_SECRET}:${userId}:how-i-hear-music-account-sync:v1`));
  return crypto.subtle.importKey("raw", material, { name: "AES-GCM" }, false, usage);
};
const encryptAccountBackup = async (env, userId, backup) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); const key = await accountKey(env, userId, ["encrypt"]);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(backup)));
  return { format: "how-i-hear-music-account-sync", version: 1, algorithm: "AES-GCM", iv: bytesToBase64(iv), ciphertext: bytesToBase64(ciphertext) };
};
const decryptAccountBackup = async (env, userId, payload) => {
  if (!payload || payload.format !== "how-i-hear-music-account-sync" || payload.version !== 1) throw new Error("This is a legacy password-encrypted sync copy. Keep it as a local backup, then create a new automatic sync copy.");
  const key = await accountKey(env, userId, ["decrypt"]); const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(payload.iv) }, key, base64ToBytes(payload.ciphertext));
  return JSON.parse(new TextDecoder().decode(plaintext));
};

const session = async (request, env) => {
  const token = bearer(request);
  if (!token) return null;
  const tokenHash = await hash(token);
  const row = await env.SYNC_DB.prepare("SELECT s.user_id, s.expires_at, u.login, u.provider, u.email_hash FROM sync_sessions s JOIN sync_users u ON u.id = s.user_id WHERE s.token_hash = ?").bind(tokenHash).first();
  if (!row || Number(row.expires_at) <= now()) return null;
  return row;
};
const requireSession = async (request, env, headers) => {
  const current = await session(request, env);
  return current || response(headers, 401, { error: "Sign in to sync this archive." });
};
const validateBackup = (value) => value && typeof value === "object" && value.format === "how-i-hear-music-backup" && [1, 2].includes(value.version) && value.data && typeof value.data === "object" && !Array.isArray(value.data);
const normalizeEmail = (value) => {
  const email = String(value || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  return email;
};
const emailKey = async (email) => hash(`how-i-hear-music-email:v1:${email}`);
const verificationCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const sendEmailCode = async (env, email, code) => {
  const from = String(env.EMAIL_FROM || "How I Hear Music <onboarding@resend.dev>");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "How I Hear Music sign-in code",
      text: `Your How I Hear Music sign-in code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
      html: `<p>Your How I Hear Music sign-in code is <strong>${escapeHtml(code)}</strong>.</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
    }),
  });
  if (!response.ok) throw new Error("The email service could not send a sign-in code.");
};
const emailRateWindows = new Map();
const withinEmailRateLimit = (key) => {
  const nowAt = now(); const recent = (emailRateWindows.get(key) || []).filter((at) => nowAt - at < 900_000);
  if (recent.length >= 5) return false;
  recent.push(nowAt); emailRateWindows.set(key, recent); return true;
};

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
      github.search = new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, redirect_uri: env.SYNC_CALLBACK_URL, state, scope: "read:user user:email" }).toString();
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
      const emailResponse = await fetch("https://api.github.com/user/emails", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token.access_token}`, "User-Agent": "How-I-Hear-Music-Sync" } });
      const githubEmails = emailResponse.ok ? await emailResponse.json() : [];
      const verifiedEmail = Array.isArray(githubEmails) ? githubEmails.find((entry) => entry?.verified && entry?.primary)?.email || githubEmails.find((entry) => entry?.verified)?.email || "" : "";
      let emailHash = null;
      try { if (verifiedEmail) emailHash = await emailKey(normalizeEmail(verifiedEmail)); } catch {}
      const linked = emailHash ? await db.prepare("SELECT id FROM sync_users WHERE email_hash = ?").bind(emailHash).first() : null;
      const userId = String(profile.id); const sessionToken = random(); const exchangeCode = random(); const expiresAt = now() + 30 * 86400_000;
      const accountId = String(linked?.id || userId);
      await db.batch([
        db.prepare("INSERT INTO sync_users (id, login, email_hash, provider, created_at) VALUES (?, ?, ?, 'github', ?) ON CONFLICT(id) DO UPDATE SET login = excluded.login, email_hash = COALESCE(excluded.email_hash, sync_users.email_hash), provider = 'github'").bind(accountId, String(profile.login), emailHash, now()),
        db.prepare("INSERT INTO sync_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await hash(sessionToken), accountId, expiresAt),
        db.prepare("INSERT INTO sync_exchanges (code_hash, session_token, user_id, expires_at) VALUES (?, ?, ?, ?)").bind(await hash(exchangeCode), sessionToken, accountId, now() + 5 * 60_000),
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
      const user = await db.prepare("SELECT login, provider FROM sync_users WHERE id = ?").bind(pending.user_id).first();
      return response(headers, 200, { token: pending.session_token, user: { id: pending.user_id, login: user?.login || "GitHub", provider: user?.provider || "github" }, expiresAt: now() + 30 * 86400_000 });
    } catch (error) { return response(headers, 400, { error: error.message || "Could not complete sign-in." }); }
  }
  if (request.method === "POST" && path === "/api/sync/email/request") {
    if (!emailConfigured(env)) return response(headers, 503, { error: "Email sign-in is not configured yet." });
    try {
      const body = await readBody(request, 20_000); const email = normalizeEmail(body.email); const address = request.headers.get("CF-Connecting-IP") || "unknown";
      if (!withinEmailRateLimit(`ip:${address}`) || !withinEmailRateLimit(`email:${email}`)) return response(headers, 429, { error: "Too many email sign-in attempts. Try again later." });
      const code = verificationCode(); const challenge = random(); const createdAt = now(); const expiresAt = createdAt + 10 * 60_000; const emailHash = await emailKey(email);
      await sendEmailCode(env, email, code);
      await db.batch([
        db.prepare("DELETE FROM email_auth_challenges WHERE expires_at <= ? OR email_hash = ?").bind(createdAt, emailHash),
        db.prepare("INSERT INTO email_auth_challenges (challenge_hash, email, email_hash, code_hash, attempts, created_at, expires_at) VALUES (?, ?, ?, ?, 0, ?, ?)").bind(await hash(challenge), email, emailHash, await hash(code), createdAt, expiresAt),
      ]);
      return response(headers, 200, { challenge, expiresAt });
    } catch (error) { return response(headers, 400, { error: error.message || "Could not send an email sign-in code." }); }
  }
  if (request.method === "POST" && path === "/api/sync/email/verify") {
    try {
      const body = await readBody(request, 20_000); const challenge = String(body.challenge || ""); const code = String(body.code || "").trim();
      if (!challenge || !/^\d{6}$/.test(code)) throw new Error("Enter the six-digit sign-in code.");
      const challengeHash = await hash(challenge); const pending = await db.prepare("SELECT email, email_hash, code_hash, attempts, expires_at FROM email_auth_challenges WHERE challenge_hash = ?").bind(challengeHash).first();
      if (!pending || Number(pending.expires_at) <= now()) throw new Error("This email sign-in code expired. Request a new one.");
      if (Number(pending.attempts) >= 5) throw new Error("Too many incorrect codes. Request a new one.");
      if (await hash(code) !== pending.code_hash) {
        await db.prepare("UPDATE email_auth_challenges SET attempts = attempts + 1 WHERE challenge_hash = ?").bind(challengeHash).run();
        throw new Error("That sign-in code is not correct.");
      }
      await db.prepare("DELETE FROM email_auth_challenges WHERE challenge_hash = ?").bind(challengeHash).run();
      const existing = await db.prepare("SELECT id FROM sync_users WHERE email_hash = ?").bind(pending.email_hash).first();
      const userId = String(existing?.id || `email:${pending.email_hash.slice(0, 32)}`); const sessionToken = random(); const expiresAt = now() + 30 * 86400_000;
      await db.batch([
        db.prepare("INSERT INTO sync_users (id, login, email_hash, provider, created_at) VALUES (?, ?, ?, 'email', ?) ON CONFLICT(id) DO UPDATE SET login = excluded.login, email_hash = excluded.email_hash, provider = 'email'").bind(userId, pending.email, pending.email_hash, now()),
        db.prepare("INSERT INTO sync_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await hash(sessionToken), userId, expiresAt),
      ]);
      return response(headers, 200, { token: sessionToken, user: { id: userId, login: pending.email, email: pending.email, provider: "email" }, expiresAt });
    } catch (error) { return response(headers, 400, { error: error.message || "Could not complete email sign-in." }); }
  }
  if (request.method === "GET" && path === "/api/sync/status") {
    const current = await requireSession(request, env, headers); if (current instanceof Response) return current;
    const blob = await db.prepare("SELECT revision, updated_at FROM sync_blobs WHERE user_id = ?").bind(current.user_id).first();
    return response(headers, 200, { user: { id: current.user_id, login: current.login, provider: current.provider || "github" }, revision: Number(blob?.revision || 0), updatedAt: blob?.updated_at || null });
  }
  if (request.method === "GET" && path === "/api/sync/blob") {
    const current = await requireSession(request, env, headers); if (current instanceof Response) return current;
    try {
      const blob = await db.prepare("SELECT revision, encrypted_payload, updated_at FROM sync_blobs WHERE user_id = ?").bind(current.user_id).first();
      return response(headers, 200, blob ? { revision: Number(blob.revision), backup: await decryptAccountBackup(env, current.user_id, JSON.parse(blob.encrypted_payload)), updatedAt: blob.updated_at } : { revision: 0, backup: null, updatedAt: null });
    } catch (error) { return response(headers, 409, { error: error.message || "Could not read the account sync copy." }); }
  }
  if (request.method === "PUT" && path === "/api/sync/blob") {
    try {
      const current = await requireSession(request, env, headers); if (current instanceof Response) return current;
      const body = await readBody(request); if (!validateBackup(body.backup)) throw new Error("Only a valid account archive can be synced.");
      const expected = Math.max(0, Number(body.revision) || 0); const existing = await db.prepare("SELECT revision FROM sync_blobs WHERE user_id = ?").bind(current.user_id).first(); const actual = Number(existing?.revision || 0);
      if (actual !== expected) return response(headers, 409, { error: "A newer encrypted archive is available.", revision: actual });
      const revision = actual + 1; const updatedAt = now();
      const encrypted = await encryptAccountBackup(env, current.user_id, body.backup);
      await db.prepare("INSERT INTO sync_blobs (user_id, revision, encrypted_payload, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET revision = excluded.revision, encrypted_payload = excluded.encrypted_payload, updated_at = excluded.updated_at").bind(current.user_id, revision, JSON.stringify(encrypted), updatedAt).run();
      return response(headers, 200, { revision, updatedAt });
    } catch (error) { return response(headers, 400, { error: error.message || "Could not save the account archive." }); }
  }
  if (request.method === "POST" && path === "/api/sync/logout") {
    const token = bearer(request); if (token) await db.prepare("DELETE FROM sync_sessions WHERE token_hash = ?").bind(await hash(token)).run();
    return response(headers, 200, { ok: true });
  }
  return response(headers, 404, { error: "Sync route not found." });
};
