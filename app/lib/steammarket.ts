type SteamMarketPrice = {
  lowest_price: string | null;
  median_price: string | null;
  volume: string | null;
};

export async function getSteamMarketPrice(
  marketHashName: string,
): Promise<SteamMarketPrice | null> {
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;
    const res = await fetch(url, { next: { revalidate: 1800 } }); // 30-min Next.js cache

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success) return null;

    return {
      lowest_price: data.lowest_price ?? null,
      median_price: data.median_price ?? null,
      volume: data.volume ?? null,
    };
  } catch {
    return null;
  }
}
