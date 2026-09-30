"use client";

import dynamic from "next/dynamic";
import HalcyonColorSelector, {
  ColorEdition,
} from "./HalcyonColorCard";
import { playShutterSound } from "../utils/shutterSound";

const CameraCanvas = dynamic(() => import("./CameraCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 rounded-full border border-white/10 border-t-[#c8a84e] animate-spin" />
    </div>
  ),
});

const KEY_SPECS = [
  { value: "24.5 MP", label: "BSI CMOS" },
  { value: "8.0 Stops", label: "In-Body VR" },
  { value: "EXPEED 7", label: "AI Engine" },
];

interface HeroSectionProps {
  activeEdition: ColorEdition;
  onSelectEdition: (edition: ColorEdition) => void;
  onOpenConfigurator?: () => void;
  isConfiguratorOpen?: boolean;
}

export default function HeroSection({
  activeEdition,
  onSelectEdition,
  onOpenConfigurator,
  isConfiguratorOpen = false,
}: HeroSectionProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShutterTrigger = () => {
    playShutterSound();
  };

  return (
    <section
      className="relative w-full w-[100vw] min-w-full h-[100dvh] min-h-[660px] bg-[#0a0a0a] overflow-hidden"
      id="hero"
    >
      {/* 100% Pure, Uninterrupted 3D Exploded Camera Canvas (Paused when configurator modal is open) */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <CameraCanvas edition={activeEdition} isPaused={isConfiguratorOpen} />
      </div>

      {/* Top subtle vignette for navbar integration */}
      <div
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, transparent 100%)",
        }}
      />

      {/* Bottom edge shadow vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 md:h-56 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Hero Content Overlay */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col justify-end h-full pb-4 sm:pb-6 md:pb-10 pointer-events-none">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-8 pointer-events-auto">
          {/* Main Title, Eyebrow & Description */}
          <div className="max-w-md">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84e] animate-pulse" />
              <span className="text-[#c8a84e] text-[10px] md:text-xs font-mono tracking-[0.25em] uppercase font-semibold">
                Mirrorless · Full Frame
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-[42px] font-medium tracking-tight text-white leading-tight mb-1 sm:mb-2">
              Nikon Zf
            </h1>

            {/* Description */}
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-xs sm:max-w-sm mb-3 sm:mb-4">
              Iconic heritage craftsmanship deconstructed. Move cursor left or right to explode the internal optics in real-time.
            </p>

            {/* Specs & CTAs: Neat wrapping row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollToSection("monochrome")}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#c8a84e] text-black text-[11px] sm:text-xs font-semibold tracking-wide hover:bg-[#e8c97a] transition-colors shadow-[0_0_18px_rgba(200,168,78,0.25)] cursor-pointer"
                >
                  Explore B&amp;W
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] sm:text-xs font-medium tracking-wide border border-white/10 transition-colors backdrop-blur-sm cursor-pointer"
                >
                  Features
                </button>
                {/* Acoustic Shutter Test Button */}
                <button
                  onClick={handleShutterTrigger}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] sm:text-[11px] font-mono border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Click to trigger authentic mechanical shutter sound"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84e]" />
                  <span>Click Sound</span>
                </button>
              </div>

              {/* Quick Specs Chips */}
              <div className="flex items-center gap-1.5">
                {KEY_SPECS.map((spec) => (
                  <div
                    key={spec.label}
                    className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[9px] sm:text-[10px] font-mono text-white/80"
                  >
                    <span className="font-semibold text-white">{spec.value}</span>{" "}
                    <span className="text-white/40 hidden sm:inline">{spec.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Bottom Corner: ThreeUI Halcyon Color Selector & Build CTA */}
          <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0 relative z-40">
            <HalcyonColorSelector
              activeEdition={activeEdition}
              onSelectEdition={onSelectEdition}
            />

            {onOpenConfigurator && (
              <button
                onClick={onOpenConfigurator}
                className="hidden sm:inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-[#c8a84e] hover:text-[#e8c97a] transition-colors cursor-pointer group mt-1"
              >
                <span>Customize &amp; Reserve Build</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
