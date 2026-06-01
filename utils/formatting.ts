/**
 * Formatting utilities for the Enigma Cryptanalysis Platform.
 * Used across UI components for consistent data display.
 */

/**
 * Formats a number to fixed decimal places with trailing zeros.
 */
export const toFixed = (n: number, decimals: number = 4): string =>
  n.toFixed(decimals);

/**
 * Formats a percentage (0..1) to a display string like "12.34%".
 */
export const toPercent = (n: number, decimals: number = 2): string =>
  `${(n * 100).toFixed(decimals)}%`;

/**
 * Formats a 0-25 index as an uppercase letter.
 */
export const indexToLetter = (i: number): string =>
  String.fromCharCode(65 + (((i % 26) + 26) % 26));

/**
 * Formats a duration in milliseconds to a human-readable string.
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
};

/**
 * Formats a large number with comma separators.
 */
export const formatNumber = (n: number): string =>
  n.toLocaleString('en-US');

/**
 * Pads a number to a fixed width with leading zeros.
 */
export const zeroPad = (n: number, width: number = 2): string =>
  String(n).padStart(width, '0');

/**
 * Groups a string into chunks of specified size (e.g., "ABCDEF" → "ABC DEF").
 */
export const groupString = (str: string, size: number = 5): string =>
  str.match(new RegExp(`.{1,${size}}`, 'g'))?.join(' ') ?? str;
