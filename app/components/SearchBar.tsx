"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Skin = {
  id: string;
  name: string;
  image: string;
  weapon?: { name?: string };
};

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
  const map: Record<string, string> = {
    "CZ75-Auto": "pistols",
    "Desert Eagle": "pistols",
    "Dual Berettas": "pistols",
    "Five-SeveN": "pistols",
    "Glock-18": "pistols",
    P2000: "pistols",
    P250: "pistols",
    "R8 Revolver": "pistols",
    "Tec-9": "pistols",
    "USP-S": "pistols",
    "Zeus x27": "pistols",
    "MAC-10": "smgs",
    "MP5-SD": "smgs",
    MP7: "smgs",
    MP9: "smgs",
    P90: "smgs",
    "PP-Bizon": "smgs",
    "UMP-45": "smgs",
    M249: "lmgs",
    Negev: "lmgs",
    "MAG-7": "shotguns",
    Nova: "shotguns",
    "Sawed-Off": "shotguns",
    XM1014: "shotguns",
    "AK-47": "rifles",
    AUG: "rifles",
    AWP: "rifles",
    FAMAS: "rifles",
    G3SG1: "rifles",
    "Galil AR": "rifles",
    "M4A1-S": "rifles",
    M4A4: "rifles",
    "SCAR-20": "rifles",
    "SG 553": "rifles",
    "SSG 08": "rifles",
  };
  const name = weaponName.toLowerCase();
  if (
    name.includes("knife") ||
    name.includes("karambit") ||
    name.includes("bayonet") ||
    name.includes("dagger")
  )
    return "knives";
  if (name.includes("gloves") || name.includes("wraps")) return "gloves";
  return map[weaponName] ?? "pistols";
}

function cleanSkinName(name: string) {
  return name
    .replace(/^★\s*/, "")
    .replace(/^StatTrak™\s*/, "")
    .replace(/^Souvenir\s+/i, "")
    .replace(/^★\s*StatTrak™\s*/, "")
    .replace(
      /\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i,
      "",
    )
    .trim();
}

export default function SearchBar({ skins }: { skins: Skin[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Skin[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const lower = query.toLowerCase();
    const seen = new Set<string>();
    const filtered = skins
      .filter((s) => {
        const clean = cleanSkinName(s.name).toLowerCase();
        const key = `${s.weapon?.name}|${clean}`;
        if (seen.has(key)) return false;
        if (
          clean.includes(lower) ||
          s.weapon?.name?.toLowerCase().includes(lower)
        ) {
          seen.add(key);
          return true;
        }
        return false;
      })
      .slice(0, 8);

    setResults(filtered);
    setOpen(filtered.length > 0);
  }, [query, skins]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(skin: Skin) {
    const weaponSlug = slugifyWeaponName(skin.weapon?.name ?? "");
    const category = getCategoryFromWeapon(skin.weapon?.name ?? "");
    const cleaned = cleanSkinName(skin.name);
    const skinSlug = slugifySkinName(cleaned);
    router.push(`/browse/${category}/${weaponSlug}/${skinSlug}`);
    setQuery("");
    setOpen(false);
  }
  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center gap-2 rounded-md bg-zinc-800/60 border border-zinc-700 px-4 py-4">
        <span className="text-zinc-400 text-lg">⌕</span>
        <input
          className="w-full bg-transparent outline-none text-base text-zinc-100 placeholder:text-zinc-400"
          placeholder="Search..."
          aria-label="Search skins"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-zinc-400 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-50 overflow-hidden">
          {results.map((skin) => (
            <button
              key={skin.id}
              onClick={() => handleSelect(skin)}
              className="flex items-center gap-3 w-full px-4 py-2 hover:bg-zinc-800/60 text-left"
            >
              <Image
                src={skin.image}
                alt=""
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <p className="text-sm text-zinc-100">
                  {cleanSkinName(skin.name)}
                </p>
                <p className="text-xs text-zinc-400">{skin.weapon?.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
