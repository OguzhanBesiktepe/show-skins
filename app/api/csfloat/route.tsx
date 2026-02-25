// app/api/csfloat/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CacheEntry = { expires: number; data: any };
const mem = new Map<string, CacheEntry>();
const TTL_MS = 60_000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const marketHashName = searchParams.get("marketHashName") ?? "";

  if (!marketHashName) {
    return NextResponse.json(
      { error: "Missing marketHashName" },
      { status: 400 },
    );
  }

  const apiKey = process.env.CSFLOAT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing CSFLOAT_API_KEY" },
      { status: 500 },
    );
  }

  const now = Date.now();
  const cached = mem.get(marketHashName);
  if (cached && cached.expires > now) {
    return NextResponse.json(cached.data, { status: 200 });
  }

  const url = `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(
    marketHashName,
  )}&limit=1&sort_by=lowest_price`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    cache: "no-store",
  });

  // IMPORTANT: don’t cache non-200 responses
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "CSFloat failed", status: res.status, body: text.slice(0, 300) },
      { status: res.status },
    );
  }

  const data = await res.json();

  // Cache ONLY success
  mem.set(marketHashName, { data, expires: now + TTL_MS });

  return NextResponse.json(data, { status: 200 });
}
