import SkinCard from "@/app/components/SkinCard";
import Pagination from "@/app/components/Pagination";

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
  return (
    name
      // remove star, stattrak, souvenir (any combo at start)
      .replace(/^(★\s*)?(StatTrak™\s*)?(Souvenir\s*)?/i, "")
      // remove wear suffix
      .replace(
        /\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i,
        "",
      )
      .trim()
  );
}

function getBaseKey(s: Skin) {
  const weapon = (s.weapon?.name ?? "").toLowerCase().trim();
  const base = normalizeBaseName(s.name).toLowerCase();
  return `${weapon}|${base}`;
}

function slugToWeaponName(slug: string) {
  const map: Record<string, string> = {
    "cz75-auto": "CZ75-Auto",
    "desert-eagle": "Desert Eagle",
    "dual-berettas": "Dual Berettas",
    "five-seven": "Five-SeveN",
    "glock-18": "Glock-18",
    p2000: "P2000",
    p250: "P250",
    "r8-revolver": "R8 Revolver",
    "tec-9": "Tec-9",
    "usp-s": "USP-S",
    "zeus-x27": "Zeus x27",
  };
  return map[slug] ?? slug;
}

const PER_PAGE = 48;

export default async function WeaponPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; weapon: string }>;
  searchParams?: { page?: string };
}) {
  const resolvedParams = await params;
  const { weapon } = resolvedParams;

  const pageParam = searchParams?.page;
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const skins = await getSkins();
  const weaponName = slugToWeaponName(weapon);

  const filtered = skins.filter(
    (s) => (s.weapon?.name ?? "").toLowerCase() === weaponName.toLowerCase(),
  );

  // keep ONE entry per base skin
  const unique = Array.from(
    new Map(filtered.map((s) => [getBaseKey(s), s])).values(),
  );

  // pagination over the deduped list
  const total = unique.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const start = (safePage - 1) * PER_PAGE;
  const pageItems = unique.slice(start, start + PER_PAGE);

  return (
    <main className="min-h-screen  text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">{weaponName} Skins</h1>

        <p className="mt-2 text-zinc-400">
          Showing {Math.min(start + PER_PAGE, total)} of {total}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageItems.map((skin) => (
            <SkinCard
              key={getBaseKey(skin)}
              weapon={skin.weapon?.name ?? "Unknown"}
              name={normalizeBaseName(skin.name)}
              rarityLabel={skin.rarity?.name ?? "Unknown"}
              rarityColor={skin.rarity?.color ?? "#888888"}
              hasStatTrak={skin.stattrak ?? false}
              imageUrl={skin.image}
              sourceLabel={skin.collection?.name}
              sourceImageUrl={skin.collection?.image}
            />
          ))}
        </div>

        {/* ✅ pagination bar at bottom, centered */}
        <div className="mt-10 flex justify-center">
          <Pagination currentPage={safePage} totalPages={totalPages} />
        </div>
      </div>
    </main>
  );
}
