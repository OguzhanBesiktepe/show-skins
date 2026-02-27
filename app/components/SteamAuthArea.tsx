"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SteamUser = {
  steamId: string;
  name: string;
  avatar: string;
};

export default function SteamAuthArea() {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.steamId ? data : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.cursor = loading ? "wait" : "";
    return () => { document.body.style.cursor = ""; };
  }, [loading]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.refresh();
  }

  if (loading) {
    return <div className="h-9 w-28 rounded-md bg-zinc-700/40 animate-pulse" />;
  }

  if (!user) {
    return (
      <a
        href="/api/auth/steam"
        className="flex items-center gap-2 bg-[#1b2838] hover:bg-[#2a475e] text-white text-sm font-semibold px-4 py-2 rounded-lg border border-zinc-600 transition-colors whitespace-nowrap"
      >
        <SteamIcon />
        Login with Steam
      </a>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-zinc-800/60 transition-colors"
      >
        <Image
          src={user.avatar}
          alt={user.name}
          width={32}
          height={32}
          className="rounded-full border border-zinc-600"
          unoptimized
        />
        <span className="text-base font-semibold tracking-wide text-zinc-200 max-w-[120px] truncate">
          {user.name}
        </span>
        <span className="text-zinc-400 text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full pt-3 z-50">
          <div className="w-48 rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden py-2">
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/60 text-zinc-200 text-sm"
            >
              <span className="text-amber-400">★</span>
              Favorites
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/60 text-zinc-200 text-sm w-full text-left"
            >
              <span className="text-zinc-400">⎋</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SteamIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.187.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}
