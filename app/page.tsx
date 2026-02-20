import SkinCard from "./components/SkinCard";

async function getSkins() {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" },
  );

  return res.json();
}

export default async function Home() {
  const skins = await getSkins();

  //Select random 8 skins from API List without duplicates

  function pickRandom<T>(arr: T[], n: number) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  // Remove Redundant "Statrak™" prefix from skin name if it exists

  function cleanSkinName(name: string) {
    return name.replace(/^StatTrak™\s*/, "");
  }

  const firstSkins = pickRandom(skins, 8);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">ShowSkins</h1>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {firstSkins.map((skin: any) => (
            <SkinCard
              key={skin.id}
              weapon={skin.weapon?.name ?? "Unknown"}
              name={cleanSkinName(skin.name)}
              rarityLabel={skin.rarity?.name ?? "Unknown"}
              rarityColor={skin.rarity?.color ?? "#888888"}
              hasStatTrak={skin.stattrak ?? false}
              imageUrl={skin.image}
              sourceLabel={skin.collection?.name}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
