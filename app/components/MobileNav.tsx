"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function MobileNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 rounded-md hover:bg-zinc-800/60 transition-colors"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-zinc-200 rounded" />
        <span className="block w-5 h-0.5 bg-zinc-200 rounded" />
        <span className="block w-5 h-0.5 bg-zinc-200 rounded" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-900 border-r border-zinc-800 z-50 overflow-y-auto transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <span className="text-white font-semibold text-lg tracking-wide">
            Browse Skins
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white p-1 transition-colors"
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
                  className={`text-zinc-400 text-xs transition-transform duration-200 ${
                    expanded === cat.title ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {expanded === cat.title && (
                <div className="bg-zinc-800/30">
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
      </div>
    </>
  );
}
