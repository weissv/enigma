
import { ALPHABET, ROTOR_WIRINGS, ROTOR_NOTCHES, REFLECTOR_WIRINGS, charToIndex, indexToChar, RotorName, ReflectorName } from '../constants';
import { RotorSetting } from '../types';

interface RotorInternalState {
  type: RotorName;
  wiring: string[];
  inverseWiring: string[];
  notchIndex: number;
  position: number;
  ringSetting: number;
}

function createInverseWiring(wiring: string): string[] {
  const inverse = new Array(ALPHABET.length).fill('');
  for (let i = 0; i < ALPHABET.length; i++) {
    inverse[charToIndex(wiring[i])] = indexToChar(i);
  }
  return inverse;
}

export class EnigmaMachine {
  private rotors: RotorInternalState[]; // Order: [Leftmost, Middle, Rightmost] for a 3-rotor setup
  private reflectorWiring: string[];

  constructor(rotorSettings: RotorSetting[], reflectorType: ReflectorName) {
    // Expects rotorSettings in [Leftmost, Middle, Rightmost] order
    this.rotors = rotorSettings.map(rs => {
      const wiringStr = ROTOR_WIRINGS[rs.type];
      return {
        type: rs.type,
        wiring: wiringStr.split(''),
        inverseWiring: createInverseWiring(wiringStr),
        notchIndex: charToIndex(ROTOR_NOTCHES[rs.type]),
        position: rs.initialPosition,
        ringSetting: rs.ringSetting,
      };
    });
    this.reflectorWiring = REFLECTOR_WIRINGS[reflectorType].split('');
  }

  // Implements M3 Enigma stepping for 3 rotors.
  // This method is called *before* each character is processed.
  private stepRotors(): void {
    // This stepping logic is specifically for a 3-rotor Enigma (e.g., Enigma I, M3)
    if (this.rotors.length !== 3) {
        // Fallback for non-3 rotors: step the rightmost one if it exists.
        if (this.rotors.length > 0) {
             const rR_fallback = this.rotors[this.rotors.length - 1];
             rR_fallback.position = (rR_fallback.position + 1) % 26;
        }
        return;
    }

    const rL = this.rotors[0]; // Leftmost
    const rM = this.rotors[1]; // Middle
    const rR = this.rotors[2]; // Rightmost

    // Determine if rotors are at their notch positions *before* any movement for this key press.
    const middleRotorAtNotch = rM.position === rM.notchIndex;
    const rightRotorAtNotch = rR.position === rR.notchIndex;

    // 1. Right rotor (rR) always advances by one step.
    // (This happens first, and then its new position is considered for turnover effects)
    // Correction: Turnover conditions checked, THEN rotors advance.
    // Stepping in Enigma is:
    // - Rightmost rotor always advances.
    // - If the rightmost rotor *passes* its notch, the middle rotor advances.
    // - If the middle rotor *passes* its notch, the leftmost rotor advances.
    // - "Double Step Anomaly": If the middle rotor advances, AND it was already at its notch position,
    //   then the leftmost rotor also advances. This means the middle rotor effectively makes two rotors step.

    // Simpler model usually implemented (and works):
    // Check notches *before* movement.
    // If rM is at notch: rL advances, rM advances.
    // Else if rR is at notch: rM advances.
    // Always: rR advances.
    // The order of these is important for the double step.

    if (middleRotorAtNotch) {
        // Middle rotor is at its notch: Left rotor (rL) and Middle rotor (rM) both advance.
        rL.position = (rL.position + 1) % 26;
        rM.position = (rM.position + 1) % 26;
    } else if (rightRotorAtNotch) {
        // Right rotor is at its notch (but middle isn't): Middle rotor (rM) advances.
        rM.position = (rM.position + 1) % 26;
    }
    // Rightmost rotor (rR) always advances.
    rR.position = (rR.position + 1) % 26;
  }

  public processCharacter(char: string): string {
    const charUpper = char.toUpperCase();
    if (ALPHABET.indexOf(charUpper) === -1) {
      return char; // Pass through non-alphabetic characters
    }

    this.stepRotors(); // Rotors step *before* the character is encrypted

    let signal = charToIndex(charUpper);

    // Forward pass: Rightmost rotor through Leftmost rotor
    // Rotor array indices: 0=Left, 1=Middle, 2=Right. So loop is 2 down to 0.
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      const rotor = this.rotors[i];
      signal = (signal + rotor.position - rotor.ringSetting + 26) % 26; // Account for current rotation and ring setting
      signal = charToIndex(rotor.wiring[signal]);                     // Pass through wiring
      signal = (signal - rotor.position + rotor.ringSetting + 26) % 26; // Inverse of initial adjustment
    }

    // Reflector
    signal = charToIndex(this.reflectorWiring[signal]);

    // Backward pass: Leftmost rotor through Rightmost rotor
    // Loop is 0 up to 2.
    for (let i = 0; i < this.rotors.length; i++) {
      const rotor = this.rotors[i];
      signal = (signal + rotor.position - rotor.ringSetting + 26) % 26; // Account for current rotation and ring setting
      signal = charToIndex(rotor.inverseWiring[signal]);              // Pass through inverse wiring
      signal = (signal - rotor.position + rotor.ringSetting + 26) % 26; // Inverse of initial adjustment
    }

    return indexToChar(signal);
  }

  public processString(text: string): string {
    let result = "";
    for (const char of text) {
      result += this.processCharacter(char);
    }
    return result;
  }
}
