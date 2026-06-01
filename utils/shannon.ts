/**
 * Shannon Entropy Calculations
 * 
 * Used for cryptanalysis heatmaps. Entropy approaches 4.70 for random 26-char text.
 * Drops significantly when rotors hit a polyalphabetic/monoalphabetic or plaintext state.
 */

import { charToIndex } from '../constants';

/**
 * Calculates Shannon entropy for a given text.
 * H = - sum(p * log2(p))
 */
export function calculateShannonEntropy(text: string): number {
  if (text.length === 0) return 0;
  
  const counts = new Array(26).fill(0);
  let validChars = 0;
  
  for (const char of text.toUpperCase()) {
    const idx = charToIndex(char);
    if (idx >= 0 && idx < 26) {
      counts[idx]++;
      validChars++;
    }
  }
  
  if (validChars === 0) return 0;
  
  let entropy = 0;
  for (let i = 0; i < 26; i++) {
    if (counts[i] > 0) {
      const p = counts[i] / validChars;
      entropy -= p * Math.log2(p);
    }
  }
  
  return entropy;
}

/**
 * Generates an array of entropy values over sliding windows.
 */
export function generateEntropyHeatmap(text: string, windowSize: number = 20, step: number = 5): number[] {
  const result: number[] = [];
  
  // Clean text first
  let cleanText = '';
  for (const char of text.toUpperCase()) {
    if (charToIndex(char) >= 0) cleanText += char;
  }
  
  if (cleanText.length < windowSize) {
    result.push(calculateShannonEntropy(cleanText));
    return result;
  }
  
  for (let i = 0; i <= cleanText.length - windowSize; i += step) {
    const window = cleanText.substring(i, i + windowSize);
    result.push(calculateShannonEntropy(window));
  }
  
  // Always include the very end if it wasn't hit perfectly
  const lastStart = cleanText.length - windowSize;
  if ((cleanText.length - windowSize) % step !== 0) {
    const window = cleanText.substring(lastStart, cleanText.length);
    result.push(calculateShannonEntropy(window));
  }
  
  return result;
}
