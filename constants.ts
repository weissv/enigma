
import { RotorSetting } from './types';

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const AVAILABLE_ROTORS_LIST = ['I', 'II', 'III', 'IV', 'V', 'Beta', 'Gamma'] as const;
export type RotorName = typeof AVAILABLE_ROTORS_LIST[number];

export const AVAILABLE_REFLECTORS_LIST = ['B', 'C', 'B Thin', 'C Thin'] as const;
export type ReflectorName = typeof AVAILABLE_REFLECTORS_LIST[number];

export const ROTOR_WIRINGS: Record<RotorName, string> = {
  'I':     'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  'II':    'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  'III':   'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  'IV':    'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  'V':     'VZBRGITYUPSDNHLXAWMJQOFECK',
  'Beta':  'LEYJVCNIXWPBQMDRTAKZGFUHOS',
  'Gamma': 'FSOKANUERHMBTIYCWLQPZXVGJD',
};

// The letter on the ALPHABET RING that, when at the 12 o'clock position (after stepping), causes the next rotor to its left to step.
export const ROTOR_NOTCHES: Record<RotorName, string> = { 
  'I':     'Q', // When Rotor I moves from Q to R, Rotor II steps.
  'II':    'E', // When Rotor II moves from E to F, Rotor III steps.
  'III':   'V', // When Rotor III moves from V to W
  'IV':    'J',
  'V':     'Z',
  'Beta':  '',  // Does not step automatically
  'Gamma': '',  // Does not step automatically
};

export const REFLECTOR_WIRINGS: Record<ReflectorName, string> = {
  'B':      'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  'C':      'FVPJIAOYEDRZXWGCTKUQSBNMHL',
  'B Thin': 'ENKQAUYWJICOPBLMDXZVFTHRGS',
  'C Thin': 'RDOBJNTKVEHMLFCWZAXGYIPSUQ',
};

export const DEFAULT_ROTOR_COUNT = 3;

// Rotor order for array processing and standard Enigma representation (e.g., III-II-I means Left-Middle-Right)
// Our `rotors` array in EnigmaMachine will be [Leftmost, Middle, Rightmost]
export const INITIAL_ROTOR_SETTINGS: RotorSetting[] = [
  { id: 'rotorSlot1', type: 'I', initialPosition: 0, ringSetting: 0 },   // Leftmost
  { id: 'rotorSlot2', type: 'II', initialPosition: 0, ringSetting: 0 },  // Middle
  { id: 'rotorSlot3', type: 'III', initialPosition: 0, ringSetting: 0 }, // Rightmost
];

export const INITIAL_M4_ROTOR_SETTINGS: RotorSetting[] = [
  { id: 'rotorSlot0', type: 'Beta', initialPosition: 0, ringSetting: 0 },// Fourth (Thin)
  { id: 'rotorSlot1', type: 'I', initialPosition: 0, ringSetting: 0 },   // Leftmost
  { id: 'rotorSlot2', type: 'II', initialPosition: 0, ringSetting: 0 },  // Middle
  { id: 'rotorSlot3', type: 'III', initialPosition: 0, ringSetting: 0 }, // Rightmost
];

export const INITIAL_REFLECTOR: ReflectorName = 'B';
export const INITIAL_M4_REFLECTOR: ReflectorName = 'B Thin';

export const charToIndex = (char: string): number => char.toUpperCase().charCodeAt(0) - 65;
export const indexToChar = (index: number): string => String.fromCharCode(index + 65);

// Map string names to AS indices for WASM engine
export const ROTOR_MAP: Record<string, number> = {
  'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'Beta': 5, 'Gamma': 6
};
export const REFLECTOR_MAP: Record<string, number> = {
  'B': 0, 'C': 1, 'B Thin': 2, 'C Thin': 3
};
