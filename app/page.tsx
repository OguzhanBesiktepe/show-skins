//Homepage
import SkinCard from "./components/SkinCard";

async function getSkins() {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
  );

  return res.json();
}

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">ShowSkins</h1>
        <p className="mt-2 text-zinc-400">Card layout prototype.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkinCard
            weapon="MP9"
            name="Starlight Protector"
            rarityLabel="Covert SMG"
            rarityColor="#eb4b4b"
            hasStatTrak={true}
            imageUrl="https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8js_f-jFk4uL3V7d5IeKfB2CY1dF7teVgWiT9wU0htTjWnI2qcHvEZgQlW5VyROAD50W6lYDnN-zi5QyM2YtGzir43zQJsHh8IziyOQ/330x192?allow_animated=1"
            priceRange="$68.80 - $106.43"
            statTrakPriceRange="$62.58 - $94.98"
            sourceLabel="Dreams & Nightmares Case"
            sourceImageUrl="https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frnIV7Kb5OaU-JqfHDzXFle0u4LY8Gy_kkRgisGzcm4v4J3vDOAQmDMdyRvlK7EcmeCU3yw/330x192?allow_animated=1"
          />
        </div>
      </div>
    </main>
  );
}
