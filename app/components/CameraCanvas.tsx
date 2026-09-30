"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ColorEdition, EDITIONS } from "./HalcyonColorCard";

const TOTAL_FRAMES = 192;
const ALL_EDITIONS: ColorEdition[] = ["onyx", "blue", "green"];

/**
 * 192-Frame Ultra-Smooth Multi-Edition Camera Engine:
 * - 90% Active Desktop Width: 0.05 to 0.95 (5% outer margins trigger smooth ease-out return)
 * - 80% VH Bottom Boundary: 0.00 to 0.80 (Bottom 20% vh where controls/cards sit triggers return)
 * - Center Assembled: Frame 96 (0-indexed: 95) across ALL editions (zero jump)
 * - Peak Left Explode: Frame 48 (0-indexed: 47)
 * - Peak Right Explode: Frame 144 (0-indexed: 143)
 * - Proactive Multi-Edition Background Preloading:
 *   Onyx, Blue, and Green are all progressively preloaded so every color is 100% 60fps silky smooth!
 * - Zero Color-Flicker: NEVER cross-fall back to another edition's frame!
 */
const CENTER_FRAME = 95;      // Frame 96 (Assembled Front View)
const PEAK_LEFT_FRAME = 47;   // Frame 48 (Max Explode Left)
const PEAK_RIGHT_FRAME = 143; // Frame 144 (Max Explode Right)

// Critical skeleton frames for instant startup (< 200ms)
const SKELETON_FRAMES = [
  95, // Center Assembled Front (Frame 96)
  47, // Peak Left Explode (Frame 48)
  143, // Peak Right Explode (Frame 144)
  71, 83, 94, 96, 107, 119, 131,
  0, 24, 168, 191,
];

function getFrameUrl(edition: ColorEdition, index: number): string {
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

  // Auto-return easing state (for boundary exit, 80% vh bottom exit & mouse leave)
  const isAutoReturningRef = useRef<boolean>(false);
  const returnStartProgRef = useRef<number>(0);
  const returnStartTimeRef = useRef<number>(0);
  const returnDurationRef = useRef<number>(550);
  const wasInsideActiveRef = useRef<boolean>(true);

  const lastDrawnFrameRef = useRef<number>(-1);
  const rafRef = useRef<number | null>(null);

  // Touch device detection & state
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number; startProg: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);

  const [priorityReady, setPriorityReady] = useState<boolean>(false);
  const [totalLoaded, setTotalLoaded] = useState<number>(0);
  const [hintVisible, setHintVisible] = useState<boolean>(true);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  // Auto-dismiss discovery hint after 3.2s so it never blocks the screen
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

      if (loadedSet.has(CENTER_FRAME)) {
        let best = CENTER_FRAME;
        let minDiff = Math.abs(CENTER_FRAME - target);
        for (const idx of loadedSet) {
          const diff = Math.abs(idx - target);
          if (diff < minDiff) {
            minDiff = diff;
            best = idx;
          }
        }
        return best;
      }

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

  // ─── Razor-Sharp Single-Frame Draw (Zero Color-Strobe / Zero Ghosting) ──
  const drawFrame = useCallback(
    (frameIdx: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ed = activeEditionRef.current;
      let realIdx = getNearestLoadedFrame(ed, frameIdx);
      let img = realIdx >= 0 ? editionImagesRef.current[ed][realIdx] : null;

      // STRICT ISOLATION: Never fall back to another edition once any frame of ed is loaded!
      if (!img || !img.complete || img.naturalWidth === 0) {
        if (editionLoadedSetsRef.current[ed].size === 0) {
          // Only on the very first mount cycle if ed has zero frames yet
          const fallbackEd: ColorEdition = editionLoadedSetsRef.current.onyx.size > 0 ? "onyx" : ed;
          realIdx = getNearestLoadedFrame(fallbackEd, frameIdx);
          img = realIdx >= 0 ? editionImagesRef.current[fallbackEd][realIdx] : null;
        } else {
          return;
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const isMobile = rect.width < 768;
      // Cap DPR to 1.75 on mobile and 2 on desktop for buttery 60 FPS
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);

      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const cW = rect.width;
      const cH = rect.height;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      let drawW: number;
      let drawH: number;
      let x: number;
      let y: number;

      if (isMobile) {
        // MOBILE PORTRAIT: Fit camera in top half of viewport cleanly
        const scale = (cW / imgW) * 1.30;
        drawW = imgW * scale;
        drawH = imgH * scale;
        x = (cW - drawW) / 2;
        y = Math.max(10, (cH * 0.42 - drawH) / 2 + 35);
      } else {
        // DESKTOP: Fill 100vw, centered dramatically on pedestal
        const scale = Math.max(cW / imgW, cH / imgH);
        drawW = imgW * scale;
        drawH = imgH * scale;
        x = (cW - drawW) / 2;
        y = (cH - drawH) / 2;
      }

      ctx.clearRect(0, 0, cW, cH);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, x, y, drawW, drawH);

      ctx.restore();
      lastDrawnFrameRef.current = realIdx;
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

  // ─── Trigger Smooth Ease-Out Deceleration Return (~550ms) ─────────────
  const triggerAutoReturn = useCallback((duration = 550) => {
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
  }, [renderProgress]);

  // ─── Redraw instantly on edition change ───────────────────────────────
  useEffect(() => {
    if (priorityReady) {
      renderProgress(currentProgressRef.current);
    }
  }, [edition, priorityReady, renderProgress]);

  // ─── Progressive Background Frame Loader (All 3 Editions) ────────────
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
        img.onload = () => {
          if (!active) return;
          editionImagesRef.current[ed][index] = img;
          editionLoadedSetsRef.current[ed].add(index);
          if (ed === activeEditionRef.current) {
            setTotalLoaded((c) => c + 1);
          }
          resolve();
        };
        img.onerror = () => {
          if (!active) return;
          resolve();
        };
      });

    // Step 1: Immediate Critical Frames (< 200ms)
    // Load Frame 96 (Center) for ALL 3 EDITIONS so switching color is INSTANT!
    Promise.all([
      loadSingle("onyx", CENTER_FRAME),
      loadSingle("blue", CENTER_FRAME),
      loadSingle("green", CENTER_FRAME),
      ...SKELETON_FRAMES.map((idx) => loadSingle(edition, idx)),
    ]).then(() => {
      if (!active) return;
      setPriorityReady(true);
      drawFrame(CENTER_FRAME);

      // Helper to generate interactive frame sequence radiating outward from center
      const generateOutwardSequence = (ed: ColorEdition): number[] => {
        const list: number[] = [];
        for (let offset = 0; offset <= 48; offset++) {
          const left = CENTER_FRAME - offset;
          const right = CENTER_FRAME + offset;
          if (left >= PEAK_LEFT_FRAME && !editionLoadedSetsRef.current[ed].has(left)) {
            list.push(left);
          }
          if (right <= PEAK_RIGHT_FRAME && right !== left && !editionLoadedSetsRef.current[ed].has(right)) {
            list.push(right);
          }
        }
        return list;
      };

      // Step 2: Progressively queue active edition first, then the other 2 editions
      const editionsToLoad: ColorEdition[] = [
        edition,
        ...ALL_EDITIONS.filter((e) => e !== edition),
      ];

      let edIndex = 0;
      let frameList = generateOutwardSequence(editionsToLoad[edIndex]);
      let fIndex = 0;
      const BATCH_SIZE = 6;

      function loadNextBatch() {
        if (!active) return;

        // If current edition finished, move to the next edition in sequence!
        if (fIndex >= frameList.length) {
          edIndex++;
          if (edIndex >= editionsToLoad.length) return; // All editions 100% loaded!
          frameList = generateOutwardSequence(editionsToLoad[edIndex]);
          fIndex = 0;
        }

        const batch = frameList.slice(fIndex, fIndex + BATCH_SIZE);
        const currentEd = editionsToLoad[edIndex];
        fIndex += BATCH_SIZE;

        Promise.all(batch.map((idx) => loadSingle(currentEd, idx))).then(() => {
          if (!active) return;
          if ("requestIdleCallback" in window) {
            requestIdleCallback(loadNextBatch, { timeout: 250 });
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
  }, [edition, drawFrame]);

  // ─── Start Animation Loop ────────────────────────────────────────────
  useEffect(() => {
    if (!priorityReady || isPaused) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [priorityReady, animate, isPaused]);

  // ─── Handle Resize ───────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      renderProgress(currentProgressRef.current);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [renderProgress]);

  // ─── Desktop Mouse Handlers: 90% ACTIVE WIDTH & 80% VH BOTTOM LIMIT ──
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const ratioX = Math.max(0, Math.min(1, relX / rect.width));
      const ratioY = Math.max(0, Math.min(1, relY / rect.height));

      // 90% Active Interaction Zone horizontally (5% left margin, 5% right margin)
      const DESKTOP_LEFT_EDGE = 0.05;
      const DESKTOP_RIGHT_EDGE = 0.95;

      // 80% VH Bottom Boundary! (Bottom 20% vh where controls/cards live triggers auto-return)
      const DESKTOP_BOTTOM_EDGE = 0.80;

      // Center resting deadband (0.47 to 0.53)
      const CENTER_LEFT_BOUND = 0.47;
      const CENTER_RIGHT_BOUND = 0.53;

      const isInside =
        ratioX >= DESKTOP_LEFT_EDGE &&
        ratioX <= DESKTOP_RIGHT_EDGE &&
        ratioY <= DESKTOP_BOTTOM_EDGE;

      if (!isInside) {
        if (wasInsideActiveRef.current) {
          // Crossed outside 90% width or below 80% vh bottom -> smooth return to center
          wasInsideActiveRef.current = false;
          triggerAutoReturn(550);
        }
      } else {
        // Inside active zone (90% width, top 80% vh): direct mouse tracking
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
    [hintVisible, triggerAutoReturn]
  );

  const handleMouseLeave = useCallback(() => {
    wasInsideActiveRef.current = false;
    triggerAutoReturn(550);
  }, [triggerAutoReturn]);

  // ─── Mobile Touch Handlers: 80% VH Limit & Silky Smooth Swipe ────────
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const relY = touch.clientY - rect.top;
      // 80% VH Bottom Limit: Touches in the bottom 20% (> 80vh) are for UI controls (cards, buttons)
      if (relY > rect.height * 0.80) {
        touchStartRef.current = null;
        return;
      }
    }

    isAutoReturningRef.current = false;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      startProg: currentProgressRef.current,
    };
    isHorizontalSwipeRef.current = null;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (isHorizontalSwipeRef.current === null) {
        if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
          isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      if (isHorizontalSwipeRef.current) {
        // Natural silky mobile sensitivity factor
        const sensitivity = window.innerWidth * 0.55;
        const progressDelta = deltaX / sensitivity;
        const newProg = Math.max(-1, Math.min(1, touchStartRef.current.startProg + progressDelta));
        targetProgressRef.current = newProg;

        if (hintVisible) setHintVisible(false);
      }
    },
    [hintVisible]
  );

  const handleTouchEnd = useCallback(() => {
    if (touchStartRef.current && isHorizontalSwipeRef.current) {
      triggerAutoReturn(480);
    }
    touchStartRef.current = null;
    isHorizontalSwipeRef.current = null;
  }, [triggerAutoReturn]);

  const progressPercent = Math.min(100, Math.round((totalLoaded / SKELETON_FRAMES.length) * 100));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden touch-pan-y cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 1.759} 175.9`}
                style={{ transition: "stroke-dasharray 0.2s ease" }}
              />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c8a84e" />
                  <stop offset="100%" stopColor="#f3deb0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-white/30 text-[10px] tracking-[0.3em] uppercase font-mono">
              Calibrating Optics
            </p>
            <p className="text-[#c8a84e] text-sm font-mono font-medium">
              {progressPercent}%
            </p>
          </div>
        </div>
      )}

      {/* Discovery Hint: Positioned at top-20 on mobile (above camera) and bottom-20 on desktop */}
      {priorityReady && hintVisible && (
        <div className="absolute top-20 sm:top-24 md:top-auto md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-opacity duration-500">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/60 text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-mono shadow-2xl">
            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#c8a84e] animate-bounce-x shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>{isTouchDevice ? "Swipe to explode" : "Move cursor left or right to explode"}</span>
            <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#c8a84e] animate-bounce-x-r shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
