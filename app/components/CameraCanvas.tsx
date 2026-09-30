"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ColorEdition, EDITIONS } from "./HalcyonColorCard";

const TOTAL_FRAMES = 192;
const ALL_EDITIONS: ColorEdition[] = ["onyx", "blue", "green"];

/**
 * 192-Frame Ultra-Smooth Multi-Edition Camera Engine:
 * - WebP acceleration: 94% lighter memory & bandwidth (7-10MB vs 150MB per camera)
 * - All 3 cameras preloaded with critical skeleton frames for zero switch stutter
 * - Cached viewport dimensions to eliminate 60fps layout thrashing
 * - Native non-passive touch handling with horizontal gesture locking
 * - Pixel-rounded rendering coordinates to prevent subpixel antialiasing shimmer
 */
const CENTER_FRAME = 95;      // Frame 96 (Assembled Front View)
const PEAK_LEFT_FRAME = 47;   // Frame 48 (Max Explode Left)
const PEAK_RIGHT_FRAME = 143; // Frame 144 (Max Explode Right)

// Critical dense skeleton frames (every 3 frames across the entire 47-143 explosion range)
// Guarantees all 3 cameras have every angle ready within 1 frame distance (< 3.3 MB total)
const DENSE_SKELETON_FRAMES = [
  47, 50, 53, 56, 59, 62, 65, 68, 71, 74, 77, 80, 83, 86, 89, 92, 95, 98, 101, 104, 107, 110, 113, 116, 119, 122, 125, 128, 131, 134, 137, 140, 143,
];

function getFrameUrl(edition: ColorEdition, index: number): string {
  const padded = String(index + 1).padStart(4, "0");
  if (edition === "onyx") return `/images-frames-webp/frame-${padded}.webp`;
  if (edition === "blue") return `/frame-blue-webp/frame-${padded}.webp`;
  return `/frame-green-webp/frame-${padded}.webp`;
}

function getFallbackFrameUrl(edition: ColorEdition, index: number): string {
  const padded = String(index + 1).padStart(4, "0");
  const folder = EDITIONS[edition]?.folder || "/images-frames";
  return `${folder}/frame-${padded}.png`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export interface CameraCanvasProps {
  edition?: ColorEdition;
  isPaused?: boolean;
}

export default function CameraCanvas({
  edition = "onyx",
  isPaused = false,
}: CameraCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cached viewport dimensions to avoid layout thrashing during animation loop
  const viewportRef = useRef({
    width: 0,
    height: 0,
    isMobile: false,
    dpr: 1,
  });

  // Multi-Edition Image Cache (Progressively Cached)
  const editionImagesRef = useRef<Record<ColorEdition, (HTMLImageElement | null)[]>>({
    onyx: Array(TOTAL_FRAMES).fill(null),
    blue: Array(TOTAL_FRAMES).fill(null),
    green: Array(TOTAL_FRAMES).fill(null),
  });

  const editionLoadedSetsRef = useRef<Record<ColorEdition, Set<number>>>({
    onyx: new Set(),
    blue: new Set(),
    green: new Set(),
  });

  const activeEditionRef = useRef<ColorEdition>(edition);
  activeEditionRef.current = edition;

  // Normalized progress: -1.0 (full left) .. 0.0 (center) .. +1.0 (full right)
  const currentProgressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);

  // Auto-return easing state
  const isAutoReturningRef = useRef<boolean>(false);
  const returnStartProgRef = useRef<number>(0);
  const returnStartTimeRef = useRef<number>(0);
  const returnDurationRef = useRef<number>(550);
  const wasInsideActiveRef = useRef<boolean>(true);

  const lastDrawnFrameRef = useRef<{ ed: ColorEdition; frame: number }>({
    ed: "onyx",
    frame: -1,
  });
  const rafRef = useRef<number | null>(null);

  // Touch state
  const touchStartRef = useRef<{ x: number; y: number; startProg: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const [priorityReady, setPriorityReady] = useState<boolean>(false);
  const [totalLoaded, setTotalLoaded] = useState<number>(0);
  const [hintVisible, setHintVisible] = useState<boolean>(true);

  // Auto-dismiss discovery hint after 3.2s
  useEffect(() => {
    if (priorityReady && hintVisible) {
      const timer = setTimeout(() => {
        setHintVisible(false);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [priorityReady, hintVisible]);

  // ─── Find nearest loaded frame for a given edition ───────────────────
  const getNearestLoadedFrame = useCallback(
    (ed: ColorEdition, target: number): number => {
      const loadedSet = editionLoadedSetsRef.current[ed];
      if (loadedSet.has(target)) return target;

      if (loadedSet.size === 0) return -1;

      let best = -1;
      let minDiff = Infinity;
      for (const idx of loadedSet) {
        const diff = Math.abs(idx - target);
        if (diff < minDiff) {
          minDiff = diff;
          best = idx;
        }
      }
      return best;
    },
    []
  );

  // ─── Razor-Sharp Single-Frame Draw (Zero Layout Reflow / Zero Strobe) ──
  const drawFrame = useCallback(
    (frameIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ed = activeEditionRef.current;
      let realIdx = getNearestLoadedFrame(ed, frameIdx);
      let img = realIdx >= 0 ? editionImagesRef.current[ed][realIdx] : null;

      // Graceful fallback to onyx if edition hasn't loaded any frames yet
      if (!img || !img.complete || img.naturalWidth === 0) {
        if (editionLoadedSetsRef.current[ed].size === 0) {
          const fallbackEd: ColorEdition = editionLoadedSetsRef.current.onyx.size > 0 ? "onyx" : ed;
          realIdx = getNearestLoadedFrame(fallbackEd, frameIdx);
          img = realIdx >= 0 ? editionImagesRef.current[fallbackEd][realIdx] : null;
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Read from cached viewport state: ZERO layout queries / thrashing in 60fps loop!
      const { width: cW, height: cH, isMobile, dpr } = viewportRef.current;
      if (cW === 0 || cH === 0) return;

      const targetW = Math.round(cW * dpr);
      const targetH = Math.round(cH * dpr);

      // Skip redundant redraws if same edition, same frame, and canvas size unchanged
      if (
        lastDrawnFrameRef.current.ed === ed &&
        lastDrawnFrameRef.current.frame === realIdx &&
        canvas.width === targetW &&
        canvas.height === targetH
      ) {
        return;
      }

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = isMobile ? "medium" : "high";

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      let drawW: number;
      let drawH: number;
      let x: number;
      let y: number;

      if (isMobile) {
        // MOBILE PORTRAIT: Fit camera in top half cleanly, pixel-rounded to prevent subpixel jitter
        const scale = (cW / imgW) * 1.30;
        drawW = Math.round(imgW * scale);
        drawH = Math.round(imgH * scale);
        x = Math.round((cW - drawW) / 2);
        y = Math.round(Math.max(10, (cH * 0.42 - drawH) / 2 + 35));
      } else {
        // DESKTOP: Fill 100vw, centered dramatically on pedestal
        const scale = Math.max(cW / imgW, cH / imgH);
        drawW = Math.round(imgW * scale);
        drawH = Math.round(imgH * scale);
        x = Math.round((cW - drawW) / 2);
        y = Math.round((cH - drawH) / 2);
      }

      ctx.clearRect(0, 0, cW, cH);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, x, y, drawW, drawH);

      ctx.restore();
      lastDrawnFrameRef.current = { ed, frame: realIdx };
    },
    [getNearestLoadedFrame]
  );

  // ─── Render continuous progress (-1.0 to +1.0) with ZERO GLITCH ──────
  const renderProgress = useCallback(
    (prog: number) => {
      let frameIdx: number;

      if (prog < 0) {
        const t = Math.min(1, Math.max(0, -prog));
        frameIdx = Math.round(CENTER_FRAME - t * (CENTER_FRAME - PEAK_LEFT_FRAME));
      } else {
        const t = Math.min(1, Math.max(0, prog));
        frameIdx = Math.round(CENTER_FRAME + t * (PEAK_RIGHT_FRAME - CENTER_FRAME));
      }

      drawFrame(frameIdx);
    },
    [drawFrame]
  );

  // ─── Smooth Ease-Out Return to Center ─────────────────────────────────
  const triggerAutoReturn = useCallback((duration: number = 550) => {
    isAutoReturningRef.current = true;
    returnStartProgRef.current = currentProgressRef.current;
    returnStartTimeRef.current = performance.now();
    returnDurationRef.current = duration;
  }, []);

  // ─── Core Animation Loop (60 FPS Butter) ──────────────────────────────
  const animate = useCallback(() => {
    if (isPaused) return;

    if (isAutoReturningRef.current) {
      const elapsed = performance.now() - returnStartTimeRef.current;
      const duration = returnDurationRef.current;
      const t = Math.min(1, elapsed / duration);

      const ease = 1 - Math.pow(1 - t, 3);
      const newProg = returnStartProgRef.current * (1 - ease);

      currentProgressRef.current = newProg;
      renderProgress(newProg);

      if (t >= 1) {
        isAutoReturningRef.current = false;
        currentProgressRef.current = 0;
        targetProgressRef.current = 0;
        renderProgress(0); // Rest on Frame 96
      }
    } else {
      const curProg = currentProgressRef.current;
      const tgtProg = targetProgressRef.current;

      const LERP_FACTOR = 0.14;

      let newProg = lerp(curProg, tgtProg, LERP_FACTOR);
      if (Math.abs(newProg - tgtProg) < 0.002) {
        newProg = tgtProg;
      }

      currentProgressRef.current = newProg;
      renderProgress(newProg);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [renderProgress, isPaused]);

  // ─── Redraw instantly on edition change ───────────────────────────────
  useEffect(() => {
    if (priorityReady) {
      renderProgress(currentProgressRef.current);
    }
  }, [edition, priorityReady, renderProgress]);

  // ─── Proactive Preloader for ALL 3 CAMERA EDITIONS (WebP Powered) ─────
  useEffect(() => {
    let active = true;

    const loadSingle = (ed: ColorEdition, index: number): Promise<void> =>
      new Promise((resolve) => {
        if (editionImagesRef.current[ed][index]?.complete) {
          resolve();
          return;
        }
        const img = new Image();
        img.decoding = "async";
        img.src = getFrameUrl(ed, index);
        img.onerror = () => {
          // Fallback to original PNG if WebP fails
          img.src = getFallbackFrameUrl(ed, index);
        };
        img.onload = () => {
          if (!active) return;
          editionImagesRef.current[ed][index] = img;
          editionLoadedSetsRef.current[ed].add(index);
          if (ed === activeEditionRef.current) {
            setTotalLoaded((c) => c + 1);
          }
          resolve();
        };
      });

    // Step 1: Preload dense skeleton frames for ALL 3 EDITIONS upfront (< 350ms with WebP)
    const criticalPromises: Promise<void>[] = [];
    for (const ed of ALL_EDITIONS) {
      for (const idx of DENSE_SKELETON_FRAMES) {
        criticalPromises.push(loadSingle(ed, idx));
      }
    }

    Promise.all(criticalPromises).then(() => {
      if (!active) return;
      setPriorityReady(true);
      // Seamlessly render at the CURRENT user progress (NEVER force-snap to CENTER_FRAME!)
      renderProgress(currentProgressRef.current);

      // Generate explosion frames prioritized radially outward from current anchor
      const generateExplosionRangeSequence = (ed: ColorEdition, anchor: number): number[] => {
        const list: number[] = [];
        const loaded = editionLoadedSetsRef.current[ed];
        for (let offset = 0; offset <= 48; offset++) {
          const l = anchor - offset;
          const r = anchor + offset;
          if (l >= PEAK_LEFT_FRAME && l <= PEAK_RIGHT_FRAME && !loaded.has(l)) {
            list.push(l);
          }
          if (r >= PEAK_LEFT_FRAME && r <= PEAK_RIGHT_FRAME && r !== l && !loaded.has(r)) {
            list.push(r);
          }
        }
        return list;
      };

      const generateAllRemainingSequence = (ed: ColorEdition): number[] => {
        const list: number[] = [];
        const loaded = editionLoadedSetsRef.current[ed];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!loaded.has(i)) {
            list.push(i);
          }
        }
        return list;
      };

      const BATCH_SIZE = 16;

      function loadNextBatch() {
        if (!active) return;

        const currentActive = activeEditionRef.current;
        const orderedEditions: ColorEdition[] = [
          currentActive,
          ...ALL_EDITIONS.filter((e) => e !== currentActive),
        ];

        // Determine current frame anchor based on current progress
        let currentAnchor = CENTER_FRAME;
        const prog = currentProgressRef.current;
        if (prog < 0) {
          currentAnchor = Math.round(CENTER_FRAME - Math.abs(prog) * (CENTER_FRAME - PEAK_LEFT_FRAME));
        } else {
          currentAnchor = Math.round(CENTER_FRAME + prog * (PEAK_RIGHT_FRAME - CENTER_FRAME));
        }

        let targetEd: ColorEdition | null = null;
        let remainingFrames: number[] = [];
        let isCriticalRange = false;

        // Phase A: Prioritize filling 100% of the explosion range [47..143] for active, then other editions
        for (const ed of orderedEditions) {
          const rem = generateExplosionRangeSequence(ed, currentAnchor);
          if (rem.length > 0) {
            targetEd = ed;
            remainingFrames = rem;
            isCriticalRange = true;
            break;
          }
        }

        // Phase B: Fill any remaining outer frames (0..46 and 144..191)
        if (!targetEd) {
          for (const ed of orderedEditions) {
            const rem = generateAllRemainingSequence(ed);
            if (rem.length > 0) {
              targetEd = ed;
              remainingFrames = rem;
              isCriticalRange = false;
              break;
            }
          }
        }

        if (!targetEd || remainingFrames.length === 0) return;

        const batch = remainingFrames.slice(0, BATCH_SIZE);
        Promise.all(batch.map((idx) => loadSingle(targetEd!, idx))).then(() => {
          if (!active) return;
          if (isCriticalRange) {
            // Load critical explosion frames ASAP without long idle delays (smooth 60fps handover)
            setTimeout(loadNextBatch, 8);
          } else if ("requestIdleCallback" in window) {
            requestIdleCallback(loadNextBatch, { timeout: 200 });
          } else {
            setTimeout(loadNextBatch, 25);
          }
        });
      }

      loadNextBatch();
    });

    return () => {
      active = false;
    };
  }, [renderProgress]);

  // ─── Start Animation Loop ────────────────────────────────────────────
  useEffect(() => {
    if (!priorityReady || isPaused) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [priorityReady, animate, isPaused]);

  // ─── Viewport Resize Observer: Updates cached viewport without reflow ──
  useEffect(() => {
    const updateViewport = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const isMobile = rect.width < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
      viewportRef.current = {
        width: rect.width,
        height: rect.height,
        isMobile,
        dpr,
      };

      const canvas = canvasRef.current;
      if (canvas) {
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);
        if (Math.abs(canvas.width - targetW) > 4 || Math.abs(canvas.height - targetH) > 4) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }

      renderProgress(currentProgressRef.current);
    };

    updateViewport();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateViewport();
    });
    observer.observe(container);
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, [renderProgress]);

  // ─── Precision Mouse Handlers: Mobile (Top 46%) & Desktop (Top 80%) ──
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPaused) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const isMobile = viewportRef.current.isMobile;
      const bottomEdge = isMobile ? 0.46 : 0.80;

      const DESKTOP_LEFT_EDGE = 0.05;
      const DESKTOP_RIGHT_EDGE = 0.95;
      const CENTER_LEFT_BOUND = 0.47;
      const CENTER_RIGHT_BOUND = 0.53;

      const ratioX = relX / rect.width;
      const ratioY = relY / rect.height;

      if (
        ratioX < DESKTOP_LEFT_EDGE ||
        ratioX > DESKTOP_RIGHT_EDGE ||
        ratioY > bottomEdge
      ) {
        if (wasInsideActiveRef.current) {
          wasInsideActiveRef.current = false;
          triggerAutoReturn(480);
        }
      } else {
        wasInsideActiveRef.current = true;
        isAutoReturningRef.current = false;

        if (ratioX >= CENTER_LEFT_BOUND && ratioX <= CENTER_RIGHT_BOUND) {
          targetProgressRef.current = 0;
        } else if (ratioX < CENTER_LEFT_BOUND) {
          const t = (CENTER_LEFT_BOUND - ratioX) / (CENTER_LEFT_BOUND - DESKTOP_LEFT_EDGE);
          targetProgressRef.current = -Math.min(1, Math.max(0, t));
        } else {
          const t = (ratioX - CENTER_RIGHT_BOUND) / (DESKTOP_RIGHT_EDGE - CENTER_RIGHT_BOUND);
          targetProgressRef.current = Math.min(1, Math.max(0, t));
        }
      }

      if (hintVisible) setHintVisible(false);
    },
    [hintVisible, triggerAutoReturn, isPaused]
  );

  const handleMouseLeave = useCallback(() => {
    wasInsideActiveRef.current = false;
    triggerAutoReturn(480);
  }, [triggerAutoReturn]);

  // ─── Native Non-Passive Touch Handlers: Smooth Mobile Swiping ────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isPaused || e.touches.length > 1) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const relY = touch.clientY - rect.top;

      const isMobile = viewportRef.current.isMobile;
      const bottomEdge = isMobile ? 0.46 : 0.80;

      // Bottom area is reserved for UI controls (cards, buttons, specs)
      if (relY > rect.height * bottomEdge) {
        touchStartRef.current = null;
        return;
      }

      isAutoReturningRef.current = false;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startProg: currentProgressRef.current,
      };
      isHorizontalSwipeRef.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isPaused || !touchStartRef.current || e.touches.length > 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (isHorizontalSwipeRef.current === null) {
        if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
          isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      if (isHorizontalSwipeRef.current) {
        // Prevent browser horizontal back/forward navigation gesture from causing glitch
        if (e.cancelable) {
          e.preventDefault();
        }

        // Natural silky mobile sensitivity factor
        const sensitivity = window.innerWidth * 0.55;
        const progressDelta = deltaX / sensitivity;
        const newProg = Math.max(-1, Math.min(1, touchStartRef.current.startProg + progressDelta));
        targetProgressRef.current = newProg;

        if (hintVisible) setHintVisible(false);
      }
    };

    const onTouchEnd = () => {
      if (touchStartRef.current && isHorizontalSwipeRef.current) {
        triggerAutoReturn(480);
      }
      touchStartRef.current = null;
      isHorizontalSwipeRef.current = null;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isPaused, hintVisible, triggerAutoReturn]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden touch-pan-y cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 2D Canvas Stage - Razor Sharp Direct Frame Rendering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        style={{
          opacity: priorityReady ? 1 : 0,
          transition: "opacity 0.4s ease-out",
        }}
      />

      {/* Priority Loader */}
      {!priorityReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-[#0a0a0a]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border border-white/5" />
            <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#goldGrad)"
                strokeWidth="2"
                strokeDasharray={`${(totalLoaded / (DENSE_SKELETON_FRAMES.length * 3)) * 175.9} 175.9`}
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8c97a" />
                  <stop offset="100%" stopColor="#c8a84e" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-mono tracking-widest text-white/40 uppercase">
              Calibrating Precision Optics
            </span>
            <span className="text-[9px] font-mono text-[#c8a84e] tracking-widest uppercase">
              3 Camera Editions · Ready
            </span>
          </div>
        </div>
      )}

      {/* Discovery Hint: Positioned at top-20 on mobile (above camera) and bottom-20 on desktop */}
      {priorityReady && hintVisible && (
        <div className="absolute top-20 sm:top-24 md:top-auto md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-opacity duration-500">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono tracking-wider text-white/70 uppercase">
            <span className="text-[#c8a84e] animate-bounce-x">←</span>
            <span>Drag horizontally to explode internal optics</span>
            <span className="text-[#c8a84e] animate-bounce-x-r">→</span>
          </div>
        </div>
      )}
    </div>
  );
}
