// Simple 8-bit Retro Sound Synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;

const initAudio = (): AudioContext => {
  if (!audioCtx) {
    // Handle the webkit prefix for Safari/older browsers safely
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
  }
  // Safe check if context exists and is suspended
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(e => console.error(e));
  }
  
  // Cast to AudioContext because usage implies we expect it to work or fail gracefully elsewhere
  return audioCtx as AudioContext;
};

// Generic Oscillator Helper
const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0, vol: number = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return; // Safety check

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
};

// --- CLICK / TAP SOUNDS ---

// Helper for the "fingernail tap" sound
const playTick = (ctx: AudioContext, frequency: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Instant attack, very fast decay
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
};

export const playBlip = () => {
  // Simple UI cursor move/select sound
  playTone(400, 'square', 0.05, 0, 0.05);
};

export const playSelect = () => {
  // Confirm action sound
  playTone(600, 'square', 0.1, 0, 0.05);
  playTone(800, 'square', 0.1, 0.05, 0.05);
};

export const playCoinFlip = () => {
  const ctx = initAudio();
  if (!ctx) return;
  
  // Randomize between 3 subtle pitch variations of the "High Tick"
  const variant = Math.floor(Math.random() * 3);

  switch (variant) {
    case 0:
      // Standard High Tick (Original)
      playTick(ctx, 3000);
      break;
    case 1:
      // Slightly Higher / Sharper
      playTick(ctx, 3300);
      break;
    case 2:
      // Slightly Lower / Dullier
      playTick(ctx, 2750);
      break;
  }
};

export const playCoinLand = (isHeads: boolean) => {
  // Coin shimmer / Ding sound
  const baseFreq = isHeads ? 1200 : 900; // Heads slightly higher pitch
  playTone(baseFreq, 'sine', 0.5, 0, 0.1);
  playTone(baseFreq * 1.5, 'sine', 0.5, 0.05, 0.05);
};

export const playWin = () => {
  // Gothic Victory Fanfare (Short Baroque-style Arpeggio)
  // Notes: A4, C#5, E5 (A Major) played quickly like a harpsichord/organ
  const ctx = initAudio();
  if (!ctx) return;

  const type = 'sawtooth'; // Sawtooth gives a brassy/organ retro vibe

  // Fast rising arpeggio
  playTone(440.00, type, 0.15, 0.00, 0.15); // A4
  playTone(554.37, type, 0.15, 0.08, 0.15); // C#5
  playTone(659.25, type, 0.40, 0.16, 0.15); // E5
  
  // Subtle harmony/bass note
  playTone(220.00, 'triangle', 0.40, 0.00, 0.2); // A3
};

export const playLose = () => {
  // Gothic Defeat: Deep, Somber Bell (Low frequency cluster)
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;

  const duration = 1.5;

  // Oscillator 1: Fundamental (Low C)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle'; // Triangle is cleaner, hollow like a bell
  osc1.frequency.setValueAtTime(65.41, now); // C2
  
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + duration);

  // Oscillator 2: Detuned slightly for "chorus/beating" dark effect + Minor interval
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(77.78, now); // Eb2 (Minor 3rd) - Sad/Dark interval
  
  gain2.gain.setValueAtTime(0.25, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + duration);
};
