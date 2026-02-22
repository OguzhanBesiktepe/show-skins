import Image from "next/image";
import Link from "next/link";
import NavDropdown from "./NavDropdown";

const pistols = [
  { label: "CZ75-Auto", slug: "cz75-auto" },
  { label: "Desert Eagle", slug: "desert-eagle" },
  { label: "Dual Berettas", slug: "dual-berettas" },
  { label: "Five-SeveN", slug: "five-seven" },
  { label: "Glock-18", slug: "glock-18" },
  { label: "P2000", slug: "p2000" },
  { label: "P250", slug: "p250" },
  { label: "R8 Revolver", slug: "r8-revolver" },
  { label: "Tec-9", slug: "tec-9" },
  { label: "USP-S", slug: "usp-s" },
  { label: "Zeus x27", slug: "zeus-x27" },
];

const smgs = [
  { label: "MAC-10", slug: "mac-10" },
  { label: "MP5-SD", slug: "mp5-sd" },
  { label: "MP7", slug: "mp7" },
  { label: "MP9", slug: "mp9" },
  { label: "P90", slug: "p90" },
  { label: "PP-Bizon", slug: "pp-bizon" },
  { label: "UMP-45", slug: "ump-45" },
];

const lmgs = [
  { label: "M249", slug: "m249" },
  { label: "Negev", slug: "negev" },
];

const shotguns = [
  { label: "MAG-7", slug: "mag-7" },
  { label: "Nova", slug: "nova" },
  { label: "Sawed-Off", slug: "sawed-off" },
  { label: "XM1014", slug: "xm1014" },
];

const rifles = [
  { label: "AK-47", slug: "ak-47" },
  { label: "AUG", slug: "aug" },
  { label: "AWP", slug: "awp" },
  { label: "FAMAS", slug: "famas" },
  { label: "G3SG1", slug: "g3sg1" },
  { label: "Galil AR", slug: "galil-ar" },
  { label: "M4A1-S", slug: "m4a1-s" },
  { label: "M4A4", slug: "m4a4" },
  { label: "SCAR-20", slug: "scar-20" },
  { label: "SG 553", slug: "sg-553" },
  { label: "SSG 08", slug: "ssg-08" },
];

const knives = [
  { label: "Bayonet", slug: "bayonet" },
  { label: "Bowie Knife", slug: "bowie-knife" },
  { label: "Butterfly Knife", slug: "butterfly-knife" },
  { label: "Classic Knife", slug: "classic-knife" },
  { label: "Falchion Knife", slug: "falchion-knife" },
  { label: "Flip Knife", slug: "flip-knife" },
  { label: "Gut Knife", slug: "gut-knife" },
  { label: "Huntsman Knife", slug: "huntsman-knife" },
  { label: "Karambit", slug: "karambit" },
  { label: "Kukri Knife", slug: "kukri-knife" },
  { label: "M9 Bayonet", slug: "m9-bayonet" },
  { label: "Navaja Knife", slug: "navaja-knife" },
  { label: "Nomad Knife", slug: "nomad-knife" },
  { label: "Paracord Knife", slug: "paracord-knife" },
  { label: "Shadow Daggers", slug: "shadow-daggers" },
  { label: "Skeleton Knife", slug: "skeleton-knife" },
  { label: "Stiletto Knife", slug: "stiletto-knife" },
  { label: "Survival Knife", slug: "survival-knife" },
  { label: "Talon Knife", slug: "talon-knife" },
  { label: "Ursus Knife", slug: "ursus-knife" },
];

const gloves = [
  { label: "Bloodhound Gloves", slug: "bloodhound-gloves" },
  { label: "Broken Fang Gloves", slug: "broken-fang-gloves" },
  { label: "Driver Gloves", slug: "driver-gloves" },
  { label: "Hand Wraps", slug: "hand-wraps" },
  { label: "Hydra Gloves", slug: "hydra-gloves" },
  { label: "Moto Gloves", slug: "moto-gloves" },
  { label: "Specialist Gloves", slug: "specialist-gloves" },
  { label: "Sport Gloves", slug: "sport-gloves" },
];

export default function Navbar() {
  return (
    <nav className="bg-[#b47e1a] border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
        {/* Logo */}
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

        {/* Navigation */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
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
