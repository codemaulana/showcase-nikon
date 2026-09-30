/**
 * Ultra-realistic client-side mechanical shutter audio generator using Web Audio API.
 * Recreates the iconic dual-curtain tactile acoustic click of the Nikon Zf / F3
 * with zero external file dependencies!
 */
export function playShutterSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Helper: Create a bandpass filtered noise burst (mechanical friction & snap)
    const playMechanicalBurst = (startTime: number, freq: number, q: number, duration: number, gainVal: number) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(freq, startTime);
      filter.Q.setValueAtTime(q, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + duration);
    };

    // Helper: Create a low-frequency body thud (camera chassis inertia)
    const playBodyThud = (startTime: number, freq: number, duration: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(30, startTime + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // ─── TRANSIENT 1: Front Curtain Release (Instant) ─────────────────
    playMechanicalBurst(now, 2800, 4.0, 0.035, 0.65);
    playMechanicalBurst(now + 0.003, 1400, 2.5, 0.045, 0.45);
    playBodyThud(now, 160, 0.05, 0.4);

    // ─── TRANSIENT 2: Rear Curtain Close & Mirror Spring (55ms later) ──
    const t2 = now + 0.052;
    playMechanicalBurst(t2, 3400, 3.5, 0.03, 0.7);
    playMechanicalBurst(t2 + 0.005, 950, 1.8, 0.05, 0.5);
    playBodyThud(t2, 120, 0.06, 0.35);

    // Subtle metallic spring reverberation tail
    playMechanicalBurst(t2 + 0.02, 4200, 5.0, 0.04, 0.25);
  } catch {
    // AudioContext blocked by browser autoplay policy until user gesture
  }
}
