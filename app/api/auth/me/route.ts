import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.steamId) {
    return NextResponse.json({});
  }
  return NextResponse.json({
    steamId: session.steamId,
    name: session.name,
    avatar: session.avatar,
  });
}
