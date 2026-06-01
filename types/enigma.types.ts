/**
 * Core Enigma machine type definitions.
 * Migrated from root types.ts — canonical source of truth.
 */

import { RotorName, ReflectorName } from '../constants';

export interface RotorSetting {
  id: string;               // e.g. "rotorSlot1", "rotorSlot2", "rotorSlot3"
  type: RotorName;
  initialPosition: number;  // 0-25, for 'A' through 'Z'
  ringSetting: number;      // 0-25, for 'A' through 'Z'
}

export type PlugboardConfig = Record<string, string>;

export interface EnigmaConfig {
  rotors: RotorSetting[];
  reflector: ReflectorName;
  plugboard: PlugboardConfig;
}
