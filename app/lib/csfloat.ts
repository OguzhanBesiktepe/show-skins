import { redis } from "./redis";

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

export type CSFloatInspectData = {
  inspect_link: string | null;
  float_value: number | null;
  wear_name: string | null;
};

export async function getCSFloatInspectData(
  marketHashName: string,
): Promise<CSFloatInspectData | null> {
  const cacheKey = `inspect:${marketHashName}`;

  const cached = await redis.get<CSFloatInspectData>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}/render?start=0&count=1&currency=1&language=english&format=json`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.warn("[SteamInspect] Non-OK:", res.status, "for:", marketHashName);
      return null;
    }

    const json = await res.json();

    if (!json.success || !json.listinginfo || !json.assets) return null;

    // Grab the first listing
    const listingId = Object.keys(json.listinginfo)[0];
    if (!listingId) return null;

    const listing = json.listinginfo[listingId];
    const assetId = listing?.asset?.id;
    if (!assetId) return null;

    // Get the inspect link template and substitute placeholders
    const assetData = json.assets?.["730"]?.["2"]?.[assetId];
    const linkTemplate: string | undefined =
      assetData?.market_actions?.[0]?.link;

    if (!linkTemplate) return null;

    const inspectLink = linkTemplate
      .replace("%listingid%", listingId)
      .replace("%assetid%", assetId);

    const data: CSFloatInspectData = {
      inspect_link: inspectLink,
      float_value: null,
      wear_name: null,
    };

    await redis.set(cacheKey, data, { ex: CACHE_TTL_SECONDS });
    return data;
  } catch (err) {
    console.error("[SteamInspect] Fetch error:", err);
    return null;
  }
}
