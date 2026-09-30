"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { playShutterSound } from "../utils/shutterSound";

export type ColorEdition = "onyx" | "blue" | "green";

export interface EditionInfo {
  id: ColorEdition;
  num: string;
  name: string;
  shortName: string;
  trim: string;
  shortTrim: string;
  material: string;
  shortMaterial: string;
  folder: string;
  swatchHex: string;
  accentHex: string;
  glowRgba: string;
  leatherGradient: string;
  serial: string;
  subtitle: string;
  previewImage: string;
}

export const EDITIONS: Record<ColorEdition, EditionInfo> = {
  onyx: {
    id: "onyx",
    num: "01",
    name: "Onyx Black",
    shortName: "Onyx",
    trim: "24K Gold",
    shortTrim: "Gold",
    material: "Obsidian Leather",
    shortMaterial: "Obsidian",
    folder: "/images-frames",
    swatchHex: "#1a1a1a",
    accentHex: "#c8a84e",
    glowRgba: "rgba(200, 168, 78, 0.45)",
    leatherGradient:
      "radial-gradient(circle at 50% 25%, #252420 0%, #141311 65%, #080807 100%)",
    serial: "ZF-01917",
    subtitle: "Obsidian Leather & 24K Gold",
    previewImage: "/images-frames/frame-0001.png",
  },
  blue: {
    id: "blue",
    num: "02",
    name: "Indigo Reserve",
    shortName: "Indigo",
    trim: "Titanium",
    shortTrim: "Titanium",
    material: "Midnight Navy",
    shortMaterial: "Navy",
    folder: "/frame-blue",
    swatchHex: "#12253d",
    accentHex: "#4ea8de",
    glowRgba: "rgba(78, 168, 222, 0.45)",
    leatherGradient:
      "radial-gradient(circle at 50% 25%, #16293d 0%, #0b1724 65%, #040910 100%)",
    serial: "ZF-02401",
    subtitle: "Midnight Navy & Titanium",
    previewImage: "/frame-blue/frame-0001.png",
  },
  green: {
    id: "green",
    num: "03",
    name: "Saddle Moss",
    shortName: "Moss",
    trim: "Antique Brass",
    shortTrim: "Brass",
    material: "Forest Olive",
    shortMaterial: "Olive",
    folder: "/frame-green",
    swatchHex: "#162e1d",
    accentHex: "#52b788",
    glowRgba: "rgba(82, 183, 136, 0.45)",
    leatherGradient:
      "radial-gradient(circle at 50% 25%, #193020 0%, #0e1c13 65%, #050a07 100%)",
    serial: "ZF-03882",
    subtitle: "Forest Olive & Antique Brass",
    previewImage: "/frame-green/frame-0001.png",
  },
};

interface ThreeUIBookCardProps {
  edition: EditionInfo;
  isActive: boolean;
  fanRotation: number;
  onSelect: (id: ColorEdition) => void;
}

function ThreeUIBookCard({
  edition,
  isActive,
  fanRotation,
  onSelect,
}: ThreeUIBookCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Direct DOM transform for 60fps butter without React re-renders swallowing clicks
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      const rotBase = isActive ? 0 : fanRotation;
      card.style.transform = `
        translateY(-8px)
        rotate(${rotBase}deg)
        rotateX(${-ny * 12}deg)
        rotateY(${nx * 14}deg)
      `;
    },
    [isActive, fanRotation]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    const rotBase = isActive ? 0 : fanRotation;
    card.style.transform = `
      translateY(0px)
      rotate(${rotBase}deg)
      rotateX(0deg)
      rotateY(0deg)
    `;
  }, [isActive, fanRotation]);

  const handleClick = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.stopPropagation();
      }
      try {
        playShutterSound();
      } catch {
        // Audio fallback
      }
      onSelect(edition.id);
    },
    [edition.id, onSelect]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none transition-all duration-300 ease-[cubic-bezier(.2,.78,.2,1)] ${
        isActive
          ? "z-30 scale-[1.04] sm:scale-[1.06]"
          : "z-20 hover:z-40 opacity-80 hover:opacity-100 hover:scale-[1.03]"
      }`}
      style={{
        transform: `
          translateY(0px)
          rotate(${isActive ? 0 : fanRotation}deg)
          rotateX(0deg)
          rotateY(0deg)
        `,
        willChange: "transform, opacity",
      }}
    >
      {/* 3D Physical Deep Shadow */}
      <div
        className="absolute inset-[6%_-3%_-2%_3%] rounded-[10px] pointer-events-none transition-opacity duration-300"
        style={{
          background: "rgba(0, 0, 0, 0.75)",
          filter: "blur(14px)",
          opacity: isActive ? 0.9 : 0.45,
          transform: "translate3d(6px, 12px, -20px)",
        }}
      />

      {/* Book Back Cover & Page Edge (ThreeUI Physical Book Styling) */}
      <div
        className="absolute inset-0 rounded-[3px_6px_6px_3px] pointer-events-none"
        style={{
          background: edition.leatherGradient,
          transform: "translate3d(4px, 1px, -12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      />

      {/* Parchment 3D Paper Layer on Right Edge */}
      <div
        className="absolute top-[2%] right-[-4px] bottom-[2%] w-[5px] rounded-[0_3px_3px_0] pointer-events-none border-l border-black/40"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              #bfa980 0,
              #bfa980 1px,
              #e8dbc0 1px,
              #e8dbc0 2.5px
            )
          `,
          boxShadow: "2px 1px 4px rgba(0, 0, 0, 0.4)",
        }}
      />

      {/* Front Book Cover: Physical Leather & Stitched Gold Foil */}
      <div
        className="relative w-[100px] sm:w-[116px] md:w-[128px] h-[168px] sm:h-[192px] md:h-[210px] rounded-[3px_6px_6px_3px] overflow-hidden border p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-300 backdrop-blur-md pointer-events-none"
        style={{
          background: edition.leatherGradient,
          borderColor: isActive ? edition.accentHex : "rgba(255, 255, 255, 0.12)",
          boxShadow: isActive
            ? `0 14px 28px rgba(0,0,0,0.6), 0 0 20px ${edition.glowRgba}, inset -6px 0 12px rgba(0,0,0,0.4)`
            : "0 8px 18px rgba(0,0,0,0.5), inset -4px 0 8px rgba(0,0,0,0.3)",
          fontFamily:
            '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
        }}
      >
        {/* Left Spine Crease Shadow */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[5%] pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.06) 40%, transparent 100%)",
          }}
        />

        {/* Embossed Double Gold Stitching Border */}
        <div
          className="absolute inset-[3px] rounded-[2px] border pointer-events-none transition-colors duration-300"
          style={{
            borderColor: isActive ? edition.accentHex : "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            className="absolute inset-[2px] rounded-[1px] border border-dashed pointer-events-none"
            style={{
              borderColor: isActive ? `${edition.accentHex}88` : "rgba(255, 255, 255, 0.05)",
            }}
          />
        </div>

        {/* TOP: Header Row */}
        <div className="relative z-10 flex items-center justify-between text-[7px] sm:text-[7.5px] font-mono tracking-wider uppercase text-white/60 pt-0.5">
          <span>MANUAL</span>
          <span
            className="flex items-center gap-1 font-semibold shrink-0"
            style={{ color: edition.accentHex }}
          >
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            <span>VOL.{edition.num}</span>
          </span>
        </div>

        {/* CAMERA PREVIEW IMAGE */}
        <div className="relative z-10 mx-auto w-[68px] sm:w-[80px] md:w-[90px] h-[42px] sm:h-[50px] md:h-[56px] rounded-[3px] overflow-hidden my-1 pointer-events-none">
          <Image
            src={edition.previewImage}
            alt={`${edition.name} Edition`}
            fill
            sizes="90px"
            className="object-cover object-center"
            style={{
              filter: isActive ? "brightness(1.1)" : "brightness(0.7)",
              transition: "filter 0.3s ease",
            }}
          />
          {/* Subtle vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, transparent 40%, ${edition.swatchHex}cc 100%)`,
            }}
          />
        </div>

        {/* CENTER: Wax Seal + Title */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* ThreeUI Serrated "ACTIVE" Wax Seal Stamp */}
          {isActive && (
            <div
              className="mb-0.5 px-2 py-0.5 text-center pointer-events-none animate-fadeIn"
              style={{
                background: "#efe3ca",
                color: "#211c14",
                clipPath: `polygon(
                  3% 22%, 10% 8%, 25% 7%, 38% 1%, 51% 6%, 66% 2%,
                  77% 10%, 92% 11%, 96% 26%, 100% 39%, 95% 52%, 99% 67%,
                  88% 79%, 83% 93%, 68% 94%, 55% 100%, 42% 94%, 27% 98%,
                  17% 88%, 4% 84%, 5% 69%, 0 57%, 5% 43%, 1% 34%
                )`,
              }}
            >
              <span className="text-[7px] sm:text-[8px] font-mono font-bold tracking-widest uppercase block leading-tight">
                ACTIVE
              </span>
            </div>
          )}

          {/* Book Title */}
          <h4
            className="text-white font-serif font-semibold text-[11px] sm:text-[13px] md:text-[14px] tracking-tight leading-tight whitespace-nowrap"
            style={{
              textShadow: isActive ? `0 2px 8px ${edition.accentHex}50` : "none",
            }}
          >
            {edition.name}
          </h4>

          {/* Subtitle / Trim */}
          <p
            className="text-[7.5px] sm:text-[8.5px] font-serif italic tracking-tight line-clamp-1 mt-0.5"
            style={{ color: edition.accentHex }}
          >
            {edition.subtitle}
          </p>
        </div>

        {/* BOTTOM: Registry & Serial */}
        <div className="relative z-10 flex items-center justify-between text-[6.5px] sm:text-[7.5px] font-mono tracking-widest uppercase text-white/40 border-t border-white/10 pt-1 pb-0.5">
          <span>TOKYO · 1917</span>
          <span>{edition.serial}</span>
        </div>
      </div>

      {/* 100% Unobstructed Top-Level Button - Placed AFTER all visuals with Z-50 */}
      <button
        type="button"
        aria-label={`Select ${edition.name} Edition`}
        onClick={handleClick}
        onPointerDown={(e) => {
          if (e.button === 0) {
            handleClick(e);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e);
          }
        }}
        className="absolute inset-0 w-full h-full z-50 cursor-pointer rounded-[3px_6px_6px_3px] opacity-0 focus:outline-none"
      />
    </div>
  );
}

export interface HalcyonColorSelectorProps {
  activeEdition: ColorEdition;
  onSelectEdition: (edition: ColorEdition) => void;
}

export default function HalcyonColorSelector({
  activeEdition,
  onSelectEdition,
}: HalcyonColorSelectorProps) {
  const keys: ColorEdition[] = ["onyx", "blue", "green"];

  // Angles for the 3D fanned deck
  const getFanRotation = (key: ColorEdition): number => {
    if (key === "onyx") return -5;
    if (key === "blue") return 0;
    return 5;
  };

  return (
    <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 w-full sm:w-auto relative z-40">
      {/* Header Eyebrow with active edition indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 backdrop-blur-md">
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: EDITIONS[activeEdition].accentHex }}
        />
        <span className="text-white/60 text-[8px] sm:text-[9.5px] font-mono tracking-[0.25em] uppercase font-semibold">
          Field Manuals · 3 Editions
        </span>
      </div>

      {/* ThreeUI 3D Fanned Pocket Books Deck */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-3 py-1 px-1 relative z-40"
      >
        {keys.map((key) => (
          <ThreeUIBookCard
            key={key}
            edition={EDITIONS[key]}
            isActive={activeEdition === key}
            fanRotation={getFanRotation(key)}
            onSelect={onSelectEdition}
          />
        ))}
      </div>
    </div>
  );
}
