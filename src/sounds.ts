// Simple 8-bit Retro Sound Synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;

const initAudio = (): AudioContext => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
  }
  return audioCtx as AudioContext;
};

// CRITICAL FOR MOBILE: Trigger this on the first user interaction (click/touch)
export const unlockAudioContext = () => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    // Play a silent buffer to wake up the audio engine on iOS
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
};

// Generic Oscillator Helper
const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0, vol: number = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const t = ctx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t + delay);
  
  gain.gain.setValueAtTime(vol, t + delay);
  gain.gain.exponentialRampToValueAtTime(0.01, t + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t + delay);
  osc.stop(t + delay + duration);
};

// Helper for the "fingernail tap" sound
const playTick = (ctx: AudioContext, frequency: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, t);
  
  // Instant attack, very fast decay
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(t + 0.05);
};

export const playBlip = () => {
  playTone(400, 'square', 0.05, 0, 0.05);
};

export const playSelect = () => {
  playTone(600, 'square', 0.1, 0, 0.05);
  playTone(800, 'square', 0.1, 0.05, 0.05);
};

export const playCoinFlip = () => {
  const ctx = initAudio();
  if (!ctx) return;
  
  const variant = Math.floor(Math.random() * 3);

  switch (variant) {
    case 0: playTick(ctx, 3000); break;
    case 1: playTick(ctx, 3300); break;
    case 2: playTick(ctx, 2750); break;
  }
};

export const playCoinLand = (isHeads: boolean) => {
  const baseFreq = isHeads ? 1200 : 900;
  playTone(baseFreq, 'sine', 0.5, 0, 0.1);
  playTone(baseFreq * 1.5, 'sine', 0.5, 0.05, 0.05);
};

export const playWin = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const type = 'sawtooth';
  
  playTone(440.00, type, 0.15, 0.00, 0.15); // A4
  playTone(554.37, type, 0.15, 0.08, 0.15); // C#5
  playTone(659.25, type, 0.40, 0.16, 0.15); // E5
  playTone(220.00, 'triangle', 0.40, 0.00, 0.2); // A3
};

export const playLose = () => {
  const ctx = initAudio();
  if (!ctx) return;
  
  const t = ctx.currentTime;
  const duration = 1.5;

  // Oscillator 1
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(65.41, t); // C2
  gain1.gain.setValueAtTime(0.4, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + duration);

  // Oscillator 2
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(77.78, t); // Eb2
  gain2.gain.setValueAtTime(0.25, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + duration);
};
