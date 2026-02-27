"use client";

import { useState, useRef, useCallback } from "react";
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
  //tilt and glare effect on cards.

  const [imgOk, setImgOk] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setTilt({
      x: -(dy / (rect.height / 2)) * 10,
      y: (dx / (rect.width / 2)) * 10,
    });
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  }, []);

  const card = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.03 : 1})`,
        transition: isHovering
          ? "transform 0.08s ease, border-color 0.2s ease, box-shadow 0.2s ease"
          : "transform 0.45s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        willChange: "transform",
        boxShadow: isHovering
          ? "0 16px 40px rgba(0,0,0,0.5)"
          : "0 2px 8px rgba(0,0,0,0.2)",
      }}
      className="rounded-xl border border-zinc-800 bg-[#1f2937] overflow-hidden cursor-pointer relative hover:border-zinc-500"
    >
      {/* Glare overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.07), transparent 65%)`,
          opacity: isHovering ? 1 : 0,
          transition: isHovering ? "opacity 0.1s ease" : "opacity 0.4s ease",
          pointerEvents: "none",
          zIndex: 10,
          borderRadius: "inherit",
        }}
      />

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
          {priceRange ? (
            <div>
              <div className="text-xs text-zinc-400">Median Price</div>
              <div className="text-white font-semibold">{priceRange}</div>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic">
              No pricing via Skinport
            </div>
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
