import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSession } from "@/app/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Verify the OpenID assertion by re-POSTing to Steam with mode=check_authentication
  const verifyParams = new URLSearchParams(searchParams);
  verifyParams.set("openid.mode", "check_authentication");

  const verifyRes = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verifyParams.toString(),
  });

  const verifyText = await verifyRes.text();
  if (!verifyText.includes("is_valid:true")) {
    return NextResponse.json({ error: "Steam login verification failed" }, { status: 401 });
  }

  // Extract the 64-bit Steam ID from the claimed_id URL
  const claimedId = searchParams.get("openid.claimed_id") ?? "";
  const steamIdMatch = claimedId.match(/\/(\d+)$/);
  if (!steamIdMatch) {
    return NextResponse.json({ error: "Could not extract Steam ID" }, { status: 400 });
  }
  const steamId = steamIdMatch[1];

  // Fetch the Steam profile
  const apiKey = process.env.STEAM_API_KEY;
  const profileRes = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`,
  );
  const profileData = await profileRes.json();
  const player = profileData?.response?.players?.[0];

  // Persist to session cookie
  const session = await getSession();
  session.steamId = steamId;
  session.name = player?.personaname ?? "Unknown";
  session.avatar = player?.avatarmedium ?? "";
  await session.save();

  // Redirect back to origin
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = process.env.VERCEL ? "https" : "http";
  return NextResponse.redirect(`${proto}://${host}/`);
}
