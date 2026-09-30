"use client";

import { useState } from "react";
import { ColorEdition, EDITIONS } from "./HalcyonColorCard";
import { playShutterSound } from "../utils/shutterSound";

interface LensOption {
  id: string;
  name: string;
  price: number;
  tag: string;
}

const LENSES: LensOption[] = [
  { id: "body", name: "Body Only", price: 0, tag: "Essential" },
  { id: "40mm", name: "NIKKOR Z 40mm f/2 (SE)", price: 240, tag: "Street Classic" },
  { id: "28mm", name: "NIKKOR Z 28mm f/2.8 (SE)", price: 240, tag: "Heritage Wide" },
  { id: "24-70mm", name: "NIKKOR Z 24-70mm f/4 S", price: 500, tag: "Versatile Zoom" },
];

interface AccessoryOption {
  id: string;
  name: string;
  price: number;
}

const ACCESSORIES: AccessoryOption[] = [
  { id: "halfcase", name: "Leather Half-Case", price: 89 },
  { id: "shutterbutton", name: "Solid Brass Soft Shutter Release", price: 35 },
  { id: "strap", name: "Hand-braided Silk Neckstrap", price: 65 },
];

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEdition: ColorEdition;
  onSelectEdition: (edition: ColorEdition) => void;
}

export default function ConfiguratorModal({
  isOpen,
  onClose,
  activeEdition,
  onSelectEdition,
}: ConfiguratorModalProps) {
  const [selectedLens, setSelectedLens] = useState<string>("40mm");
  const [selectedAccs, setSelectedAccs] = useState<string[]>(["shutterbutton"]);
  const [isOrdered, setIsOrdered] = useState(false);

  if (!isOpen) return null;

  const BASE_PRICE = activeEdition === "onyx" ? 1999 : 2049;
  const lensPrice = LENSES.find((l) => l.id === selectedLens)?.price || 0;
  const accsPrice = selectedAccs.reduce((sum, id) => {
    const acc = ACCESSORIES.find((a) => a.id === id);
    return sum + (acc ? acc.price : 0);
  }, 0);

  const totalPrice = BASE_PRICE + lensPrice + accsPrice;

  const toggleAccessory = (id: string) => {
    playShutterSound();
    setSelectedAccs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOrder = () => {
    playShutterSound();
    setIsOrdered(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#111111] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#c8a84e]/10 border border-[#c8a84e]/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8a84e] animate-pulse" />
              <span className="text-[#c8a84e] text-[9px] font-mono tracking-widest uppercase font-semibold">
                Bespoke Order Atelier
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Build Your Nikon Zf
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {isOrdered ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#c8a84e]/20 border border-[#c8a84e] flex items-center justify-center text-[#c8a84e] text-2xl">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Reservation Confirmed!
              </h3>
              <p className="text-white/60 text-sm max-w-sm">
                Your custom Nikon Zf ({EDITIONS[activeEdition].name}) build has been allocated. Our concierge team will reach out with serial allotment.
              </p>
              <button
                onClick={() => {
                  setIsOrdered(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#c8a84e] text-black text-xs font-mono font-bold tracking-widest uppercase cursor-pointer"
              >
                Back to Showcase
              </button>
            </div>
          ) : (
            <>
              {/* 1. Body Finish */}
              <div>
                <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase block mb-3">
                  Step 1 · Choose Body Finish
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(EDITIONS) as ColorEdition[]).map((key) => {
                    const ed = EDITIONS[key];
                    const isSel = activeEdition === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onSelectEdition(key);
                          playShutterSound();
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? "border-[#c8a84e] bg-white/[0.06] shadow-[0_0_15px_rgba(200,168,78,0.2)]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full border shrink-0"
                            style={{
                              backgroundColor: ed.swatchHex,
                              borderColor: ed.accentHex,
                              boxShadow: isSel ? `0 0 8px ${ed.accentHex}` : undefined,
                            }}
                          />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {ed.name}
                            </span>
                            <span className="text-[9px] font-mono text-white/40 block">
                              {ed.trim}
                            </span>
                          </div>
                        </div>
                        {isSel && <span className="text-[#c8a84e] text-xs">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Lens Kit */}
              <div>
                <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase block mb-3">
                  Step 2 · Lens Pairing
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LENSES.map((lens) => {
                    const isSel = selectedLens === lens.id;
                    return (
                      <button
                        key={lens.id}
                        onClick={() => {
                          setSelectedLens(lens.id);
                          playShutterSound();
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? "border-white bg-white/[0.08]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {lens.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[#c8a84e]">
                            {lens.price === 0 ? "Included in base" : `+$${lens.price}`}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {lens.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bespoke Accessories */}
              <div>
                <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase block mb-3">
                  Step 3 · Handcrafted Accessories
                </label>
                <div className="space-y-2">
                  {ACCESSORIES.map((acc) => {
                    const isSel = selectedAccs.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        onClick={() => toggleAccessory(acc.id)}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? "border-[#c8a84e]/60 bg-[#c8a84e]/10 text-white"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-white/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                              isSel
                                ? "bg-[#c8a84e] text-black border-[#c8a84e] font-bold"
                                : "border-white/20"
                            }`}
                          >
                            {isSel ? "✓" : ""}
                          </div>
                          <span className="text-xs font-medium">{acc.name}</span>
                        </div>
                        <span className="text-xs font-mono text-[#c8a84e]">
                          +${acc.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer / Checkout Action */}
        {!isOrdered && (
          <div className="p-6 sm:p-8 border-t border-white/10 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest block">
                Total Custom Investment
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                ${totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleOrder}
                className="px-8 py-3 rounded-full bg-[#c8a84e] hover:bg-[#e8c97a] text-black text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(200,168,78,0.3)] cursor-pointer"
              >
                Reserve Build →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
