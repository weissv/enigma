// assembly/index.ts

const WIRING_I: u8[] = [4, 10, 12, 5, 11, 6, 3, 16, 21, 25, 13, 19, 14, 22, 24, 7, 23, 20, 18, 15, 0, 8, 1, 17, 2, 9];
const WIRING_II: u8[] = [0, 9, 3, 10, 18, 8, 17, 20, 23, 1, 11, 7, 22, 19, 12, 2, 16, 6, 25, 13, 15, 24, 5, 21, 14, 4];
const WIRING_III: u8[] = [1, 3, 5, 7, 9, 11, 2, 15, 17, 19, 23, 21, 25, 13, 24, 4, 8, 22, 6, 0, 10, 12, 20, 18, 16, 14];
const WIRING_IV: u8[] = [4, 18, 14, 21, 15, 25, 9, 0, 24, 16, 20, 8, 17, 7, 23, 11, 13, 5, 19, 6, 10, 3, 2, 12, 22, 1];
const WIRING_V: u8[] = [21, 25, 1, 17, 6, 8, 19, 24, 20, 15, 18, 3, 13, 7, 11, 23, 0, 22, 12, 9, 16, 14, 5, 4, 2, 10];
const WIRING_BETA: u8[] = [11, 4, 24, 9, 21, 2, 13, 8, 23, 22, 15, 1, 16, 12, 3, 17, 19, 0, 10, 25, 6, 5, 20, 7, 14, 18];
const WIRING_GAMMA: u8[] = [5, 18, 14, 10, 0, 13, 20, 4, 17, 7, 12, 1, 19, 8, 24, 2, 22, 11, 16, 15, 25, 23, 21, 6, 9, 3];

const REFLECTOR_B: u8[] = [24, 17, 20, 7, 16, 18, 11, 3, 15, 23, 13, 6, 14, 10, 12, 8, 4, 1, 5, 25, 2, 22, 21, 9, 0, 19];
const REFLECTOR_C: u8[] = [5, 21, 15, 9, 8, 0, 14, 24, 4, 3, 17, 25, 23, 22, 6, 2, 19, 10, 20, 16, 18, 1, 13, 12, 7, 11];
const REFLECTOR_B_THIN: u8[] = [4, 13, 10, 16, 0, 20, 24, 22, 9, 8, 2, 14, 15, 1, 11, 12, 3, 23, 25, 21, 5, 19, 7, 17, 6, 18];
const REFLECTOR_C_THIN: u8[] = [17, 3, 14, 1, 9, 13, 19, 10, 21, 4, 7, 12, 11, 5, 2, 22, 25, 0, 23, 6, 24, 8, 15, 18, 20, 16];

const NOTCH_I: i32 = 16;
const NOTCH_II: i32 = 4;
const NOTCH_III: i32 = 21;
const NOTCH_IV: i32 = 9;
const NOTCH_V: i32 = 25;
const NOTCH_BETA: i32 = -1;
const NOTCH_GAMMA: i32 = -1;

const ALL_WIRINGS: u8[][] = [
  WIRING_I, WIRING_II, WIRING_III, WIRING_IV, WIRING_V, WIRING_BETA, WIRING_GAMMA
];

const ALL_NOTCHES: i32[] = [
  NOTCH_I, NOTCH_II, NOTCH_III, NOTCH_IV, NOTCH_V, NOTCH_BETA, NOTCH_GAMMA
];

const ALL_REFLECTORS: u8[][] = [
  REFLECTOR_B, REFLECTOR_C, REFLECTOR_B_THIN, REFLECTOR_C_THIN
];

function createInverse(wiring: u8[]): u8[] {
  let inv = new Array<u8>(26);
  for (let i = 0; i < 26; i++) {
    inv[wiring[i]] = i as u8;
  }
  return inv;
}

let INVERSE_WIRINGS: u8[][] = new Array<u8[]>(7);
for (let i = 0; i < 7; i++) {
  INVERSE_WIRINGS[i] = createInverse(ALL_WIRINGS[i]);
}

// -----------------------------------------------------

// Ciphertext buffer (shared memory)
export const MAX_TEXT_LEN = 10000;
export const ciphertextBuffer = new Uint8Array(MAX_TEXT_LEN);
let currentTextLength = 0;

export function setCiphertextLength(len: i32): void {
  currentTextLength = len;
}

// Plugboard (shared memory)
export const plugboard = new Uint8Array(26);
export const bestPlugboard = new Uint8Array(26);

export function resetPlugboard(): void {
  for (let i = 0; i < 26; i++) {
    plugboard[i] = i as u8;
    bestPlugboard[i] = i as u8;
  }
}

// Rotor state
let rotorCount: i32 = 3;
let rotorIndices = new Int32Array(4);
let rotorPositions = new Int32Array(4);
let initialPositions = new Int32Array(4);
let rotorRings = new Int32Array(4);
let currentReflector = 0;

export function configureMachine(
  isM4: boolean,
  r0: i32, r1: i32, r2: i32, r3: i32,
  p0: i32, p1: i32, p2: i32, p3: i32,
  ring0: i32, ring1: i32, ring2: i32, ring3: i32,
  refIndex: i32
): void {
  rotorCount = isM4 ? 4 : 3;
  rotorIndices[0] = r0; rotorIndices[1] = r1; rotorIndices[2] = r2; rotorIndices[3] = r3;
  rotorPositions[0] = p0; rotorPositions[1] = p1; rotorPositions[2] = p2; rotorPositions[3] = p3;
  initialPositions[0] = p0; initialPositions[1] = p1; initialPositions[2] = p2; initialPositions[3] = p3;
  rotorRings[0] = ring0; rotorRings[1] = ring1; rotorRings[2] = ring2; rotorRings[3] = ring3;
  currentReflector = refIndex;
}

function resetPositions(): void {
  for (let i = 0; i < 4; i++) {
    rotorPositions[i] = initialPositions[i];
  }
}

function step(): void {
  if (rotorCount === 3) {
    let midAtNotch = rotorPositions[1] === ALL_NOTCHES[rotorIndices[1]];
    let rightAtNotch = rotorPositions[2] === ALL_NOTCHES[rotorIndices[2]];

    if (midAtNotch) {
      rotorPositions[0] = (rotorPositions[0] + 1) % 26;
      rotorPositions[1] = (rotorPositions[1] + 1) % 26;
    } else if (rightAtNotch) {
      rotorPositions[1] = (rotorPositions[1] + 1) % 26;
    }
    rotorPositions[2] = (rotorPositions[2] + 1) % 26;
  } else {
    // M4 - Leftmost (index 0) does not step
    let midAtNotch = rotorPositions[2] === ALL_NOTCHES[rotorIndices[2]];
    let rightAtNotch = rotorPositions[3] === ALL_NOTCHES[rotorIndices[3]];

    if (midAtNotch) {
      rotorPositions[1] = (rotorPositions[1] + 1) % 26;
      rotorPositions[2] = (rotorPositions[2] + 1) % 26;
    } else if (rightAtNotch) {
      rotorPositions[2] = (rotorPositions[2] + 1) % 26;
    }
    rotorPositions[3] = (rotorPositions[3] + 1) % 26;
  }
}

function encryptChar(signal: i32): i32 {
  // Plugboard FWD
  signal = plugboard[signal];

  // Forward pass
  for (let i = rotorCount - 1; i >= 0; i--) {
    let rIdx = rotorIndices[i];
    let offset = (rotorPositions[i] - rotorRings[i] + 26) % 26;
    let input = (signal + offset) % 26;
    signal = (ALL_WIRINGS[rIdx][input] - offset + 26) % 26;
  }

  // Reflector
  signal = ALL_REFLECTORS[currentReflector][signal];

  // Backward pass
  for (let i = 0; i < rotorCount; i++) {
    let rIdx = rotorIndices[i];
    let offset = (rotorPositions[i] - rotorRings[i] + 26) % 26;
    let input = (signal + offset) % 26;
    signal = (INVERSE_WIRINGS[rIdx][input] - offset + 26) % 26;
  }

  // Plugboard INV
  signal = plugboard[signal];
  
  return signal;
}

// Memory array for frequency counting
let freqs = new Int32Array(26);

// Encrypt current buffer and return IC (multiplied by 1000000 for integer return, or return f32)
export function evaluateIC(): f32 {
  resetPositions();
  
  for (let i = 0; i < 26; i++) {
    freqs[i] = 0;
  }

  for (let i = 0; i < currentTextLength; i++) {
    step();
    let charVal = ciphertextBuffer[i];
    if (charVal >= 0 && charVal < 26) {
      let enc = encryptChar(charVal);
      freqs[enc]++;
    }
  }

  let total: f32 = currentTextLength as f32;
  if (total < 2.0) return 0.0;

  let sum: f32 = 0.0;
  for (let i = 0; i < 26; i++) {
    let c = freqs[i] as f32;
    sum += c * (c - 1.0);
  }

  return sum / (total * (total - 1.0));
}

export function hillClimb(iterations: i32): f32 {
  let bestIc: f32 = evaluateIC();
  
  for (let i = 0; i < 26; i++) {
    bestPlugboard[i] = plugboard[i];
  }

  for (let i = 0; i < iterations; i++) {
    // Generate two random indices 0-25
    let a = (Math.random() * 26.0) as i32;
    let b = (Math.random() * 26.0) as i32;

    if (a !== b) {
      let targetA = plugboard[a];
      let targetB = plugboard[b];
      
      plugboard[a] = targetB;
      plugboard[targetB] = a;
      plugboard[b] = targetA;
      plugboard[targetA] = b;
    }

    let ic = evaluateIC();

    if (ic >= bestIc) {
      bestIc = ic;
      for (let j = 0; j < 26; j++) {
        bestPlugboard[j] = plugboard[j];
      }
    } else {
      // Revert
      for (let j = 0; j < 26; j++) {
        plugboard[j] = bestPlugboard[j];
      }
    }
  }

  return bestIc;
}
