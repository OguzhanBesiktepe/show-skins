import { redis } from "./redis";

const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes

export type CSFloatInspectData = {
  inspect_link: string | null;
  float_value: number | null;
  wear_name: string | null;
};

export async function getCSFloatInspectData(
  marketHashName: string,
): Promise<CSFloatInspectData | null> {
  const apiKey = process.env.CSFLOAT_API_KEY;
  if (!apiKey) return null;

  const cacheKey = `csfloat:${marketHashName}`;

  // Check Redis cache — persists across all serverless invocations
  const cached = await redis.get<CSFloatInspectData>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(marketHashName)}&limit=1&sort_by=lowest_price`,
      { headers: { Authorization: apiKey }, cache: "no-store" },
    );

    if (res.status === 429) {
      console.warn("[CSFloat] Rate limited for:", marketHashName);
      return null;
    }

    if (!res.ok) {
      console.warn("[CSFloat] Non-OK:", res.status, "for:", marketHashName);
      return null;
    }

    const json = await res.json();
    const listing = json?.data?.[0] ?? null;

    const data: CSFloatInspectData = {
      inspect_link: listing?.item?.inspect_link ?? null,
      float_value: listing?.item?.float_value ?? null,
      wear_name: listing?.item?.wear_name ?? null,
    };

    await redis.set(cacheKey, data, { ex: CACHE_TTL_SECONDS });
    return data;
  } catch (err) {
    console.error("[CSFloat] Fetch error:", err);
    return null;
  }
}
