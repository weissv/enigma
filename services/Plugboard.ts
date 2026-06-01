/**
 * Plugboard (Steckerbrett) Service.
 *
 * Implements the Enigma front panel plugboard, which allowed operators to swap
 * pairs of letters before they entered the rotors, and after they exited.
 * Maximum 13 pairs (all 26 letters connected).
 */

import { charToIndex, indexToChar } from '../constants';

export class Plugboard {
  private wiring: number[];

  constructor(config: Record<string, string> = {}) {
    // Initialize with straight-through wiring (A->A, B->B, etc.)
    this.wiring = new Array(26).fill(0).map((_, i) => i);

    // Apply configuration
    for (const [a, b] of Object.entries(config)) {
      this.addCable(a, b);
    }
  }

  /**
   * Transforms a signal (0-25) through the plugboard.
   * Because plugboard cables are simple reciprocal wires, the forward
   * and inverse transformations are identical.
   */
  public process(signal: number): number {
    if (signal < 0 || signal > 25) return signal;
    return this.wiring[signal];
  }

  /**
   * Adds a cable between two characters (e.g. 'A', 'B').
   * Throws if characters are invalid or already connected.
   */
  public addCable(charA: string, charB: string): void {
    const a = charA.toUpperCase();
    const b = charB.toUpperCase();

    if (a === b) return; // Ignoring self-connections
    
    const idxA = charToIndex(a);
    const idxB = charToIndex(b);

    if (idxA < 0 || idxA > 25 || idxB < 0 || idxB > 25) {
      throw new Error(`Invalid characters for plugboard: ${charA}, ${charB}`);
    }

    // Check if either is already connected to something else
    if (this.wiring[idxA] !== idxA && this.wiring[idxA] !== idxB) {
      throw new Error(`Character ${a} is already connected to ${indexToChar(this.wiring[idxA])}`);
    }
    if (this.wiring[idxB] !== idxB && this.wiring[idxB] !== idxA) {
      throw new Error(`Character ${b} is already connected to ${indexToChar(this.wiring[idxB])}`);
    }

    this.wiring[idxA] = idxB;
    this.wiring[idxB] = idxA;
  }

  /**
   * Returns the current configuration as a dictionary of pairs.
   * E.g., { 'A': 'B', 'C': 'D' }
   * Note: We only return one direction per pair (e.g. A->B, but not B->A)
   * to avoid duplicates in the UI.
   */
  public getConfig(): Record<string, string> {
    const config: Record<string, string> = {};
    const seen = new Set<number>();

    for (let i = 0; i < 26; i++) {
      if (this.wiring[i] !== i && !seen.has(i)) {
        config[indexToChar(i)] = indexToChar(this.wiring[i]);
        seen.add(i);
        seen.add(this.wiring[i]);
      }
    }

    return config;
  }
}
