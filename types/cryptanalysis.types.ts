/**
 * Cryptanalysis Types — Frequency Analysis, Index of Coincidence, Turing Bombe.
 *
 * Provides the full type system for the cryptanalysis pipeline,
 * from statistical metrics to brute-force attack configuration.
 */

import type { RotorName, ReflectorName } from '../constants';

// ─── Frequency Analysis ───────────────────────────────────────────

/**
 * Frequency data for a single letter.
 */
export interface LetterFrequency {
  readonly letter: string;             // 'A'..'Z'
  readonly count: number;              // Absolute count
  readonly frequency: number;          // Relative frequency (0..1)
  readonly expectedFrequency: number;  // English language reference
  readonly deviation: number;          // |frequency - expectedFrequency|
}

export interface FrequencyAnalysisResult {
  readonly frequencies: readonly LetterFrequency[];
  readonly totalLetters: number;
  readonly mostFrequent: string;
  readonly leastFrequent: string;

  /**
   * Chi-squared statistic measuring deviation from English reference.
   * Lower values = closer to natural language distribution.
   */
  readonly chiSquared: number;
}

// ─── Index of Coincidence ─────────────────────────────────────────

/**
 * Semantic interpretation of IC values.
 *
 * Reference values:
 * - Random text:      IC ≈ 0.038
 * - English language: IC ≈ 0.067
 * - Enigma (no plug): IC ≈ 0.047-0.052
 */
export enum ICInterpretation {
  RANDOM         = 'RANDOM',          // IC < 0.040
  POLYALPHABETIC = 'POLYALPHABETIC',  // 0.040 ≤ IC < 0.055
  WEAK_CIPHER    = 'WEAK_CIPHER',     // 0.055 ≤ IC < 0.062
  MONOALPHABETIC = 'MONOALPHABETIC',  // 0.062 ≤ IC < 0.070
  NATURAL_LANG   = 'NATURAL_LANG',    // IC ≥ 0.070
}

export interface ICResult {
  readonly indexOfCoincidence: number;
  readonly textLength: number;
  readonly interpretation: ICInterpretation;
}

// ─── Turing Bombe ─────────────────────────────────────────────────

export enum BombeStatus {
  IDLE      = 'IDLE',
  RUNNING   = 'RUNNING',
  COMPLETED = 'COMPLETED',
  TIMEOUT   = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  ERROR     = 'ERROR',
}

/**
 * Configuration for a Turing Bombe brute-force attack.
 */
export interface BombeConfig {
  /** Ciphertext to attack */
  readonly ciphertext: string;

  /**
   * Crib — known plaintext fragment.
   * Must be ≥ 3 characters for effective brute-force.
   */
  readonly crib: string;

  /** Position of the crib in the ciphertext (0-indexed) */
  readonly cribPosition: number;

  /** Rotors to try. Default: all permutations of I-V taken 3 at a time. */
  readonly rotorCandidates?: readonly RotorName[];

  /** Reflectors to try. Default: ['B', 'C']. */
  readonly reflectorCandidates?: readonly ReflectorName[];

  /** Ring settings to try (0-25). Default: [0]. Note: Brute-forcing all 26^3 rings is extremely slow. */
  readonly ringCandidates?: readonly number[];

  /** Maximum execution time (ms). Default: 30000. */
  readonly timeoutMs?: number;

  /** Which machine model to attack. Default: 'M3' */
  readonly machineType?: 'M3' | 'M4';
}

/**
 * A single candidate configuration found by the Bombe.
 */
export interface BombeCandidate {
  readonly rotorTypes: readonly RotorName[];
  readonly rotorPositions: readonly number[];   // [L, M, R] initial positions
  readonly ringSettings: readonly number[];     // [L, M, R]
  readonly reflectorType: ReflectorName;
  readonly plugboard: Record<string, string>;   // Found steckerbrett pairs

  /** Decrypted text preview using this configuration */
  readonly decryptedPreview: string;

  /**
   * Plausibility score (0..1) based on IC of decrypted text.
   * Higher = more likely to be correct.
   */
  readonly confidenceScore: number;
}

export interface BombeResult {
  readonly candidates: readonly BombeCandidate[];
  readonly totalConfigurationsTested: number;
  readonly elapsedMs: number;
  readonly status: BombeStatus;
}
