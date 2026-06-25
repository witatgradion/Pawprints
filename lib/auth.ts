// Minimal Google-OAuth session, built on Web Crypto so it runs in both the
// Edge middleware and Node route handlers. No external auth dependency.

export const SESSION_COOKIE = "pp_session";
export const STATE_COOKIE = "pp_oauth_state";
export const ALLOWED_DOMAIN = "gradion.com";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Auth is only enforced once these are configured (so the prototype still runs locally without it). */
export function authConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

const enc = new TextEncoder();

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(s: string): Uint8Array {
  const norm = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm.length % 4 ? 4 - (norm.length % 4) : 0;
  const bin = atob(norm + "=".repeat(pad));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(process.env.AUTH_SECRET ?? ""), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export type Session = { email: string; exp: number };

export async function signSession(session: Session): Promise<string> {
  const data = bytesToB64url(enc.encode(JSON.stringify(session)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(data));
  return `${data}.${bytesToB64url(new Uint8Array(sig))}`;
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  try {
    // re-sign and compare strings (avoids passing decoded bytes into subtle.verify)
    const expected = bytesToB64url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(data))));
    if (expected.length !== sig.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    if (diff !== 0) return null;
    const session = JSON.parse(new TextDecoder().decode(b64urlToBytes(data))) as Session;
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function emailAllowed(email: string | undefined, hd: string | undefined): boolean {
  if (hd === ALLOWED_DOMAIN) return true;
  return Boolean(email && email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`));
}
