/**
 * Signal Trace Types — Mechanistic Interpretability (Glass Box Module).
 *
 * Captures the complete electrical signal path through the Enigma machine
 * for every character encrypted. Used for visualization and debugging.
 */

import type { RotorName, ReflectorName } from '../constants';
import type { EnigmaConfig } from './enigma.types';

/**
 * Identifier for each stage of the signal path.
 * Order matches the physical path of the electrical impulse.
 */
export enum TraceStage {
  INPUT       = 'INPUT',
  ROTOR_R_FWD = 'ROTOR_R_FWD',
  ROTOR_M_FWD = 'ROTOR_M_FWD',
  ROTOR_L_FWD = 'ROTOR_L_FWD',
  REFLECTOR   = 'REFLECTOR',
  ROTOR_L_INV = 'ROTOR_L_INV',
  ROTOR_M_INV = 'ROTOR_M_INV',
  ROTOR_R_INV = 'ROTOR_R_INV',
  OUTPUT      = 'OUTPUT',
}

/**
 * Component state snapshot at the moment of signal processing.
 */
export interface RotorComponentState {
  readonly kind: 'rotor';
  readonly rotorType: RotorName;
  readonly position: number;     // 0-25, position at encryption time
  readonly ringSetting: number;  // 0-25
  readonly slotIndex: number;    // 0=Left, 1=Middle, 2=Right
}

export interface ReflectorComponentState {
  readonly kind: 'reflector';
  readonly reflectorType: ReflectorName;
}

export type ComponentState = RotorComponentState | ReflectorComponentState;

/**
 * A single transformation step within the signal path.
 * Each step records what happened at one specific component.
 */
export interface TraceStep {
  readonly stage: TraceStage;
  readonly signalIn: number;      // 0-25 input signal
  readonly signalOut: number;     // 0-25 output signal
  readonly charIn: string;        // Letter representation: input
  readonly charOut: string;       // Letter representation: output
  readonly componentState: ComponentState;
}

/**
 * Identity component state used for INPUT and OUTPUT pseudo-stages.
 * These stages don't transform the signal, but anchor the trace.
 */
export interface IdentityComponentState {
  readonly kind: 'identity';
}

/**
 * Extended ComponentState including identity for INPUT/OUTPUT.
 */
export type ExtendedComponentState =
  | RotorComponentState
  | ReflectorComponentState
  | IdentityComponentState;

/**
 * A single trace step with extended component state support.
 */
export interface ExtendedTraceStep {
  readonly stage: TraceStage;
  readonly signalIn: number;
  readonly signalOut: number;
  readonly charIn: string;
  readonly charOut: string;
  readonly componentState: ExtendedComponentState;
}

/**
 * Full trace for one character.
 * Contains exactly 9 steps: INPUT → 7 transformations → OUTPUT.
 */
export interface SignalTrace {
  /** Character index in the message (0-based) */
  readonly charIndex: number;

  /** Original plaintext character */
  readonly inputChar: string;

  /** Resulting ciphertext character */
  readonly outputChar: string;

  /** Complete chain of steps — exactly 9 elements */
  readonly steps: readonly ExtendedTraceStep[];

  /**
   * Rotor positions AFTER stepping, BEFORE encryption.
   * Needed for visualizing positions at the moment of processing.
   */
  readonly rotorPositionsAtEncryption: readonly number[];
}

/**
 * Full trace for an entire message.
 */
export interface MessageTrace {
  readonly traces: readonly SignalTrace[];
  readonly config: EnigmaConfig;
  readonly timestamp: number;
}
