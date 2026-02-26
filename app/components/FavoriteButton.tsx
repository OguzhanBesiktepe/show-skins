"use client";

import { useEffect, useState } from "react";

type Props = {
  skinId: string;
  skinName: string;
  skinImage: string;
  skinPath: string;
};

export default function FavoriteButton({
  skinId,
  skinName,
  skinImage,
  skinPath,
}: Props) {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch session + current favorite status
  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) return;
        const me = await meRes.json();
        if (!me.steamId) return;
        setSteamId(me.steamId);

        const favRes = await fetch("/api/favorites");
        if (!favRes.ok) return;
        const favs: { skinId: string }[] = await favRes.json();
        setFavorited(favs.some((f) => f.skinId === skinId));
      } catch {
        // silently fail — user just won't see the button
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [skinId]);

  async function toggle() {
    if (!steamId) return;
    const next = !favorited;
    setFavorited(next); // optimistic

    if (next) {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId, skinName, skinImage, skinPath }),
      });
    } else {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinId }),
      });
    }
  }

  // Don't render at all if user isn't logged in
  if (!loading && !steamId) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-lg border transition-colors ${
        favorited
          ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/40"
          : "bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 border-zinc-600"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {favorited ? "Favorited" : "Add to Favorites"}
    </button>
  );
}
