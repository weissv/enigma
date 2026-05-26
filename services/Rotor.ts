import { ALPHABET, charToIndex, indexToChar, RotorName, ROTOR_WIRINGS, ROTOR_NOTCHES } from '../constants';
import { RotorSetting } from '../types';

export class Rotor {
  public type: RotorName;
  private wiring: string[];
  private inverseWiring: string[];
  private notchIndex: number;
  public position: number;
  public ringSetting: number;

  constructor(setting: RotorSetting) {
    this.type = setting.type;
    const wiringStr = ROTOR_WIRINGS[setting.type];
    this.wiring = wiringStr.split('');
    this.inverseWiring = this.createInverseWiring(wiringStr);
    this.notchIndex = charToIndex(ROTOR_NOTCHES[setting.type]);
    this.position = setting.initialPosition;
    this.ringSetting = setting.ringSetting;
  }

  private createInverseWiring(wiring: string): string[] {
    const inverse = new Array(ALPHABET.length).fill('');
    for (let i = 0; i < ALPHABET.length; i++) {
      inverse[charToIndex(wiring[i])] = indexToChar(i);
    }
    return inverse;
  }

  public isAtNotch(): boolean {
    return this.position === this.notchIndex;
  }

  public step(): void {
    this.position = (this.position + 1) % 26;
  }

  public forward(signal: number): number {
    const offset = (this.position - this.ringSetting + 26) % 26;
    let input = (signal + offset) % 26;
    let output = charToIndex(this.wiring[input]);
    return (output - offset + 26) % 26;
  }

  public backward(signal: number): number {
    const offset = (this.position - this.ringSetting + 26) % 26;
    let input = (signal + offset) % 26;
    let output = charToIndex(this.inverseWiring[input]);
    return (output - offset + 26) % 26;
  }
}
