import Image from "next/image";
import Link from "next/link";
import NavDropdown from "./NavDropdown";

type Skin = {
  id: string;
  name: string;
  image: string;
  weapon?: { name?: string };
};

async function getSkins(): Promise<Skin[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
    { cache: "no-store" },
  );
  return res.json();
}

function slugifyWeaponName(name: string) {
  return name
    .replace(/^★\s*/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getWeaponIcon(skins: Skin[], weaponName: string): string | undefined {
  return skins.find(
    (s) => s.weapon?.name?.toLowerCase() === weaponName.toLowerCase(),
  )?.image;
}

export default async function Navbar() {
  const skins = await getSkins();

  function buildItems(weapons: string[]) {
    return weapons.map((name) => ({
      label: name,
      slug: slugifyWeaponName(name),
      iconUrl: getWeaponIcon(skins, name),
    }));
  }

  const pistols = buildItems([
    "CZ75-Auto",
    "Desert Eagle",
    "Dual Berettas",
    "Five-SeveN",
    "Glock-18",
    "P2000",
    "P250",
    "R8 Revolver",
    "Tec-9",
    "USP-S",
    "Zeus x27",
  ]);

  const smgs = buildItems([
    "MAC-10",
    "MP5-SD",
    "MP7",
    "MP9",
    "P90",
    "PP-Bizon",
    "UMP-45",
  ]);

  const lmgs = buildItems(["M249", "Negev"]);

  const shotguns = buildItems(["MAG-7", "Nova", "Sawed-Off", "XM1014"]);

  const rifles = buildItems([
    "AK-47",
    "AUG",
    "AWP",
    "FAMAS",
    "G3SG1",
    "Galil AR",
    "M4A1-S",
    "M4A4",
    "SCAR-20",
    "SG 553",
    "SSG 08",
  ]);

  const knives = buildItems([
    "Bayonet",
    "Bowie Knife",
    "Butterfly Knife",
    "Classic Knife",
    "Falchion Knife",
    "Flip Knife",
    "Gut Knife",
    "Huntsman Knife",
    "Karambit",
    "Kukri Knife",
    "M9 Bayonet",
    "Navaja Knife",
    "Nomad Knife",
    "Paracord Knife",
    "Shadow Daggers",
    "Skeleton Knife",
    "Stiletto Knife",
    "Survival Knife",
    "Talon Knife",
    "Ursus Knife",
  ]);

  const gloves = buildItems([
    "Bloodhound Gloves",
    "Broken Fang Gloves",
    "Driver Gloves",
    "Hand Wraps",
    "Hydra Gloves",
    "Moto Gloves",
    "Specialist Gloves",
    "Sport Gloves",
  ]);

  return (
    <nav className="bg-[#b47e1a] border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="ShowSkins"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-8">
          <NavDropdown title="Pistols" href="/browse/pistols" items={pistols} />
          <NavDropdown title="SMGs" href="/browse/smgs" items={smgs} />
          <NavDropdown title="LMGs" href="/browse/lmgs" items={lmgs} />
          <NavDropdown
            title="Shotguns"
            href="/browse/shotguns"
            items={shotguns}
          />
          <NavDropdown title="Rifles" href="/browse/rifles" items={rifles} />
          <NavDropdown title="Knives" href="/browse/knives" items={knives} />
          <NavDropdown title="Gloves" href="/browse/gloves" items={gloves} />
        </div>

        <div className="flex-1" />

        <div className="w-[420px] max-w-[45vw]">
          <div className="flex items-center gap-2 rounded-md bg-zinc-800/60 border border-zinc-700 px-3 py-2">
            <span className="text-zinc-400">⌕</span>
            <input
              className="w-full bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-400"
              placeholder="Search..."
              aria-label="Search skins"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
