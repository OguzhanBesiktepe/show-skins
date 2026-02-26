import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";
import { redis } from "@/app/lib/redis";

type FavoriteData = {
  skinId: string;
  skinName: string;
  skinImage: string;
  skinPath: string;
  addedAt: string;
};

function key(steamId: string) {
  return `fav:${steamId}`;
}

// GET /api/favorites — returns the logged-in user's favorites
export async function GET() {
  const session = await getSession();
  if (!session.steamId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await redis.hgetall<Record<string, string>>(key(session.steamId));
  if (!data) return NextResponse.json([]);

  const favorites = Object.values(data)
    .map((v) => (typeof v === "string" ? JSON.parse(v) : v) as FavoriteData)
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

  return NextResponse.json(favorites);
}

// POST /api/favorites — add a favorite (must be logged in)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.steamId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { skinId, skinName, skinImage, skinPath } = body;
  if (!skinId || !skinName || !skinImage || !skinPath) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const value: FavoriteData = {
    skinId,
    skinName,
    skinImage,
    skinPath,
    addedAt: new Date().toISOString(),
  };

  await redis.hset(key(session.steamId), { [skinId]: JSON.stringify(value) });

  return NextResponse.json({ ok: true });
}

// DELETE /api/favorites — remove a favorite (must be logged in)
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session.steamId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { skinId } = body;
  if (!skinId) {
    return NextResponse.json({ error: "Missing skinId" }, { status: 400 });
  }

  await redis.hdel(key(session.steamId), skinId);

  return NextResponse.json({ ok: true });
}
