type SkinCardProps = {
  name: string; // "AK-47 | Redline"
  weapon: string; // "AK-47"
  rarity?: string; // "Classified"
  imageUrl: string; // image link
  price?: string; // "$12.34"
};

export default function SkinCard({
  name,
  weapon,
  rarity,
  imageUrl,
  price,
}: SkinCardProps) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition overflow-hidden">
      <div className="p-4">
        <div className="text-xs text-zinc-400">{weapon}</div>
        <div className="mt-1 font-medium text-white line-clamp-1">{name}</div>
        {rarity && <div className="mt-1 text-xs text-zinc-400">{rarity}</div>}
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={name}
            className="h-32 object-contain group-hover:scale-[1.03] transition"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-zinc-300">Median</div>
          <div className="text-sm font-semibold text-white">{price ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
