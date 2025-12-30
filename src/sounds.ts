// Simple 8-bit Retro Sound Synthesizer using Web Audio API

// Helper to handle Web Audio Context globally
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (!audioCtx) {
    // Safari requires webkitAudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

// CRITICAL: Call this on 'touchstart' or 'click' to unlock audio on iOS
export const unlockAudioContext = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Always try to resume
  if (ctx.state === 'suspended' || (ctx.state as string) === 'interrupted') {
    ctx.resume().catch((e) => console.warn("Audio resume failed", e));
  }

  // Play a silent buffer to physically wake up the audio thread
  try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
  } catch (e) {
      console.warn("Audio wake up buffer failed", e);
  }
};

// Generic Oscillator Helper
const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0, vol: number = 0.1) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Ensure we try to resume if it suspended in the background
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const t = ctx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t + delay);
  
  // Volume envelope
  gain.gain.setValueAtTime(vol, t + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, t + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t + delay);
  osc.stop(t + delay + duration);
};

// Organ Note Helper (combines two oscillators for fuller sound)
const playOrganNote = (ctx: AudioContext, freq: number, startTime: number, duration: number, vol: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 0.5; // Sub-octave for body

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05); // Attack
    gain.gain.setValueAtTime(vol * 0.8, startTime + duration * 0.8); // Sustain
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
};

// Helper for the "fingernail tap" sound
const playTick = (ctx: AudioContext, frequency: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime;

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, t);
  
  // Instant attack, very fast decay (click sound)
  gain.gain.setValueAtTime(0.3, t); // Louder for mobile
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

// Dark Organ Intro (Bach-style Neapolitan TRIADS)
export const playOrganStart = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const vol = 0.1;

    // Chord 1: A Minor (The Tonic) - Gloomy start
    // A2 (110) + E3 (164.8) + C4 (261.6)
    const chord1Dur = 0.8;
    playOrganNote(ctx, 110.00, t, chord1Dur, vol);       // A2
    playOrganNote(ctx, 164.81, t, chord1Dur, vol);       // E3
    playOrganNote(ctx, 261.63, t, chord1Dur, vol);       // C4

    // Chord 2: Bb Major (The Neapolitan) - The Phrygian/Dark step up
    // Bb2 (116.5) + F3 (174.6) + D4 (293.7)
    const start2 = t + 0.75;
    const chord2Dur = 1.5;
    playOrganNote(ctx, 116.54, start2, chord2Dur, vol);  // Bb2
    playOrganNote(ctx, 174.61, start2, chord2Dur, vol);  // F3
    playOrganNote(ctx, 293.66, start2, chord2Dur, vol);  // D4
};

// Wind Sound for "Yield"
export const playWind = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // White noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1;
  filter.frequency.setValueAtTime(600, t);
  filter.frequency.exponentialRampToValueAtTime(100, t + 1.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0, t + 1.5);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(t);
  noise.stop(t + 2);
};

export const playCoinFlip = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  const variant = Math.floor(Math.random() * 3);
  // Higher frequencies cut through mobile speakers better
  switch (variant) {
    case 0: playTick(ctx, 3000); break;
    case 1: playTick(ctx, 3300); break;
    case 2: playTick(ctx, 2750); break;
  }
};

export const playCoinLand = (isHeads: boolean) => {
  const baseFreq = isHeads ? 1200 : 900;
  playTone(baseFreq, 'sine', 0.5, 0, 0.2);
  playTone(baseFreq * 1.5, 'sine', 0.5, 0.05, 0.1);
};

export const playWin = () => {
  playTone(440.00, 'sawtooth', 0.15, 0.00, 0.15); 
  playTone(554.37, 'sawtooth', 0.15, 0.08, 0.15); 
  playTone(659.25, 'sawtooth', 0.40, 0.16, 0.15); 
  playTone(220.00, 'triangle', 0.40, 0.00, 0.2); 
};

export const playLose = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const duration = 1.5;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle'; 
  osc1.frequency.setValueAtTime(65.41, t); 
  gain1.gain.setValueAtTime(0.4, t);
  gain1.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + duration);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(77.78, t); 
  gain2.gain.setValueAtTime(0.25, t);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(t);
  osc2.stop(t + duration);
};
