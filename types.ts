
import { RotorName, ReflectorName } from './constants';

export interface RotorSetting {
  id: string; // e.g. "rotorSlot1", "rotorSlot2", "rotorSlot3"
  type: RotorName;
  initialPosition: number; // 0-25, for 'A' through 'Z'
  ringSetting: number;     // 0-25, for 'A' through 'Z'
}

// Representing the settings for the entire machine
export interface EnigmaConfig {
  rotors: RotorSetting[];
  reflector: ReflectorName;
}
