import SkinCard from "@/app/components/SkinCard";

async function getSkins() {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" },
  );
  return res.json();
}

function slugToWeaponName(slug: string) {
  // quick mapping for special names; you can expand as needed
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

export default async function WeaponPage({
  params,
}: {
  params: { category: string; weapon: string };
}) {
  const skins = await getSkins();
  const weaponName = slugToWeaponName(params.weapon);

  const filtered = skins.filter(
    (s: any) =>
      (s.weapon?.name ?? "").toLowerCase() === weaponName.toLowerCase(),
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">{weaponName} Skins</h1>
        <p className="mt-2 text-zinc-400">
          Showing {Math.min(filtered.length, 48)} of {filtered.length}
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.slice(0, 48).map((skin: any) => (
            <SkinCard
              key={skin.id}
              weapon={skin.weapon?.name ?? "Unknown"}
              name={skin.name}
              rarityLabel={skin.rarity?.name ?? "Unknown"}
              rarityColor={skin.rarity?.color ?? "#888888"}
              hasStatTrak={skin.stattrak ?? false}
              imageUrl={skin.image}
              sourceLabel={skin.collection?.name}
              sourceImageUrl={skin.collection?.image}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
