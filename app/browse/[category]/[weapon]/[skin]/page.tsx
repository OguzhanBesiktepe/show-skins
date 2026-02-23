import Image from "next/image";
import Link from "next/link";

type Skin = {
  id: string;
  name: string;
  description?: string;
  image: string;
  stattrak?: boolean;
  inspect_link?: string;
  weapon?: { name?: string };
  rarity?: { name?: string; color?: string };
  collection?: { name?: string; image?: string };
};

type CSFloatListing = {
  price: number;
  item: {
    scm: { price: number; volume: number };
    float_value: number;
    wear_name: string;
    inspect_link: string;
  };
};

async function getSkins(): Promise<Skin[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" },
  );
  return res.json();
}

async function getCSFloatData(
  marketHashName: string,
): Promise<CSFloatListing | null> {
  try {
    const url = `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(marketHashName)}&limit=1&sort_by=lowest_price`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

function normalizeBaseName(name: string) {
  return name
    .replace(/^(★\s*)?(StatTrak™\s*)?(Souvenir\s*)?/i, "")
    .replace(
      /\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i,
      "",
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

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
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
      slugifySkinName(normalizeBaseName(s.name)) === skinSlug,
  );

  if (!matched) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center">
        <p className="text-zinc-400">Skin not found.</p>
      </main>
    );
  }

  const displayName = normalizeBaseName(matched.name);

  // Fetch CSFloat data for Field-Tested as reference

  const skinOnlyName = displayName.includes("|")
    ? displayName.split("|").slice(1).join("|").trim()
    : displayName;

  const isKnifeOrGlove =
    matched.weapon?.name?.toLowerCase().includes("knife") ||
    matched.weapon?.name?.toLowerCase().includes("karambit") ||
    matched.weapon?.name?.toLowerCase().includes("bayonet") ||
    matched.weapon?.name?.toLowerCase().includes("dagger") ||
    matched.weapon?.name?.toLowerCase().includes("gloves") ||
    matched.weapon?.name?.toLowerCase().includes("wraps");

  const starPrefix = isKnifeOrGlove ? "★ " : "";
  const wearSuffix = isKnifeOrGlove ? "(Minimal Wear)" : "(Field-Tested)";
  const marketHashName = `${starPrefix}${matched.weapon?.name} | ${skinOnlyName} ${wearSuffix}`;

  const floatData = await getCSFloatData(marketHashName);
  const scmPrice = floatData?.item?.scm?.price;
  const inspectLink = floatData?.item?.inspect_link ?? matched.inspect_link;

  // Steam Market URL
  const steamMarketUrl = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(marketHashName)}`;

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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center bg-[#1f2937] rounded-xl border border-zinc-800 p-8">
              <Image
                src={matched.image}
                alt={displayName}
                width={400}
                height={300}
                className="object-contain"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href={steamMarketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#1b2838] hover:bg-[#2a475e] text-white font-semibold px-5 py-3 rounded-lg border border-zinc-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.37l3.03-6.27a3.5 3.5 0 1 1 4.04-4.04l6.27-3.03C19.8 3.44 15.3 0 12 0z" />
                </svg>
                View on Steam Market
              </Link>

              {inspectLink && (
                <Link
                  href={inspectLink}
                  className="flex items-center justify-center gap-2 bg-[#4caf50]/10 hover:bg-[#4caf50]/20 text-[#4caf50] font-semibold px-5 py-3 rounded-lg border border-[#4caf50]/30 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Inspect in Game
                </Link>
              )}
            </div>
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

            {/* Price */}
            <div className="bg-[#1f2937] rounded-xl border border-zinc-800 p-5">
              <h2 className="text-lg font-semibold mb-3">Market Price</h2>
              {scmPrice ? (
                <div className="flex flex-col gap-1">
                  <p className="text-zinc-300">
                    Steam Market Price:{" "}
                    <span className="text-white font-semibold text-xl">
                      {formatPrice(scmPrice)}
                    </span>
                  </p>
                  {floatData?.item?.volume !== undefined && (
                    <p className="text-zinc-400 text-sm mt-1">
                      {floatData.item.scm.volume} recent sales
                    </p>
                  )}
                  <p className="text-zinc-500 text-xs mt-2">
                    Field-Tested reference price via Steam Community Market
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
