
import { ALPHABET, charToIndex, indexToChar, ReflectorName } from '../constants';
import { RotorSetting } from '../types';
import { Rotor } from './Rotor';
import { Reflector } from './Reflector';

export class EnigmaMachine {
  private rotors: Rotor[]; // Order: [Leftmost, Middle, Rightmost] for a 3-rotor setup
  private reflector: Reflector;

  constructor(rotorSettings: RotorSetting[], reflectorType: ReflectorName) {
    this.rotors = rotorSettings.map(rs => new Rotor(rs));
    this.reflector = new Reflector(reflectorType);
  }

  // Implements M3 Enigma stepping for 3 rotors.
  // This method is called *before* each character is processed.
  private stepRotors(): void {
    if (this.rotors.length !== 3) {
        if (this.rotors.length > 0) {
             this.rotors[this.rotors.length - 1].step();
        }
        return;
    }

    const rL = this.rotors[0]; // Leftmost
    const rM = this.rotors[1]; // Middle
    const rR = this.rotors[2]; // Rightmost

    const middleRotorAtNotch = rM.isAtNotch();
    const rightRotorAtNotch = rR.isAtNotch();

    if (middleRotorAtNotch) {
        rL.step();
        rM.step();
    } else if (rightRotorAtNotch) {
        rM.step();
    }
    rR.step();
  }

  public processCharacter(char: string): string {
    const charUpper = char.toUpperCase();
    if (ALPHABET.indexOf(charUpper) === -1) {
      return char; // Pass through non-alphabetic characters
    }

    this.stepRotors();

    let signal = charToIndex(charUpper);

    // Forward pass: Rightmost rotor through Leftmost rotor
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      signal = this.rotors[i].forward(signal);
    }

    // Reflector
    signal = this.reflector.reflect(signal);

    // Backward pass: Leftmost rotor through Rightmost rotor
    for (let i = 0; i < this.rotors.length; i++) {
      signal = this.rotors[i].backward(signal);
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
