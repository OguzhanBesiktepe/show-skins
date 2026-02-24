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
  reference: {
    base_price: number;
    predicted_price: number;
    quantity: number;
  };
  item: {
    float_value: number;
    wear_name: string;
    inspect_link: string;
  };
};

let skinsCache: Skin[] | null = null;

async function getSkins(): Promise<Skin[]> {
  if (skinsCache) return skinsCache;
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
  );
  skinsCache = await res.json();
  return skinsCache!;
}

async function getCSFloatData(
  marketHashName: string,
): Promise<CSFloatListing | null> {
  try {
    const url = `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(marketHashName)}&limit=5&sort_by=lowest_price`;
    const res = await fetch(url, {
      headers: {
        Authorization: process.env.CSFLOAT_API_KEY ?? "",
      },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    console.log("PROD - API key present:", !!process.env.CSFLOAT_API_KEY);
    console.log("PROD - Status:", res.status);
    console.log("PROD - Body:", JSON.stringify(data).slice(0, 200));
    return data?.data?.[0] ?? null;
  } catch (e) {
    console.log("PROD - Error:", e);
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
  const lowestPrice = floatData?.price;
  const basePrice = floatData?.reference?.base_price;
  const quantity = floatData?.reference?.quantity;
  const inspectLink = floatData?.item?.inspect_link;

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
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.187.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
                </svg>
                View on Steam Market
              </Link>

              {inspectLink && (
                <a
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
                </a>
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
              {lowestPrice ? (
                <div className="flex flex-col gap-2">
                  <p className="text-zinc-300">
                    Lowest Listing:{" "}
                    <span className="text-white font-semibold text-xl">
                      {formatPrice(lowestPrice)}
                    </span>
                  </p>
                  {basePrice && (
                    <p className="text-zinc-300">
                      Reference Price:{" "}
                      <span className="text-white font-semibold">
                        {formatPrice(basePrice)}
                      </span>
                    </p>
                  )}
                  {quantity && (
                    <p className="text-zinc-400 text-sm mt-1">
                      {quantity} listings available on CSFloat
                    </p>
                  )}
                  <p className="text-zinc-500 text-xs mt-1">
                    {wearSuffix.replace(/[()]/g, "")} price via CSFloat
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
