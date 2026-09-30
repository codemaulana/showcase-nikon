"use client";

import { useEffect, useRef, useState } from "react";
import { ColorEdition } from "./HalcyonColorCard";

interface CameraCursorProps {
  activeEdition: ColorEdition;
}

const THEMES: Record<
  ColorEdition,
  {
    accent: string;
    glow: string;
    label: string;
  }
> = {
  onyx: {
    accent: "#c8a84e", // 24K Gold
    glow: "rgba(200, 168, 78, 0.4)",
    label: "AF-S",
  },
  blue: {
    accent: "#4ea8de", // Titanium Cyan / Indigo
    glow: "rgba(78, 168, 222, 0.4)",
    label: "AF-C",
  },
  green: {
    accent: "#52b788", // Antique Moss Emerald
    glow: "rgba(82, 183, 136, 0.4)",
    label: "MF",
  },
};

export default function CameraCursor({ activeEdition }: CameraCursorProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Single unified cursor container (moves 100% in sync, zero displacement)
  const cursorRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[activeEdition] || THEMES.onyx;

  // Check if device supports fine precision pointer (mouse/trackpad)
  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (isFinePointer) {
      setIsEnabled(true);
    }
  }, []);

  // Update cursor position directly on mousemove with 0ms hardware latency
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      if (!isVisible) setIsVisible(true);

      // Check if hovering clickable / interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest(
            'button, a, input, select, textarea, [role="button"], [tabindex="0"], .cursor-pointer'
          )
        );
        setIsHovering(isInteractive);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsClicking(true);
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isEnabled, isVisible]);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        willChange: "transform",
      }}
      aria-hidden="true"
    >
      {/* Centered Reticle Container - Perfectly centered at (0, 0) */}
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {/* 1. Center Precision Focus Dot (Always locked dead-center) */}
        <div
          className={`rounded-full transition-all duration-200 pointer-events-none z-10 ${
            isClicking
              ? "w-2.5 h-2.5 scale-125"
              : isHovering
              ? "w-2 h-2"
              : "w-1.5 h-1.5"
          }`}
          style={{
            backgroundColor: theme.accent,
            boxShadow: `0 0 8px ${theme.accent}, 0 0 16px ${theme.glow}`,
          }}
        />

        {/* 2. Unified Camera Viewfinder Reticle (Moves with the dot in 100% sync) */}
        <div
          className={`absolute flex items-center justify-center rounded-full border transition-all duration-200 ease-out pointer-events-none ${
            isClicking
              ? "w-6 h-6 scale-90 border-white"
              : isHovering
              ? "w-10 h-10 scale-110"
              : "w-7 h-7 scale-100"
          }`}
          style={{
            borderColor: isClicking ? "#ffffff" : theme.accent,
            boxShadow: isHovering
              ? `0 0 14px ${theme.glow}, inset 0 0 6px ${theme.glow}`
              : `0 0 6px ${theme.glow}`,
            borderWidth: isHovering ? "1.5px" : "1px",
            borderStyle: isHovering ? "solid" : "dashed",
          }}
        >
          {/* Viewfinder 4 Cardinal Ticks (12, 3, 6, 9 o'clock) */}
          <div
            className="absolute -top-1 w-[1.5px] h-1 transition-colors duration-200"
            style={{ backgroundColor: theme.accent }}
          />
          <div
            className="absolute -bottom-1 w-[1.5px] h-1 transition-colors duration-200"
            style={{ backgroundColor: theme.accent }}
          />
          <div
            className="absolute -left-1 h-[1.5px] w-1 transition-colors duration-200"
            style={{ backgroundColor: theme.accent }}
          />
          <div
            className="absolute -right-1 h-[1.5px] w-1 transition-colors duration-200"
            style={{ backgroundColor: theme.accent }}
          />

          {/* 4 Corner Autofocus Brackets when Hovering Clickable Elements */}
          {isHovering && (
            <div className="absolute inset-[-5px] pointer-events-none transition-all duration-200">
              {/* Top-Left */}
              <div
                className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2"
                style={{ borderColor: theme.accent }}
              />
              {/* Top-Right */}
              <div
                className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2"
                style={{ borderColor: theme.accent }}
              />
              {/* Bottom-Left */}
              <div
                className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2"
                style={{ borderColor: theme.accent }}
              />
              {/* Bottom-Right */}
              <div
                className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2"
                style={{ borderColor: theme.accent }}
              />
            </div>
          )}

          {/* Shutter Click Ripple Ring */}
          {isClicking && (
            <div
              className="absolute inset-[-4px] rounded-full border border-white/60 animate-ping pointer-events-none"
            />
          )}
        </div>

        {/* 3. Micro Lens Telemetry Badge when Hovering Interactive Elements */}
        {isHovering && !isClicking && (
          <div
            className="absolute top-7 px-1.5 py-0.5 rounded-[2px] bg-black/85 border text-[7px] font-mono tracking-widest uppercase font-bold whitespace-nowrap shadow-xl pointer-events-none select-none transition-all duration-200"
            style={{
              borderColor: `${theme.accent}70`,
              color: theme.accent,
            }}
          >
            {theme.label} · TARGET
          </div>
        )}
      </div>
    </div>
  );
}
