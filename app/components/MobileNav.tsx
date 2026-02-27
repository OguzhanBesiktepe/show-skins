"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";

export type NavItem = {
  label: string;
  slug: string;
  iconUrl?: string;
};

export type NavCategory = {
  title: string;
  href: string;
  items: NavItem[];
};

type Skin = {
  id: string;
  name: string;
  image: string;
  weapon?: { name?: string };
};

export default function MobileNav({
  categories,
  skins,
}: {
  categories: NavCategory[];
  skins: Skin[];
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 rounded-md hover:bg-zinc-800/60 transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-zinc-200 rounded" />
        <span className="block w-5 h-0.5 bg-zinc-200 rounded" />
        <span className="block w-5 h-0.5 bg-zinc-200 rounded" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1a1a1a] border-r border-zinc-800 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/logo.png"
              alt="ShowSkins"
              width={80}
              height={36}
              className="object-contain"
            />
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search inside drawer */}
        <div className="px-3 py-3 border-b border-zinc-800">
          <SearchBar skins={skins} />
        </div>

        {/* Category accordions */}
        <nav className="py-2">
          {categories.map((cat) => (
            <div key={cat.title}>
              <button
                onClick={() =>
                  setExpanded(expanded === cat.title ? null : cat.title)
                }
                className="w-full flex items-center justify-between px-4 py-3 text-zinc-200 hover:bg-zinc-800/60 transition-colors"
              >
                <span className="font-semibold tracking-wide">{cat.title}</span>
                <span
                  className={`text-zinc-400 text-xs transition-transform duration-200 inline-block ${
                    expanded === cat.title ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {expanded === cat.title && (
                <div className="bg-zinc-800/20">
                  {cat.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`${cat.href}/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-6 py-2.5 text-zinc-300 hover:bg-zinc-800/60 transition-colors text-sm"
                    >
                      <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                        {item.iconUrl ? (
                          <Image
                            src={item.iconUrl}
                            alt=""
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded bg-zinc-700" />
                        )}
                      </div>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Login link at bottom */}
        <div className="border-t border-zinc-800 px-4 py-4">
          <a
            href="/api/auth/steam"
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.187.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z" />
            </svg>
            Login with Steam
          </a>
        </div>
      </div>
    </>
  );
}
