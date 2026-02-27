type SteamMarketPrice = {
  lowest_price: string | null;
  median_price: string | null;
  volume: string | null;
};

type CacheEntry = { expires: number; data: SteamMarketPrice };

const cache = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60_000; // 30 minutes

export async function getSteamMarketPrice(
  marketHashName: string,
): Promise<SteamMarketPrice | null> {
  const now = Date.now();
  const cached = cache.get(marketHashName);
  if (cached && cached.expires > now) return cached.data;

  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;

  try {
    let res = await fetch(url, { cache: "no-store" });

    // One retry after a short wait on rate limit
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 600));
      res = await fetch(url, { cache: "no-store" });
    }

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    const result: SteamMarketPrice = {
      lowest_price: data.lowest_price ?? null,
      median_price: data.median_price ?? null,
      volume: data.volume ?? null,
    };

    cache.set(marketHashName, { data: result, expires: now + TTL_MS });
    return result;
  } catch {
    return null;
  }
}
