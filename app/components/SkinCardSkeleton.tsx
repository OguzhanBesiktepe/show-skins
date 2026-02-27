export default function SkinCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#1f2937] overflow-hidden shadow-sm animate-pulse">
      <div className="relative px-5 pt-4 pb-6">
        {/* Weapon name */}
        <div className="flex justify-center mb-2">
          <div className="h-3.5 w-20 rounded bg-zinc-700" />
        </div>
        {/* Skin name */}
        <div className="flex justify-center mb-1">
          <div className="h-5 w-32 rounded bg-zinc-600" />
        </div>

        {/* Rarity badge */}
        <div className="absolute top-[78px] left-5 h-5 w-24 rounded-full bg-zinc-700" />

        {/* Image area */}
        <div className="mt-20 flex items-center justify-center h-[190px]">
          <div className="h-[170px] w-full rounded-lg bg-zinc-700/50" />
        </div>

        {/* Price */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div className="h-3 w-16 rounded bg-zinc-700" />
          <div className="h-4 w-20 rounded bg-zinc-600" />
        </div>

        {/* Source label */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-5 w-5 rounded bg-zinc-700" />
          <div className="h-3.5 w-24 rounded bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}
