import Image from "next/image";
import Link from "next/link";
import NavDropdown from "./NavDropdown";
import { getWeapons } from "@/app/getWeapons";

const navLink =
  "flex items-center gap-1 text-sm text-zinc-200 hover:text-white transition-colors";

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

export default function Navbar() {
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        {/* ShowSkins Logo */}
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

        {/* Menu Bar Options */}
        <div className="flex items-center gap-6">
          <NavDropdown title="Pistols" href="/browse/pistols" items={pistols} />

          <Link className={navLink} href="/browse/SMGs">
            SMGs <span className="text-zinc-400">▾</span>
          </Link>

          <Link className={navLink} href="/browse/LMGs">
            LMGs <span className="text-zinc-400">▾</span>
          </Link>

          <Link className={navLink} href="/browse/shotguns">
            Shotguns <span className="text-zinc-400">▾</span>
          </Link>

          <Link className={navLink} href="/browse/rifles">
            Rifles <span className="text-zinc-400">▾</span>
          </Link>

          <Link className={navLink} href="/browse/knives">
            Knives <span className="text-zinc-400">▾</span>
          </Link>

          <Link className={navLink} href="/browse/gloves">
            Gloves <span className="text-zinc-400">▾</span>
          </Link>
        </div>

        {/* Spacer pushes search to the right */}
        <div className="flex-1" />

        {/* Search Bar (UI frontend implementation currently) */}
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
