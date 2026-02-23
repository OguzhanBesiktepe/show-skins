"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "./Badge";

type SkinCardProps = {
  weapon: string;
  name: string;
  rarityLabel: string;
  rarityColor: string;
  hasStatTrak: boolean;
  statTrakColor?: string;
  imageUrl?: string;
  priceRange?: string;
  statTrakPriceRange?: string;
  sourceLabel?: string;
  sourceImageUrl?: string;
  href?: string;
};

export default function SkinCard({
  weapon,
  name,
  rarityLabel,
  rarityColor,
  hasStatTrak,
  statTrakColor = "#f89406",
  imageUrl,
  priceRange,
  statTrakPriceRange,
  sourceLabel,
  sourceImageUrl,
  href,
}: SkinCardProps) {
  const [imgOk, setImgOk] = useState(true);

  const card = (
    <div className="rounded-xl border border-zinc-800 bg-[#1f2937] overflow-hidden shadow-sm hover:border-zinc-600 hover:scale-[1.02] transition-all cursor-pointer">
      <div className="relative px-5 pt-4 pb-6">
        <div className="text-center text-sm text-zinc-300">{weapon}</div>
        <div className="text-center text-lg font-semibold text-white leading-tight">
          {name}
        </div>

        <Badge text={rarityLabel} bgColor={rarityColor} topClass="top-[78px]" />

        {hasStatTrak && (
          <Badge
            text="StatTrak Available"
            bgColor={statTrakColor}
            topClass="top-[110px]"
          />
        )}

        <div className="mt-20 flex items-center justify-center h-[190px]">
          {imageUrl && imgOk ? (
            <img
              src={imageUrl}
              alt=""
              className="max-h-[190px] object-contain"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="h-[170px] w-full rounded-lg border border-zinc-800" />
          )}
        </div>

        <div className="mt-4 text-center">
          {priceRange && (
            <div className="text-white font-semibold">{priceRange}</div>
          )}
          {statTrakPriceRange && (
            <div className="text-[#f89406] font-semibold">
              {statTrakPriceRange}
            </div>
          )}
        </div>

        {sourceLabel && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-zinc-200">
            {sourceImageUrl ? (
              <img
                src={sourceImageUrl}
                alt=""
                className="h-5 w-5 object-contain"
              />
            ) : (
              <div className="h-5 w-5 rounded bg-zinc-800" />
            )}
            <span className="font-medium">{sourceLabel}</span>
          </div>
        )}
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}
