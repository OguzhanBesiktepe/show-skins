//Homepage

import SkinCard from "./components/SkinCard";

const mockSkins = [
  {
    name: "AK-47 | Redline",
    weapon: "AK-47",
    rarity: "Classified",
    imageUrl:
      "https://community.cloudflare.steamstatic.com/economy/image/class/730/2fxQf5dVYwQ0R4n2iJtJxw/300fx300f",
    price: "$12.34",
  },
  {
    name: "M4A1-S | Printstream",
    weapon: "M4A1-S",
    rarity: "Covert",
    imageUrl:
      "https://community.cloudflare.steamstatic.com/economy/image/class/730/2fxQf5dVYwQ0R4n2iJtJxw/300fx300f",
    price: "$98.12",
  },
  {
    name: "AWP | Asiimov",
    weapon: "AWP",
    rarity: "Covert",
    imageUrl:
      "https://community.cloudflare.steamstatic.com/economy/image/class/730/2fxQf5dVYwQ0R4n2iJtJxw/300fx300f",
    price: "$75.00",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="mt-2 text-zinc-400">
          Browse CS2 skins and track pricing trends.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockSkins.map((s) => (
            <SkinCard key={s.name} {...s} />
          ))}
        </div>
      </div>
    </main>
  );
}
