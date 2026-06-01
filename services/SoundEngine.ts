/**
 * SoundEngine — Immersive procedural audio for the Enigma simulator.
 * 
 * Uses the Web Audio API to generate realistic mechanical clicks
 * and deep rotor thuds without needing external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false; // default off until user interacts

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = true;
  }

  public setEnabled(state: boolean) {
    this.enabled = state;
    if (state) this.init();
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * High-frequency metallic click for key presses.
   */
  public playKeyClick() {
    if (!this.enabled || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    // 1. Mechanical Clack (Filtered White Noise)
    const bufferSize = this.ctx.sampleRate * 0.03; // 30ms burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter the noise to sound like a metallic/plastic keycap impact
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, time);
    filter.Q.value = 1.2;
    
    const noiseGain = this.ctx.createGain();
    // Very sharp attack and decay
    noiseGain.gain.setValueAtTime(1.0, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.025);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    // 2. Body Resonance (Low frequency "thwack")
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, time);
    
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.2, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.03);
  }

  /**
   * Low-frequency heavy thud for physical rotor stepping.
   */
  public playRotorStep(isDoubleStep: boolean = false) {
    if (!this.enabled || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    // 1. Sliding Metal Friction (Lowpass Noise)
    const bufferSize = this.ctx.sampleRate * 0.08; // 80ms friction
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(600, time);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.linearRampToValueAtTime(0.01, time + 0.08);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    // 2. Heavy Rotor Thud (Sine wave)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    // Deep thud, slightly deeper if double step
    const freq = isDoubleStep ? 50 : 65;
    osc.frequency.setValueAtTime(freq, time);
    
    const oscGain = this.ctx.createGain();
    const peakVolume = isDoubleStep ? 1.5 : 0.8;
    
    // Smooth but fast envelope for a heavy object locking into place
    oscGain.gain.setValueAtTime(0.001, time);
    oscGain.gain.linearRampToValueAtTime(peakVolume, time + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.08);
  }
}

// Singleton instance surviving HMR
export const soundEngine = (window as any).__soundEngine || new SoundEngine();
(window as any).__soundEngine = soundEngine;
