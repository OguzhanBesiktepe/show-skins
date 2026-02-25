import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const marketHashName = searchParams.get("marketHashName");

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

  const url = `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(
    marketHashName,
  )}&limit=1&sort_by=lowest_price`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: "CSFloat request failed",
        status: res.status,
        body: text.slice(0, 300),
      },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
