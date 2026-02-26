const CACHE_TTL_MS = 30 * 60_000; // 30 minutes

export type CSFloatInspectData = {
  inspect_link: string | null;
  float_value: number | null;
  wear_name: string | null;
};

type CacheEntry = { data: CSFloatInspectData; expires: number };

const memCache = new Map<string, CacheEntry>();

export async function getCSFloatInspectData(
  marketHashName: string,
): Promise<CSFloatInspectData | null> {
  const apiKey = process.env.CSFLOAT_API_KEY;
  if (!apiKey) return null;

  const cached = memCache.get(marketHashName);
  if (cached && cached.expires > Date.now()) return cached.data;

  try {
    const res = await fetch(
      `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(marketHashName)}&limit=1&sort_by=lowest_price`,
      { headers: { Authorization: apiKey }, cache: "no-store" },
    );

    if (res.status === 429) {
      console.warn("[CSFloat] Rate limited, serving stale for:", marketHashName);
      return cached?.data ?? null;
    }

    if (!res.ok) {
      console.warn("[CSFloat] Non-OK:", res.status, "for:", marketHashName);
      return cached?.data ?? null;
    }

    const json = await res.json();
    const listing = json?.data?.[0] ?? null;

    const data: CSFloatInspectData = {
      inspect_link: listing?.item?.inspect_link ?? null,
      float_value: listing?.item?.float_value ?? null,
      wear_name: listing?.item?.wear_name ?? null,
    };

    memCache.set(marketHashName, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    console.error("[CSFloat] Fetch error:", err);
    return cached?.data ?? null;
  }
}
