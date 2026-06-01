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
  /**
   * Helper to create a burst of white noise
   */
  private createNoiseBuffer(durationMs: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const frameCount = Math.floor(this.ctx.sampleRate * (durationMs / 1000));
    const buffer = this.ctx.createBuffer(1, frameCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public playKeyClick() {
    if (!this.enabled || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    // 100% Mechanical Key Click (No oscillators, only shaped noise)
    const buffer = this.createNoiseBuffer(40); // 40ms
    if (!buffer) return;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Split noise into two paths to simulate complex mechanical resonance
    
    // Path A: High-pitched plastic/metal snap
    const filterHigh = this.ctx.createBiquadFilter();
    filterHigh.type = 'bandpass';
    filterHigh.frequency.setValueAtTime(4500, time);
    filterHigh.Q.value = 1.5;
    
    const gainHigh = this.ctx.createGain();
    gainHigh.gain.setValueAtTime(1.5, time);
    gainHigh.gain.exponentialRampToValueAtTime(0.01, time + 0.015); // extremely sharp
    
    // Path B: Mid-range body clack
    const filterMid = this.ctx.createBiquadFilter();
    filterMid.type = 'bandpass';
    filterMid.frequency.setValueAtTime(1200, time);
    filterMid.Q.value = 2.0;
    
    const gainMid = this.ctx.createGain();
    gainMid.gain.setValueAtTime(1.0, time);
    gainMid.gain.exponentialRampToValueAtTime(0.01, time + 0.03); // slightly longer body resonance
    
    // Routing
    noise.connect(filterHigh);
    filterHigh.connect(gainHigh);
    gainHigh.connect(this.ctx.destination);
    
    noise.connect(filterMid);
    filterMid.connect(gainMid);
    gainMid.connect(this.ctx.destination);
    
    noise.start(time);
  }

  /**
   * Heavy mechanical "Kachunk" for physical rotor stepping.
   */
  public playRotorStep(isDoubleStep: boolean = false) {
    if (!this.enabled || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    // 100% Mechanical Rotor Step (No oscillators)
    const duration = isDoubleStep ? 120 : 90;
    const buffer = this.createNoiseBuffer(duration);
    if (!buffer) return;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Path A: Heavy low-end thud (replacing the sine wave)
    const filterLow = this.ctx.createBiquadFilter();
    filterLow.type = 'lowpass';
    filterLow.frequency.setValueAtTime(250, time);
    
    const gainLow = this.ctx.createGain();
    const peakLow = isDoubleStep ? 3.0 : 2.0; // Boosted gain for heavy impact
    gainLow.gain.setValueAtTime(peakLow, time);
    gainLow.gain.exponentialRampToValueAtTime(0.01, time + (duration / 1000));
    
    // Path B: Metallic grind/sliding friction
    const filterGrind = this.ctx.createBiquadFilter();
    filterGrind.type = 'bandpass';
    filterGrind.frequency.setValueAtTime(1800, time);
    filterGrind.Q.value = 1.0;
    
    const gainGrind = this.ctx.createGain();
    gainGrind.gain.setValueAtTime(1.5, time);
    gainGrind.gain.linearRampToValueAtTime(0.01, time + (duration / 1000) * 0.8);
    
    // Path C: The sharp metallic click of the latch locking
    const filterLatch = this.ctx.createBiquadFilter();
    filterLatch.type = 'highpass';
    filterLatch.frequency.setValueAtTime(4000, time);
    
    const gainLatch = this.ctx.createGain();
    gainLatch.gain.setValueAtTime(0.001, time);
    // Delay the latch click slightly to simulate the end of the mechanical movement
    gainLatch.gain.setValueAtTime(1.2, time + 0.02);
    gainLatch.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
    
    // Routing
    noise.connect(filterLow);
    filterLow.connect(gainLow);
    gainLow.connect(this.ctx.destination);
    
    noise.connect(filterGrind);
    filterGrind.connect(gainGrind);
    gainGrind.connect(this.ctx.destination);
    
    noise.connect(filterLatch);
    filterLatch.connect(gainLatch);
    gainLatch.connect(this.ctx.destination);
    
    noise.start(time);
  }
}

// Singleton instance surviving HMR
export const soundEngine = (window as any).__soundEngine || new SoundEngine();
(window as any).__soundEngine = soundEngine;
