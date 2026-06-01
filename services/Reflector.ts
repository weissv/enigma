import { REFLECTOR_WIRINGS, ReflectorName, charToIndex } from '../constants';

export class Reflector {
  public readonly type: ReflectorName;
  private wiring: string[];

  constructor(type: ReflectorName) {
    this.type = type;
    this.wiring = REFLECTOR_WIRINGS[type].split('');
  }

  public reflect(signal: number): number {
    return charToIndex(this.wiring[signal]);
  }
}
