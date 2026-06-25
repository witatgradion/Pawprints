import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_DOMAIN, STATE_COOKIE } from "@/lib/auth";

// Kick off Google OAuth. redirect_uri is derived from the request origin so it
// works on localhost and on Vercel (register both in the Google OAuth client).
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${origin}/api/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    hd: ALLOWED_DOMAIN, // hint Google to the Workspace domain
    prompt: "select_account",
    state,
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
