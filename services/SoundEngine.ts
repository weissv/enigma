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
    
    // White noise burst
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noise.start(time);
  }

  /**
   * Low-frequency heavy thud for physical rotor stepping.
   */
  public playRotorStep(isDoubleStep: boolean = false) {
    if (!this.enabled || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    
    // Deeper drop for double step
    const startFreq = isDoubleStep ? 120 : 180;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
    
    const gainNode = this.ctx.createGain();
    const peakVolume = isDoubleStep ? 0.9 : 0.4;
    gainNode.gain.setValueAtTime(peakVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }
}

// Singleton instance
export const soundEngine = new SoundEngine();
