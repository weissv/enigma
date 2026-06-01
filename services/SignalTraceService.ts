/**
 * Signal Trace Service — Mechanistic Interpretability Engine.
 *
 * Captures the complete electrical signal path through the Enigma machine
 * for each character. This is the core of the "Glass Box" module.
 *
 * Design: Stateless service that operates on mutable Rotor/Reflector instances.
 * The EnigmaMachine handles stepping; this service instruments the signal flow.
 */

import { ALPHABET, charToIndex, indexToChar } from '../constants';
import type { EnigmaConfig } from '../types/enigma.types';
import {
  TraceStage,
  type ExtendedTraceStep,
  type SignalTrace,
  type MessageTrace,
  type RotorComponentState,
  type ReflectorComponentState,
} from '../types/trace.types';
import { Rotor } from './Rotor';
import { Reflector } from './Reflector';

export class SignalTraceService {

  /**
   * Encrypts a single character and captures a full 9-step trace.
   * IMPORTANT: Stepping must be performed by the caller BEFORE calling this method.
   *
   * @param char      - The character to encrypt (A-Z)
   * @param charIndex - Position in the message (0-indexed)
   * @param rotors    - Rotor instances AFTER stepping (order: [L, M, R])
   * @param reflector - Reflector instance
   * @returns SignalTrace with 9 steps, or null for non-alphabetic characters
   */
  public traceCharacter(
    char: string,
    charIndex: number,
    rotors: Rotor[],
    reflector: Reflector,
  ): SignalTrace | null {
    const charUpper = char.toUpperCase();
    if (ALPHABET.indexOf(charUpper) === -1) return null;

    const steps: ExtendedTraceStep[] = [];
    let signal = charToIndex(charUpper);

    // Capture rotor positions at this point (after stepping, before encryption)
    const rotorPositions = rotors.map(r => r.position);

    // ── Step 0: INPUT ────────────────────────────────────────
    steps.push({
      stage: TraceStage.INPUT,
      signalIn: signal,
      signalOut: signal,
      charIn: charUpper,
      charOut: charUpper,
      componentState: { kind: 'identity' },
    });

    // ── Steps 1-3: Forward pass (Right → Middle → Left) ─────
    const forwardStages = [
      TraceStage.ROTOR_R_FWD,
      TraceStage.ROTOR_M_FWD,
      TraceStage.ROTOR_L_FWD,
    ];

    for (let i = rotors.length - 1; i >= 0; i--) {
      const rotor = rotors[i];
      const signalIn = signal;
      signal = rotor.forward(signal);

      steps.push({
        stage: forwardStages[rotors.length - 1 - i],
        signalIn,
        signalOut: signal,
        charIn: indexToChar(signalIn),
        charOut: indexToChar(signal),
        componentState: this.captureRotorState(rotor, i),
      });
    }

    // ── Step 4: Reflector ────────────────────────────────────
    const signalBeforeReflector = signal;
    signal = reflector.reflect(signal);

    steps.push({
      stage: TraceStage.REFLECTOR,
      signalIn: signalBeforeReflector,
      signalOut: signal,
      charIn: indexToChar(signalBeforeReflector),
      charOut: indexToChar(signal),
      componentState: this.captureReflectorState(reflector),
    });

    // ── Steps 5-7: Backward pass (Left → Middle → Right) ────
    const backwardStages = [
      TraceStage.ROTOR_L_INV,
      TraceStage.ROTOR_M_INV,
      TraceStage.ROTOR_R_INV,
    ];

    for (let i = 0; i < rotors.length; i++) {
      const rotor = rotors[i];
      const signalIn = signal;
      signal = rotor.backward(signal);

      steps.push({
        stage: backwardStages[i],
        signalIn,
        signalOut: signal,
        charIn: indexToChar(signalIn),
        charOut: indexToChar(signal),
        componentState: this.captureRotorState(rotor, i),
      });
    }

    // ── Step 8: OUTPUT ───────────────────────────────────────
    const outputChar = indexToChar(signal);
    steps.push({
      stage: TraceStage.OUTPUT,
      signalIn: signal,
      signalOut: signal,
      charIn: outputChar,
      charOut: outputChar,
      componentState: { kind: 'identity' },
    });

    return {
      charIndex,
      inputChar: charUpper,
      outputChar,
      steps,
      rotorPositionsAtEncryption: rotorPositions,
    };
  }

  /**
   * Encrypts a full message and returns traces for every character.
   * Creates a fresh EnigmaMachine internally to ensure clean state.
   */
  public traceMessage(text: string, config: EnigmaConfig): MessageTrace {
    const rotors = config.rotors.map(rs => new Rotor(rs));
    const reflector = new Reflector(config.reflector);
    const traces: SignalTrace[] = [];

    let charIndex = 0;
    for (const char of text) {
      const charUpper = char.toUpperCase();
      if (ALPHABET.indexOf(charUpper) === -1) continue;

      // Perform stepping (same logic as EnigmaMachine.stepRotors)
      this.stepRotors(rotors);

      const trace = this.traceCharacter(charUpper, charIndex, rotors, reflector);
      if (trace) {
        traces.push(trace);
        charIndex++;
      }
    }

    return {
      traces,
      config,
      timestamp: Date.now(),
    };
  }

  /**
   * M3 stepping logic — duplicated from EnigmaMachine for independence.
   * Applied before each character.
   */
  private stepRotors(rotors: Rotor[]): void {
    if (rotors.length !== 3) {
      if (rotors.length > 0) rotors[rotors.length - 1].step();
      return;
    }

    const [rL, rM, rR] = rotors;
    const middleAtNotch = rM.isAtNotch();
    const rightAtNotch = rR.isAtNotch();

    if (middleAtNotch) {
      rL.step();
      rM.step();
    } else if (rightAtNotch) {
      rM.step();
    }
    rR.step();
  }

  private captureRotorState(rotor: Rotor, slotIndex: number): RotorComponentState {
    return {
      kind: 'rotor',
      rotorType: rotor.type,
      position: rotor.position,
      ringSetting: rotor.ringSetting,
      slotIndex,
    };
  }

  private captureReflectorState(reflector: Reflector): ReflectorComponentState {
    return {
      kind: 'reflector',
      reflectorType: reflector.type,
    };
  }
}
