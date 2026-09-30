"use client";

import { useState, useRef, useCallback } from "react";
import { playShutterSound } from "../utils/shutterSound";

type MonoMode = "color" | "flat" | "deep";

interface ModeDetail {
  id: MonoMode;
  name: string;
  tag: string;
  desc: string;
  filterStyle: string;
  accent: string;
}

const MODES: Record<MonoMode, ModeDetail> = {
  color: {
    id: "color",
    name: "Full Spectrum",
    tag: "Standard Color",
    desc: "True-to-life color fidelity rendered by the 24.5MP BSI sensor and EXPEED 7 AI image engine.",
    filterStyle: "none",
    accent: "#c8a84e",
  },
  flat: {
    id: "flat",
    name: "Flat Monochrome",
    tag: "Soft Grayscale",
    desc: "Gentle gradation with preserved shadow detail and subdued highlights. Perfect for fine art & portraits.",
    filterStyle: "grayscale(100%) contrast(92%) brightness(102%)",
    accent: "#a0a0a0",
  },
  deep: {
    id: "deep",
    name: "Deep Tone Monochrome",
    tag: "High Contrast B&W",
    desc: "Rich, punchy blacks with dramatic separation and film-like clarity inspired by timeless street photography.",
    filterStyle: "grayscale(100%) contrast(145%) brightness(95%)",
    accent: "#ffffff",
  },
};

export default function MonochromeSection() {
  const [activeMode, setActiveMode] = useState<MonoMode>("deep");
  const [sliderPos, setSliderPos] = useState<number>(50); // Split slider percentage (0 to 100)
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleModeChange = (mode: MonoMode) => {
    setActiveMode(mode);
    playShutterSound();
  };

  const handleSliderMove = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  };

  const current = MODES[activeMode];

  return (
    <section id="monochrome" className="relative py-28 md:py-36 px-5 sm:px-8 md:px-12 bg-[#080808] overflow-hidden border-t border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Heading & Mechanical Lever Control */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white/80 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-semibold">
                Dedicated B&amp;W Selector
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
              The soul of black &amp; white,{" "}
              <span className="text-white/40">one flick away.</span>
            </h2>
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed mt-3 max-w-md">
              The Nikon Zf is the first mirrorless camera with a dedicated physical B&amp;W lever. Switch instantly between color and iconic analog monochrome profiles.
            </p>
          </div>

          {/* Dedicated 3-Way Mechanical Lever Switch */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            <span className="text-white/40 text-[9px] font-mono tracking-[0.25em] uppercase">
              Physical Top-Plate Lever
            </span>

            <div className="flex items-center p-1.5 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-xl shadow-2xl">
              {(Object.keys(MODES) as MonoMode[]).map((modeKey) => {
                const item = MODES[modeKey];
                const isActive = activeMode === modeKey;
                return (
                  <button
                    key={modeKey}
                    onClick={() => handleModeChange(modeKey)}
                    className={`relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-transform ${
                        isActive ? "scale-125" : "opacity-40"
                      }`}
                      style={{
                        backgroundColor: modeKey === "color" ? "#c8a84e" : modeKey === "flat" ? "#888" : "#fff",
                      }}
                    />
                    <span>{modeKey === "color" ? "Color" : modeKey === "flat" ? "Flat Mono" : "Deep B&W"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Comparison Stage */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[400px] sm:h-[520px] md:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 select-none shadow-2xl cursor-ew-resize group"
        >
          {/* Base Layer: Filtered Output (Active B&W Mode) */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-out"
            style={{
              backgroundImage: "url('/images-frames/frame-0096.png')",
              backgroundColor: "#111",
              filter: current.filterStyle,
            }}
          >
            {/* Film Grain Texture Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-overlay"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
                backgroundSize: "4px 4px",
              }}
            />
          </div>

          {/* Top Layer: Original Full Color (Clipped by slider position) */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images-frames/frame-0096.png')",
              backgroundColor: "#111",
              clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            }}
          />

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            {/* Handle Grip */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/80 border-2 border-white backdrop-blur-md flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 pointer-events-auto cursor-ew-resize"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </div>
          </div>

          {/* Badges on Stage: Left (Color) vs Right (Current Monochrome) */}
          <div className="absolute top-6 left-6 z-20 pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-white/90 shadow-lg">
              Color Original
            </div>
          </div>

          <div className="absolute top-6 right-6 z-20 pointer-events-none">
            <div className="px-3 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-white shadow-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{current.name}</span>
            </div>
          </div>

          {/* Bottom Stage Overlay: Shot Metadata & Mode Profile Description */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
            <div className="max-w-md bg-black/75 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {current.tag}
                </span>
                <span className="text-white/30 text-xs font-mono">·</span>
                <span className="text-[10px] font-mono text-white/50 uppercase">
                  Tone Curve Profile
                </span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                {current.desc}
              </p>
            </div>

            {/* EXIF Data Strip */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 text-[10px] font-mono text-white/80 self-start sm:self-end">
              <span className="text-[#c8a84e] font-semibold">Zf</span>
              <span className="text-white/30">|</span>
              <span>40mm f/2 SE</span>
              <span className="text-white/30">|</span>
              <span>1/500s · f/2 · ISO 400</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
