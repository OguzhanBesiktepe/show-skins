import SkinCard from "@/app/components/SkinCard";
import Pagination from "@/app/components/Pagination";
import { getAllPrices, lookupPrice } from "@/app/lib/bulk-prices";

type Skin = {
  id: string;
  name: string;
  image: string;
  stattrak?: boolean;
  weapon?: { name?: string };
  rarity?: { name?: string; color?: string };
  collection?: { name?: string; image?: string };
};

async function getSkins(): Promise<Skin[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" },
  );
  return res.json();
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

function getBaseKey(s: Skin) {
  const weapon = (s.weapon?.name ?? "").toLowerCase().trim();
  const base = normalizeBaseName(s.name).toLowerCase();
  return `${weapon}|${base}`;
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

function buildMarketHashName(skin: Skin): string {
  const weaponName = skin.weapon?.name ?? "";
  const lower = weaponName.toLowerCase();
  const isKnife =
    lower.includes("knife") ||
    lower.includes("karambit") ||
    lower.includes("bayonet") ||
    lower.includes("dagger");
  const isGlove = lower.includes("gloves") || lower.includes("wraps");

  const displayName = normalizeBaseName(skin.name);
  const skinOnlyName = displayName.includes("|")
    ? displayName.split("|").slice(1).join("|").trim()
    : displayName;

  const starPrefix = isKnife || isGlove ? "★ " : "";
  const wearSuffix = isKnife ? "(Minimal Wear)" : "(Field-Tested)";
  return `${starPrefix}${weaponName} | ${skinOnlyName} ${wearSuffix}`;
}

const PER_PAGE = 48;

export default async function WeaponPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; weapon: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { weapon, category } = await params;
  const resolvedSearchParams = await searchParams;

  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);

  const [skins, priceMap] = await Promise.all([getSkins(), getAllPrices()]);

  const filtered = skins.filter(
    (s) => slugifyWeaponName(s.weapon?.name ?? "") === weapon,
  );

  const weaponName = filtered[0]?.weapon?.name ?? weapon;

  const unique = Array.from(
    new Map(filtered.map((s) => [getBaseKey(s), s])).values(),
  );

  const total = unique.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const start = (safePage - 1) * PER_PAGE;
  const pageItems = unique.slice(start, start + PER_PAGE);

  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + pageItems.length, total);

  return (
    <main className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold" style={{ fontFamily: "CS Regular" }}>
          {weaponName} Skins
        </h1>

        <p className="mt-2 text-zinc-400">
          Showing {from} - {to}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageItems.map((skin) => {
            const skinSlug = slugifySkinName(normalizeBaseName(skin.name));
            const { median } = lookupPrice(priceMap, buildMarketHashName(skin));
            return (
              <SkinCard
                key={getBaseKey(skin)}
                href={`/browse/${category}/${weapon}/${skinSlug}`}
                weapon={skin.weapon?.name ?? "Unknown"}
                name={normalizeBaseName(skin.name)}
                rarityLabel={skin.rarity?.name ?? "Unknown"}
                rarityColor={skin.rarity?.color ?? "#888888"}
                hasStatTrak={skin.stattrak ?? false}
                imageUrl={skin.image}
                sourceLabel={skin.collection?.name}
                sourceImageUrl={skin.collection?.image}
                priceRange={median ?? undefined}
              />
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Pagination currentPage={safePage} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}
