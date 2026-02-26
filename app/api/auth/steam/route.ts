import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = process.env.VERCEL ? "https" : "http";
  const returnTo = `${proto}://${host}/api/auth/steam/callback`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": `${proto}://${host}`,
    "openid.identity":
      "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id":
      "http://specs.openid.net/auth/2.0/identifier_select",
  });

  return NextResponse.redirect(
    `https://steamcommunity.com/openid/login?${params}`,
  );
}
