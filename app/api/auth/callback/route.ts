import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, STATE_COOKIE, SESSION_TTL_MS, emailAllowed, signSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const origin = url.origin;
  const fail = (error: string) => NextResponse.redirect(`${origin}/login?error=${error}`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !savedState || state !== savedState) return fail("state");

  // exchange the code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: `${origin}/api/auth/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail("token");
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return fail("token");

  // fetch the verified profile
  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!userRes.ok) return fail("profile");
  const profile = (await userRes.json()) as { email?: string; email_verified?: boolean; hd?: string };

  if (profile.email_verified === false || !emailAllowed(profile.email, profile.hd)) return fail("domain");

  const session = await signSession({ email: profile.email ?? "", exp: Date.now() + SESSION_TTL_MS });
  const res = NextResponse.redirect(`${origin}/dashboard`);
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
  res.cookies.delete(STATE_COOKIE);
  return res;
}
