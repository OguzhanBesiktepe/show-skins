"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function buildPageList(current: number, total: number) {
  const pages: (number | "…")[] = [];

  const window = 2;
  const first = 1;
  const last = total;

  const left = Math.max(current - window, 2);
  const right = Math.min(current + window, total - 1);

  pages.push(first);

  if (left > 2) pages.push("…");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("…");

  if (total > 1) pages.push(last);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const makeHref = (page: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (page <= 1) sp.delete("page");
    else sp.set("page", String(page));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href={makeHref(Math.max(1, currentPage - 1))}
        className={`px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition ${
          currentPage === 1 ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        ‹
      </Link>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`dots-${idx}`} className="px-2 text-zinc-500">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            className={`px-3 py-2 rounded-md border transition ${
              p === currentPage
                ? "border-zinc-500 bg-zinc-800 text-white"
                : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        href={makeHref(Math.min(totalPages, currentPage + 1))}
        className={`px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition ${
          currentPage === totalPages ? "opacity-40 pointer-events-none" : ""
        }`}
      >
        ›
      </Link>
    </nav>
  );
}
