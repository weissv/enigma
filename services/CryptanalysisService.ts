/**
 * Cryptanalysis Service — Statistical Analysis Engine.
 *
 * Pure static methods for frequency analysis and Index of Coincidence.
 * Designed for real-time analysis during typing (incremental updates).
 *
 * All methods are stateless — no side effects.
 */

import { ALPHABET, charToIndex } from '../constants';
import { ENGLISH_LETTER_FREQUENCIES } from '../utils/math';
import type {
  LetterFrequency,
  FrequencyAnalysisResult,
  ICResult,
} from '../types/cryptanalysis.types';
import { ICInterpretation } from '../types/cryptanalysis.types';

export class CryptanalysisService {

  /**
   * Full frequency analysis: letter counts, relative frequencies,
   * comparison with English reference distribution, chi-squared statistic.
   *
   * @param text - Input text (only A-Z characters are counted)
   * @returns FrequencyAnalysisResult
   */
  public static analyzeFrequency(text: string): FrequencyAnalysisResult {
    const counts = new Array(26).fill(0);
    let totalLetters = 0;

    for (const char of text.toUpperCase()) {
      const idx = charToIndex(char);
      if (idx >= 0 && idx < 26) {
        counts[idx]++;
        totalLetters++;
      }
    }

    let maxCount = 0;
    let minCount = Infinity;
    let mostFrequent = 'A';
    let leastFrequent = 'A';
    let chiSquared = 0;

    const frequencies: LetterFrequency[] = ALPHABET.split('').map((letter, i) => {
      const count = counts[i];
      const frequency = totalLetters > 0 ? count / totalLetters : 0;
      const expectedFrequency = ENGLISH_LETTER_FREQUENCIES[letter];
      const deviation = Math.abs(frequency - expectedFrequency);

      // Chi-squared contribution: (observed - expected)² / expected
      if (totalLetters > 0) {
        const expected = expectedFrequency * totalLetters;
        if (expected > 0) {
          chiSquared += Math.pow(count - expected, 2) / expected;
        }
      }

      if (count > maxCount) {
        maxCount = count;
        mostFrequent = letter;
      }
      if (count < minCount) {
        minCount = count;
        leastFrequent = letter;
      }

      return { letter, count, frequency, expectedFrequency, deviation };
    });

    return {
      frequencies,
      totalLetters,
      mostFrequent,
      leastFrequent,
      chiSquared,
    };
  }

  /**
   * Index of Coincidence calculation.
   *
   * IC = Σ(n_i * (n_i - 1)) / (N * (N - 1))
   *
   * where n_i = count of letter i, N = total letters.
   *
   * Reference values:
   * - Random text:      IC ≈ 0.038
   * - English language: IC ≈ 0.067
   * - Enigma output:    IC ≈ 0.047-0.052
   *
   * @param text - Input text (only A-Z characters are counted)
   */
  public static calculateIC(text: string): ICResult {
    const counts = new Array(26).fill(0);
    let totalLetters = 0;

    for (const char of text.toUpperCase()) {
      const idx = charToIndex(char);
      if (idx >= 0 && idx < 26) {
        counts[idx]++;
        totalLetters++;
      }
    }

    let ic = 0;
    if (totalLetters > 1) {
      let numerator = 0;
      for (let i = 0; i < 26; i++) {
        numerator += counts[i] * (counts[i] - 1);
      }
      ic = numerator / (totalLetters * (totalLetters - 1));
    }

    return {
      indexOfCoincidence: ic,
      textLength: totalLetters,
      interpretation: CryptanalysisService.interpretIC(ic, totalLetters),
    };
  }

  /**
   * Incremental frequency update when a single character is added.
   * Avoids full recount for real-time typing scenarios.
   *
   * @param previous - Previous analysis result
   * @param newChar  - The newly added character
   */
  public static updateFrequencyIncremental(
    previous: FrequencyAnalysisResult,
    newChar: string,
  ): FrequencyAnalysisResult {
    const char = newChar.toUpperCase();
    const idx = charToIndex(char);

    // Non-alphabetic character — no change
    if (idx < 0 || idx >= 26) return previous;

    const totalLetters = previous.totalLetters + 1;
    let maxCount = 0;
    let minCount = Infinity;
    let mostFrequent = 'A';
    let leastFrequent = 'A';
    let chiSquared = 0;

    const frequencies: LetterFrequency[] = previous.frequencies.map((lf, i) => {
      const count = i === idx ? lf.count + 1 : lf.count;
      const frequency = count / totalLetters;
      const expectedFrequency = lf.expectedFrequency;
      const deviation = Math.abs(frequency - expectedFrequency);

      const expected = expectedFrequency * totalLetters;
      if (expected > 0) {
        chiSquared += Math.pow(count - expected, 2) / expected;
      }

      if (count > maxCount) { maxCount = count; mostFrequent = lf.letter; }
      if (count < minCount) { minCount = count; leastFrequent = lf.letter; }

      return { letter: lf.letter, count, frequency, expectedFrequency, deviation };
    });

    return {
      frequencies,
      totalLetters,
      mostFrequent,
      leastFrequent,
      chiSquared,
    };
  }

  /**
   * Interprets an IC value into a semantic category.
   */
  private static interpretIC(ic: number, textLength: number): ICInterpretation {
    // Not enough data to interpret
    if (textLength < 10) return ICInterpretation.RANDOM;

    if (ic < 0.040) return ICInterpretation.RANDOM;
    if (ic < 0.055) return ICInterpretation.POLYALPHABETIC;
    if (ic < 0.062) return ICInterpretation.WEAK_CIPHER;
    if (ic < 0.070) return ICInterpretation.MONOALPHABETIC;
    return ICInterpretation.NATURAL_LANG;
  }
}
