import { ALPHABET, charToIndex, indexToChar } from '../constants';
import type { EnigmaConfig } from '../types/enigma.types';
import type { SignalTrace, MessageTrace } from '../types/trace.types';
import { Rotor } from './Rotor';
import { Reflector } from './Reflector';
import { Plugboard } from './Plugboard';
import { SignalTraceService } from './SignalTraceService';

export class EnigmaMachine {
  private rotors: Rotor[]; // Order: [Leftmost, Middle, Rightmost] for a 3-rotor setup
  private reflector: Reflector;
  private plugboard: Plugboard;
  private traceService: SignalTraceService;

  constructor(config: EnigmaConfig) {
    this.rotors = config.rotors.map(rs => new Rotor(rs));
    this.reflector = new Reflector(config.reflector);
    this.plugboard = new Plugboard(config.plugboard);
    this.traceService = new SignalTraceService();
  }

  // Implements M3 Enigma stepping for 3 rotors.
  // This method is called *before* each character is processed.
  private stepRotors(): void {
    let rL, rM, rR;
    if (this.rotors.length === 4) {
      rL = this.rotors[1]; // Left
      rM = this.rotors[2]; // Middle
      rR = this.rotors[3]; // Right
      // this.rotors[0] (Beta/Gamma) does NOT step automatically.
    } else if (this.rotors.length === 3) {
      rL = this.rotors[0]; // Left
      rM = this.rotors[1]; // Middle
      rR = this.rotors[2]; // Right
    } else {
      if (this.rotors.length > 0) {
        this.rotors[this.rotors.length - 1].step();
      }
      return;
    }

    const middleRotorAtNotch = rM.isAtNotch();
    const rightRotorAtNotch = rR.isAtNotch();

    if (middleRotorAtNotch) {
        rL.step();
        rM.step();
    } else if (rightRotorAtNotch) {
        rM.step();
    }
    rR.step();
  }

  public processCharacter(char: string): string {
    const charUpper = char.toUpperCase();
    if (ALPHABET.indexOf(charUpper) === -1) {
      return char; // Pass through non-alphabetic characters
    }

    this.stepRotors();

    let signal = charToIndex(charUpper);

    // Plugboard (Forward)
    signal = this.plugboard.process(signal);

    // Forward pass: Rightmost rotor through Leftmost rotor
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      signal = this.rotors[i].forward(signal);
    }

    // Reflector
    signal = this.reflector.reflect(signal);

    // Backward pass: Leftmost rotor through Rightmost rotor
    for (let i = 0; i < this.rotors.length; i++) {
      signal = this.rotors[i].backward(signal);
    }

    // Plugboard (Inverse/Backward)
    signal = this.plugboard.process(signal);

    return indexToChar(signal);
  }

  /**
   * Encrypts a single character and returns a full signal trace.
   * Stepping is performed internally before tracing.
   *
   * @param char      - Character to encrypt (A-Z)
   * @param charIndex - Position in the message (0-indexed)
   * @returns SignalTrace with 9 steps, or null for non-alphabetic characters
   */
  public processCharacterTraced(char: string, charIndex: number): SignalTrace | null {
    const charUpper = char.toUpperCase();
    if (ALPHABET.indexOf(charUpper) === -1) return null;

    this.stepRotors();

    return this.traceService.traceCharacter(
      charUpper,
      charIndex,
      this.rotors,
      this.reflector,
      this.plugboard
    );
  }

  public processString(text: string): string {
    let result = "";
    for (const char of text) {
      result += this.processCharacter(char);
    }
    return result;
  }

  /**
   * Encrypts a full string and returns both the result and a MessageTrace.
   */
  public processStringTraced(text: string, config: EnigmaConfig): { result: string; trace: MessageTrace } {
    const traces: SignalTrace[] = [];
    let result = "";
    let charIndex = 0;

    for (const char of text) {
      const charUpper = char.toUpperCase();
      if (ALPHABET.indexOf(charUpper) === -1) {
        result += char;
        continue;
      }

      const trace = this.processCharacterTraced(charUpper, charIndex);
      if (trace) {
        traces.push(trace);
        result += trace.outputChar;
        charIndex++;
      }
    }

    return {
      result,
      trace: {
        traces,
        config,
        timestamp: Date.now(),
      },
    };
  }

  /** Exposes rotor instances for external inspection (read-only intent). */
  public getRotors(): readonly Rotor[] {
    return this.rotors;
  }

  /** Exposes reflector instance for external inspection (read-only intent). */
  public getReflector(): Reflector {
    return this.reflector;
  }

  /** Exposes plugboard instance for external inspection (read-only intent). */
  public getPlugboard(): Plugboard {
    return this.plugboard;
  }
}
