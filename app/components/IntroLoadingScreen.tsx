"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 72;
const FPS = 36; // 72 frames / 36 fps = ~2.0 seconds animation
const FRAME_DURATION = 1000 / FPS;

export default function IntroLoadingScreen() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const [hasDrawnFirstFrame, setHasDrawnFirstFrame] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const finishedRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 400);
  }, []);

  useEffect(() => {
    // 1. Safety cutoff timer at 3.5s
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 3500);

    // 2. Skip button appears after 0.8s
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 800);

    // 3. Keyboard shortcuts to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(safetyTimer);
      clearTimeout(skipTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleFinish]);

  // Progressive frame sequence animation loop
  useEffect(() => {
    if (!isVisible) return;

    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    // Set canvas dimensions to match viewport
    const updateSize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Draw single frame with object-fit: cover, scaled to 130% on desktop without DOM overflow
    const drawCoverFrame = (img: HTMLImageElement) => {
      if (!canvas || !ctx || !img.complete || img.naturalWidth === 0) return;
      const cW = canvas.width;
      const cH = canvas.height;
      const iW = img.naturalWidth;
      const iH = img.naturalHeight;

      // 130% scale on desktop (>= 768px), 100% on mobile
      const isDesktop = window.innerWidth >= 768;
      const zoom = isDesktop ? 1.30 : 1.0;

      const scale = Math.max(cW / iW, cH / iH) * zoom;
      const drawW = iW * scale;
      const drawH = iH * scale;
      const x = (cW - drawW) / 2;
      const y = (cH - drawH) / 2;

      ctx.clearRect(0, 0, cW, cH);
      ctx.drawImage(img, x, y, drawW, drawH);
    };

    // Preload frame helper
    const loadFrame = (idx: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (framesRef.current[idx]) {
          resolve(framesRef.current[idx]!);
          return;
        }
        const img = new Image();
        const padded = String(idx + 1).padStart(4, "0");
        // Prefer WebP for speed (9.4MB total), fallback to PNG
        img.src = `/frame-loading-webp/frame-${padded}.webp`;
        img.onerror = () => {
          img.src = `/frame-loading/frame-${padded}.png`;
        };
        img.onload = () => {
          framesRef.current[idx] = img;
          resolve(img);
        };
      });
    };

    let startTime = 0;
    let currentFrameIdx = 0;

    // Load Frame 1 immediately
    loadFrame(0).then((firstImg) => {
      if (!isMounted) return;
      drawCoverFrame(firstImg);
      setHasDrawnFirstFrame(true);

      // Start preloading upcoming frames
      for (let i = 1; i < Math.min(20, TOTAL_FRAMES); i++) {
        loadFrame(i);
      }

      startTime = performance.now();

      const renderLoop = (now: number) => {
        if (!isMounted || finishedRef.current) return;

        const elapsed = now - startTime;
        const targetFrame = Math.floor(elapsed / FRAME_DURATION);

        if (targetFrame >= TOTAL_FRAMES) {
          // Animation finished: shutter is fully opened!
          handleFinish();
          return;
        }

        if (targetFrame !== currentFrameIdx) {
          currentFrameIdx = targetFrame;

          // Proactively preload frames ahead in the pipeline
          for (let ahead = 1; ahead <= 6; ahead++) {
            const nextIdx = currentFrameIdx + ahead;
            if (nextIdx < TOTAL_FRAMES && !framesRef.current[nextIdx]) {
              loadFrame(nextIdx);
            }
          }

          const img = framesRef.current[currentFrameIdx];
          if (img && img.complete) {
            drawCoverFrame(img);
          } else {
            // Find latest available loaded frame
            for (let f = currentFrameIdx; f >= 0; f--) {
              const fallback = framesRef.current[f];
              if (fallback && fallback.complete) {
                drawCoverFrame(fallback);
                break;
              }
            }
          }
        }

        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      };

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    });

    return () => {
      isMounted = false;
      window.removeEventListener("resize", updateSize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isVisible, handleFinish]);

  if (!isVisible) return null;

  return (
    <div
      id="intro-loader"
      onClick={handleFinish}
      title="Click anywhere to skip intro"
      className={`fixed inset-0 w-full h-[100dvh] max-w-[100vw] z-[100] overflow-hidden select-none cursor-pointer transition-opacity duration-400 ease-out ${
        !hasDrawnFirstFrame ? "bg-[#0a0a0a]" : "bg-transparent"
      } ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Skip button in top right */}
      {showSkip && !isFadingOut && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 text-white/60 hover:text-white text-[10px] font-mono tracking-widest uppercase transition-all backdrop-blur-md cursor-pointer animate-fadeIn shadow-2xl"
        >
          <span>Skip</span>
          <span className="ml-1 text-white/30 text-[9px] hidden sm:inline">[Esc]</span>
          <span className="ml-1 text-[#c8a84e]">→</span>
        </button>
      )}

      {/* 100% Fullscreen Transparent Aperture Shutter Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
    </div>
  );
}
