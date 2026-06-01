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
    
    // 1. Mechanical "Clack"
    // We use a short burst of noise for the physical impact
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05); // 50ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass to focus on the 'clack' frequencies
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.Q.value = 1.0;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.5, time); // Loud impact
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    // 2. Body thud
    // Use a square wave so it has harmonics and is audible on laptop speakers
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(250, time);
    
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    noise.start(time);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  /**
   * Heavy mechanical "Kachunk" for physical rotor stepping.
   */
  public playRotorStep(isDoubleStep: boolean = false) {
    if (!this.enabled || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    // 1. Sliding Metal Friction
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12); // 120ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1500, time); // More high end for metal grind
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, time);
    noiseGain.gain.linearRampToValueAtTime(0.01, time + 0.12);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    // 2. Heavy Rotor "Chunk"
    // Using square wave to guarantee it cuts through small speakers
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    
    const freq = isDoubleStep ? 80 : 120;
    osc.frequency.setValueAtTime(freq, time);
    
    const oscGain = this.ctx.createGain();
    const peakVolume = isDoubleStep ? 1.5 : 1.0;
    
    oscGain.gain.setValueAtTime(0.001, time);
    oscGain.gain.linearRampToValueAtTime(peakVolume, time + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15); // Longer decay so it feels heavy
    
    // Optional second harmonic to add metallic clank
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 3.5, time);
    
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(peakVolume * 0.5, time);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    osc2.connect(osc2Gain);
    osc2Gain.connect(this.ctx.destination);
    
    noise.start(time);
    osc.start(time);
    osc2.start(time);
    
    osc.stop(time + 0.15);
    osc2.stop(time + 0.1);
  }
}

// Singleton instance surviving HMR
export const soundEngine = (window as any).__soundEngine || new SoundEngine();
(window as any).__soundEngine = soundEngine;
