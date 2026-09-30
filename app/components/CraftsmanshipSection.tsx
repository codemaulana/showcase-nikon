"use client";

import { useState } from "react";
import { playShutterSound } from "../utils/shutterSound";

interface DialDetail {
  id: string;
  name: string;
  material: string;
  range: string;
  desc: string;
  engraving: string[];
}

const DIALS: DialDetail[] = [
  {
    id: "shutter",
    name: "Shutter Speed Dial",
    material: "Solid Carved Brass",
    range: "1/8000s – 1s · Bulb · Time",
    desc: "Milled from a solid block of brass with sharp diamond knurling. Each click gives a crisp mechanical response developed to match the legendary Nikon FM2.",
    engraving: ["1/8000", "1/4000", "1/2000", "1/1000", "1/500", "1/250", "B", "T"],
  },
  {
    id: "iso",
    name: "Dedicated ISO Dial",
    material: "Solid Brass with Center Lock",
    range: "ISO 100 – 64,000 (Ext. 204,800)",
    desc: "Direct tactile control without diving into digital menus. Features a spring-loaded push-to-unlock button prevents accidental shifts while shooting on the move.",
    engraving: ["100", "200", "400", "800", "1600", "3200", "6400", "12800", "C"],
  },
  {
    id: "exp",
    name: "Exposure Compensation Dial",
    material: "Machined Alloy with Detents",
    range: "±3 EV in 1/3 Steps · C Mode",
    desc: "Fine-tune exposure intuitively with positive detent clicks. Allows seamless exposure override even when shooting with full manual prime lenses.",
    engraving: ["+3", "+2", "+1", "0", "-1", "-2", "-3", "C"],
  },
];

export default function CraftsmanshipSection() {
  const [selectedDial, setSelectedDial] = useState<string>("shutter");

  const handleDialClick = (id: string) => {
    setSelectedDial(id);
    playShutterSound();
  };

  return (
    <section id="craftsmanship" className="relative py-28 md:py-36 px-5 sm:px-8 md:px-12 bg-[#0a0a0a] overflow-hidden border-t border-white/5">
      {/* Background warm brass glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#c8a84e]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8a84e]/10 border border-[#c8a84e]/20 backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84e] animate-pulse" />
              <span className="text-[#c8a84e] text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase font-semibold">
                Heritage Mechanics
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
              Carved from solid brass,{" "}
              <span className="text-white/40">built to outlive generations.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4">
              Turn off the screen and shoot by touch alone. The dials on the Nikon Zf are individually sculpted from brass, designed to wear gracefully and develop a unique patina over decades of use.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#c8a84e]">
              <span>Click any dial below to test mechanical click feel</span>
              <span>↓</span>
            </div>
          </div>
        </div>

        {/* 3 Dial Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {DIALS.map((dial) => {
            const isSelected = selectedDial === dial.id;
            return (
              <div
                key={dial.id}
                onClick={() => handleDialClick(dial.id)}
                className={`relative group rounded-2xl p-6 sm:p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-white/[0.05] border-[#c8a84e] shadow-[0_15px_35px_-5px_rgba(200,168,78,0.2)] scale-[1.02]"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.035]"
                }`}
              >
                <div>
                  {/* Top Tag & Audio Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#c8a84e] font-semibold">
                      {dial.material}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? "bg-[#c8a84e] text-black border-[#c8a84e]"
                          : "bg-white/5 text-white/40 border-white/10 group-hover:text-white"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.5A2.25 2.25 0 012.25 13.5v-3a2.25 2.25 0 012.25-2.25h2.25z" />
                      </svg>
                    </div>
                  </div>

                  {/* Title & Range */}
                  <h3 className="text-white text-xl font-semibold tracking-tight mb-1">
                    {dial.name}
                  </h3>
                  <p className="text-[#c8a84e]/80 text-xs font-mono mb-4">
                    {dial.range}
                  </p>

                  {/* Description */}
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-6">
                    {dial.desc}
                  </p>
                </div>

                {/* Dial Engravings Visual Bar */}
                <div className="pt-4 border-t border-white/10">
                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">
                    Engraved Markings:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dial.engraving.map((mark) => (
                      <span
                        key={mark}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-colors ${
                          isSelected
                            ? "bg-[#c8a84e]/20 text-[#c8a84e] border border-[#c8a84e]/30"
                            : "bg-white/5 text-white/60 border border-white/10"
                        }`}
                      >
                        {mark}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
