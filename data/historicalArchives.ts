import type { EnigmaConfig } from '../types/enigma.types';
import { ReflectorName } from '../constants';

export interface HistoricalMission {
  id: string;
  name: string;
  date: string;
  context: string;
  plaintext: string;
  crib: string;
  cribPosition: number;
  config: EnigmaConfig;
}

export const ARCHIVES: HistoricalMission[] = [
  {
    id: 'u-571',
    name: 'U-571 Intercept (Operation Ruthless)',
    date: '1942-05-09',
    context: 'We intercepted a transmission from U-571. Intelligence suggests the daily weather report starts at position 0.',
    plaintext: 'WETTERBERICHTNURZURZURUECKHALTUNGDERUBOOTWAFFEXXKEINEWEITERENNACHRICHTENXXHEILHITLER',
    crib: 'WETTERBERICHT',
    cribPosition: 0,
    config: {
      rotors: [
        { id: 'pos1', type: 'I', initialPosition: 0, ringSetting: 0 },
        { id: 'pos2', type: 'IV', initialPosition: 5, ringSetting: 0 },
        { id: 'pos3', type: 'III', initialPosition: 12, ringSetting: 0 },
      ],
      reflector: 'B' as ReflectorName,
      plugboard: {
        'A': 'Z',
        'Z': 'A',
        'B': 'Y',
        'Y': 'B',
        'C': 'X',
        'X': 'C'
      }
    }
  },
  {
    id: 'scharnhorst',
    name: 'Scharnhorst Final Transmission',
    date: '1943-12-26',
    context: 'The battleship Scharnhorst is trapped. Bletchley Park expects the message to contain "SCHA" somewhere near the start.',
    plaintext: 'SCHARNHORSTIMGEFECHTMITSCHWERENFEINDLICHENSTREITKRAEFTENXXWIRKAEMPFENBISZURLETZTENGRANATE',
    crib: 'SCHARNHORST',
    cribPosition: 0,
    config: {
      rotors: [
        { id: 'pos1', type: 'II', initialPosition: 14, ringSetting: 0 },
        { id: 'pos2', type: 'I', initialPosition: 2, ringSetting: 0 },
        { id: 'pos3', type: 'V', initialPosition: 21, ringSetting: 0 },
      ],
      reflector: 'C' as ReflectorName,
      plugboard: {
        'Q': 'W', 'W': 'Q',
        'E': 'R', 'R': 'E',
        'T': 'Z', 'Z': 'T',
        'U': 'I', 'I': 'U',
      }
    }
  }
];
