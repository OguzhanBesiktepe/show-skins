import Image from "next/image";

type Skin = {
  id: string;
  name: string;
  description?: string;
  image: string;
  stattrak?: boolean;
  weapon?: { name?: string };
  rarity?: { name?: string; color?: string };
  collection?: { name?: string; image?: string };
};

type SteamPrice = {
  success: boolean;
  lowest_price?: string;
  median_price?: string;
  volume?: string;
};

async function getSkins(): Promise<Skin[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" }
  );
  return res.json();
}

async function getSteamPrice(
  marketHashName: string
): Promise<SteamPrice | null> {
  try {
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(
      marketHashName
    )}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return res.json();
  } catch {
    return null;
  }
}

function normalizeBaseName(name: string) {
  return name
    .replace(/^(★\s*)?(StatTrak™\s*)?(Souvenir\s*)?/i, "")
    .replace(
      /\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i,
      ""
    )
    .trim();
}

function slugifyWeaponName(name: string) {
  return name
    .replace(/^★\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifySkinName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Splits description into main text and italic flavour quote
function parseDescription(raw: string) {
  const cleaned = raw.replace(/\\n/g, "\n").replace(/\\/g, "");
  const parts = cleaned.split(/\n+/);
  const main: string[] = [];
  const flavour: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const iMatch = trimmed.match(/^<i>(.*)<\/i>$/i);
    if (iMatch) {
      flavour.push(iMatch[1]);
    } else {
      main.push(trimmed.replace(/<[^>]+>/g, ""));
    }
  }

  return { main: main.join(" "), flavour: flavour.join(" ") };
}

export default async function SkinDetailPage({
  params,
}: {
  params: Promise<{ category: string; weapon: string; skin: string }>;
}) {
  const { weapon, skin: skinSlug } = await params;
  const skins = await getSkins();

  const matched = skins.find(
    (s) =>
      slugifyWeaponName(s.weapon?.name ?? "") === weapon &&
      slugifySkinName(normalizeBaseName(s.name)) === skinSlug
  );

  if (!matched) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center">
        <p className="text-zinc-400">Skin not found.</p>
      </main>
    );
  }

  const displayName = normalizeBaseName(matched.name);
  const marketName = `${matched.weapon?.name} | ${displayName} (Field-Tested)`;
  const price = await getSteamPrice(marketName);
  const description = matched.description
    ? parseDescription(matched.description)
    : null;

  return (
    <main className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-zinc-400 text-sm uppercase tracking-widest">
            {matched.weapon?.name}
          </p>
          <h1
            className="text-4xl font-bold mt-1"
            style={{ fontFamily: "CS Regular" }}
          >
            {displayName}
          </h1>
          {matched.rarity && (
            <span
              className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: matched.rarity.color ?? "#888" }}
            >
              {matched.rarity.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="flex items-center justify-center bg-[#1f2937] rounded-xl border border-zinc-800 p-8">
            <Image
              src={matched.image}
              alt={displayName}
              width={400}
              height={300}
              className="object-contain"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* StatTrak */}
            {matched.stattrak && (
              <div className="bg-[#1f2937] border border-zinc-700 rounded-lg px-4 py-3">
                <span className="text-[#f89406] font-semibold">
                  StatTrak™ Available
                </span>
              </div>
            )}

            {/* Steam Price */}
            <div className="bg-[#1f2937] rounded-xl border border-zinc-800 p-5">
              <h2 className="text-lg font-semibold mb-3">Market Price</h2>
              {price?.success && (price.lowest_price || price.median_price) ? (
                <div className="flex flex-col gap-1">
                  {price.lowest_price && (
                    <p className="text-zinc-300">
                      Lowest:{" "}
                      <span className="text-white font-semibold">
                        {price.lowest_price}
                      </span>
                    </p>
                  )}
                  {price.median_price && (
                    <p className="text-zinc-300">
                      Median:{" "}
                      <span className="text-white font-semibold">
                        {price.median_price}
                      </span>
                    </p>
                  )}
                  {price.volume && (
                    <p className="text-zinc-400 text-sm mt-1">
                      {price.volume} sold recently
                    </p>
                  )}
                  <p className="text-zinc-500 text-xs mt-2">
                    Field-Tested reference price via Steam Market
                  </p>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">Price data unavailable</p>
              )}
            </div>

            {/* Description */}
            {description && (
              <div className="bg-[#1f2937] rounded-xl border border-zinc-800 p-5">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                {description.main && (
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {description.main}
                  </p>
                )}
                {description.flavour && (
                  <p className="text-zinc-500 text-sm italic mt-3 border-l-2 border-zinc-600 pl-3">
                    {description.flavour}
                  </p>
                )}
              </div>
            )}

            {/* Collection */}
            {matched.collection && (
              <div className="bg-[#1f2937] rounded-xl border border-zinc-800 p-5">
                <h2 className="text-lg font-semibold mb-2">Collection</h2>
                <div className="flex items-center gap-3">
                  {matched.collection.image && (
                    <img
                      src={matched.collection.image}
                      alt=""
                      className="h-8 w-8 object-contain"
                    />
                  )}
                  <span className="text-zinc-300">
                    {matched.collection.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
