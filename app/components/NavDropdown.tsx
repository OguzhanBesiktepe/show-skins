import Link from "next/link";
import Image from "next/image";

type DropdownItem = {
  label: string; // "Desert Eagle"
  slug: string; // "desert-eagle"
  iconUrl?: string; // "/weapons/deagle.png" (later from API)
};

export default function NavDropdown({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: DropdownItem[];
}) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className="flex items-center gap-1 text-base font-semibold tracking-wide text-zinc-200 hover:text-amber-400 transition-colors"
      >
        {title} <span className="text-zinc-400">▾</span>
      </Link>

      <div className="hidden group-hover:block absolute left-0 top-full pt-3 z-50">
        <div className="w-64 rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg overflow-hidden">
          <div className="max-h-[420px] overflow-auto py-2">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`${href}/${item.slug}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/60 text-zinc-200"
              >
                <div className="h-7 w-7 flex items-center justify-center">
                  {item.iconUrl ? (
                    <Image
                      src={item.iconUrl}
                      alt=""
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded bg-zinc-800" />
                  )}
                </div>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
