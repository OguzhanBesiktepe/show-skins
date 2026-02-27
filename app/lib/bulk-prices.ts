// Fetches all CS2 prices from Skinport's free public API in one bulk request.
// No API key required. One fetch per hour, zero per-skin API calls.
// Docs: https://docs.skinport.com/items

type SkinportItem = {
  market_hash_name: string;
  min_price: number | null;
  median_price: number | null;
  quantity: number;
  item_page?: string;
};

export type PriceMap = Record<string, SkinportItem>;

let priceCache: { data: PriceMap; expires: number } | null = null;

async function fetchBulkPrices(): Promise<PriceMap> {
  try {
    const res = await fetch(
      "https://api.skinport.com/v1/items?app_id=730&currency=USD",
      {
        cache: "no-store",
        headers: { "Accept-Encoding": "br, gzip" },
      },
    );
    if (!res.ok) return {};

    const items: SkinportItem[] = await res.json();
    const map: PriceMap = {};
    for (const item of items) {
      map[item.market_hash_name] = item;
    }
    return map;
  } catch {
    return {};
  }
}

export async function getAllPrices(): Promise<PriceMap> {
  const now = Date.now();
  if (priceCache && priceCache.expires > now) return priceCache.data;

  const data = await fetchBulkPrices();
  priceCache = { data, expires: now + 60 * 60_000 }; // refresh every hour
  return data;
}

function fmt(n: number | null): string | null {
  return n != null ? `$${n.toFixed(2)}` : null;
}

export function lookupPrice(
  priceMap: PriceMap,
  marketHashName: string,
): { lowest: string | null; median: string | null; quantity: number | null; skinportUrl: string | null } {
  const item = priceMap[marketHashName];
  return {
    lowest: fmt(item?.min_price ?? null),
    median: fmt(item?.median_price ?? null),
    quantity: item?.quantity ?? null,
    skinportUrl: item?.item_page ?? null,
  };
}
