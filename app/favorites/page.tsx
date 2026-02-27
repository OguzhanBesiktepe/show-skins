import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/app/lib/session";
import { redis } from "@/app/lib/redis";

type Favorite = {
  skinId: string;
  skinName: string;
  skinImage: string;
  skinPath: string;
  addedAt: string;
};

export default async function FavoritesPage() {
  const session = await getSession();

  if (!session.steamId) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-zinc-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h1 className="text-2xl font-bold">Your Favorites</h1>
        <p className="text-zinc-400">
          Please{" "}
          <a href="/api/auth/steam" className="text-amber-400 hover:underline">
            login with Steam
          </a>{" "}
          to view your favorites.
        </p>
      </main>
    );
  }

  const data = await redis.hgetall<Record<string, string>>(
    `fav:${session.steamId}`,
  );
  const favorites: Favorite[] = data
    ? Object.values(data)
        .map((v) => (typeof v === "string" ? JSON.parse(v) : v) as Favorite)
        .sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        )
    : [];

  return (
    <main className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="text-amber-400 text-3xl">★</span>
          <h1 className="text-3xl font-bold">Your Favorites</h1>
          <span className="ml-2 text-sm text-zinc-400">
            {favorites.length} skin{favorites.length !== 1 ? "s" : ""}
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-lg">No favorites yet.</p>
            <p className="text-sm">
              Browse skins and click{" "}
              <span className="text-amber-400">Add to Favorites</span> on any
              skin page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((fav) => (
              <Link
                key={fav.skinId}
                href={fav.skinPath}
                className="rounded-xl border border-zinc-800 bg-[#1f2937] overflow-hidden hover:border-zinc-600 hover:scale-[1.02] transition-all"
              >
                <div className="flex flex-col items-center p-4 gap-3">
                  <div className="flex items-center justify-center h-[130px]">
                    <Image
                      src={fav.skinImage}
                      alt={fav.skinName}
                      width={160}
                      height={120}
                      className="object-contain max-h-[130px]"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm text-center text-zinc-200 font-medium leading-tight line-clamp-2">
                    {fav.skinName}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
