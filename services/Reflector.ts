import { REFLECTOR_WIRINGS, ReflectorName, charToIndex } from '../constants';

export class Reflector {
  private wiring: string[];

  constructor(type: ReflectorName) {
    this.wiring = REFLECTOR_WIRINGS[type].split('');
  }

  public reflect(signal: number): number {
    return charToIndex(this.wiring[signal]);
  }
}
