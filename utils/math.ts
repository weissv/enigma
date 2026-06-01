/**
 * Mathematical utilities for cryptanalysis.
 * Pure functions — no side effects.
 */

/**
 * Modulo 26 that always returns positive values.
 */
export const mod26 = (n: number): number => ((n % 26) + 26) % 26;

/**
 * Standard English letter frequency distribution.
 * Source: Robert Lewand, "Cryptological Mathematics" (2000).
 * Values are relative frequencies (sum ≈ 1.0).
 */
export const ENGLISH_LETTER_FREQUENCIES: Readonly<Record<string, number>> = {
  A: 0.08167, B: 0.01492, C: 0.02782, D: 0.04253, E: 0.12702,
  F: 0.02228, G: 0.02015, H: 0.06094, I: 0.06966, J: 0.00153,
  K: 0.00772, L: 0.04025, M: 0.02406, N: 0.06749, O: 0.07507,
  P: 0.01929, Q: 0.00095, R: 0.05987, S: 0.06327, T: 0.09056,
  U: 0.02758, V: 0.00978, W: 0.02360, X: 0.00150, Y: 0.01974,
  Z: 0.00074,
};

/**
 * Expected IC value for English text.
 * IC = Σ p_i² ≈ 0.0667
 */
export const ENGLISH_IC = 0.0667;

/**
 * Expected IC for random (uniformly distributed) text.
 * IC = 1/26 ≈ 0.0385
 */
export const RANDOM_IC = 1 / 26;

/**
 * Generates all k-permutations of an array.
 * Used by Bombe to enumerate rotor order combinations.
 *
 * @param arr - Source array
 * @param k - Permutation length
 * @returns Array of k-length tuples (permutations without repetition)
 */
export function permutations<T>(arr: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];

  const result: T[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const subPerms = permutations(rest, k - 1);
    for (const perm of subPerms) {
      result.push([arr[i], ...perm]);
    }
  }

  return result;
}

/**
 * Clamps a value between min and max inclusive.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
