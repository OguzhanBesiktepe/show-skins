import SkinCard from "@/app/components/SkinCard";
import Pagination from "@/app/components/Pagination";

type Skin = {
  id: string;
  name: string;
  image: string;
  stattrak?: boolean;
  weapon?: { name?: string };
  rarity?: { name?: string; color?: string };
  collection?: { name?: string };
};

async function getSkins(): Promise<Skin[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" }
  );
  return res.json();
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

function getCategoryFromWeapon(weaponName: string): string {
  const name = weaponName.toLowerCase();
  if (
    name.includes("knife") ||
    name.includes("karambit") ||
    name.includes("bayonet") ||
    name.includes("dagger")
  )
    return "knives";
  if (name.includes("gloves") || name.includes("wraps")) return "gloves";
  const map: Record<string, string> = {
    "cz75-auto": "pistols",
    "desert eagle": "pistols",
    "dual berettas": "pistols",
    "five-seven": "pistols",
    "glock-18": "pistols",
    p2000: "pistols",
    p250: "pistols",
    "r8 revolver": "pistols",
    "tec-9": "pistols",
    "usp-s": "pistols",
    "zeus x27": "pistols",
    "mac-10": "smgs",
    "mp5-sd": "smgs",
    mp7: "smgs",
    mp9: "smgs",
    p90: "smgs",
    "pp-bizon": "smgs",
    "ump-45": "smgs",
    m249: "lmgs",
    negev: "lmgs",
    "mag-7": "shotguns",
    nova: "shotguns",
    "sawed-off": "shotguns",
    xm1014: "shotguns",
    "ak-47": "rifles",
    aug: "rifles",
    awp: "rifles",
    famas: "rifles",
    g3sg1: "rifles",
    "galil ar": "rifles",
    "m4a1-s": "rifles",
    m4a4: "rifles",
    "scar-20": "rifles",
    "sg 553": "rifles",
    "ssg 08": "rifles",
  };
  return map[name] ?? "rifles";
}

function pickRandomUnique<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const PER_PAGE = 48;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);

  const skins = await getSkins();

  const unique = Array.from(
    new Map(skins.map((s) => [getBaseKey(s), s])).values()
  );

  const shuffled = pickRandomUnique(unique, unique.length);

  const total = shuffled.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const start = (safePage - 1) * PER_PAGE;
  const pageItems = shuffled.slice(start, start + PER_PAGE);

  return (
    <main className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: "CS Regular" }}
        >
          Browse All Counter Strike Skins
        </h1>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageItems.map((skin) => {
            const weaponSlug = slugifyWeaponName(skin.weapon?.name ?? "");
            const skinSlug = slugifySkinName(normalizeBaseName(skin.name));
            const category = getCategoryFromWeapon(skin.weapon?.name ?? "");
            return (
              <SkinCard
                key={getBaseKey(skin)}
                href={`/browse/${category}/${weaponSlug}/${skinSlug}`}
                weapon={skin.weapon?.name ?? "Unknown"}
                name={normalizeBaseName(skin.name)}
                rarityLabel={skin.rarity?.name ?? "Unknown"}
                rarityColor={skin.rarity?.color ?? "#888888"}
                hasStatTrak={skin.stattrak ?? false}
                imageUrl={skin.image}
                sourceLabel={skin.collection?.name}
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
