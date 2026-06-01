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
    
    // Use a short, sharp oscillator click instead of white noise for better compatibility/audibility
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.05);
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
    const peakVolume = isDoubleStep ? 1.0 : 0.6;
    gainNode.gain.setValueAtTime(peakVolume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }
}

// Singleton instance surviving HMR
export const soundEngine = (window as any).__soundEngine || new SoundEngine();
(window as any).__soundEngine = soundEngine;
