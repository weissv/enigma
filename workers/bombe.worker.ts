/**
 * Turing Bombe Web Worker — Brute-Force Engine.
 *
 * Runs in a separate thread. Enumerates rotor configurations
 * and tests each against a known crib to find matching settings.
 *
 * MVP Scope:
 * - Ring settings fixed at (0, 0, 0)
 * - Enumerates all 3-permutations of available rotors
 * - Tests all 26³ = 17,576 initial positions per rotor permutation
 * - Reports progress every 1,000 configurations
 *
 * Communication via BombeWorkerMessage / BombeWorkerResponse protocol.
 */

import {
  charToIndex,
  indexToChar,
  ROTOR_WIRINGS,
  ROTOR_NOTCHES,
  REFLECTOR_WIRINGS,
  AVAILABLE_ROTORS_LIST,
  AVAILABLE_REFLECTORS_LIST,
} from '../constants';
import type { RotorName, ReflectorName } from '../constants';
import type { BombeConfig, BombeCandidate } from '../types/cryptanalysis.types';
import type { BombeWorkerMessage, BombeWorkerResponse } from '../types/worker.types';
import { permutations } from '../utils/math';

// ─── Lightweight Enigma for worker context ────────────────────────
// We can't import class instances (Rotor/Reflector) due to module isolation,
// so we inline a minimal encryption function here.

function createWiring(rotorName: RotorName): number[] {
  const wStr = ROTOR_WIRINGS[rotorName];
  return wStr.split('').map(c => charToIndex(c));
}

function createInverseWiring(rotorName: RotorName): number[] {
  const wStr = ROTOR_WIRINGS[rotorName];
  const inv = new Array(26).fill(0);
  for (let i = 0; i < 26; i++) {
    inv[charToIndex(wStr[i])] = i;
  }
  return inv;
}

function createReflectorWiring(refName: ReflectorName): number[] {
  return REFLECTOR_WIRINGS[refName].split('').map(c => charToIndex(c));
}

function getNotchIndex(rotorName: RotorName): number {
  return charToIndex(ROTOR_NOTCHES[rotorName]);
}

interface MiniRotorState {
  wiring: number[];
  inverse: number[];
  notch: number;
  position: number;
  ring: number;
}

function encryptChar(
  signal: number,
  rotors: MiniRotorState[], // [L, M, R]
  reflector: number[],
): number {
  // Forward: R → M → L
  for (let i = rotors.length - 1; i >= 0; i--) {
    const r = rotors[i];
    const offset = ((r.position - r.ring) + 26) % 26;
    const input = (signal + offset) % 26;
    signal = (r.wiring[input] - offset + 26) % 26;
  }

  // Reflector
  signal = reflector[signal];

  // Backward: L → M → R
  for (let i = 0; i < rotors.length; i++) {
    const r = rotors[i];
    const offset = ((r.position - r.ring) + 26) % 26;
    const input = (signal + offset) % 26;
    signal = (r.inverse[input] - offset + 26) % 26;
  }

  return signal;
}

function stepRotors(rotors: MiniRotorState[]): void {
  if (rotors.length !== 3) {
    if (rotors.length > 0) {
      rotors[rotors.length - 1].position = (rotors[rotors.length - 1].position + 1) % 26;
    }
    return;
  }

  const [rL, rM, rR] = rotors;
  const midAtNotch = rM.position === rM.notch;
  const rightAtNotch = rR.position === rR.notch;

  if (midAtNotch) {
    rL.position = (rL.position + 1) % 26;
    rM.position = (rM.position + 1) % 26;
  } else if (rightAtNotch) {
    rM.position = (rM.position + 1) % 26;
  }
  rR.position = (rR.position + 1) % 26;
}

function encryptString(
  text: string,
  rotorNames: readonly RotorName[],
  positions: readonly number[],
  ringSettings: readonly number[],
  reflectorName: ReflectorName,
): string {
  const rotors: MiniRotorState[] = rotorNames.map((name, i) => ({
    wiring: createWiring(name),
    inverse: createInverseWiring(name),
    notch: getNotchIndex(name),
    position: positions[i],
    ring: ringSettings[i],
  }));
  const reflector = createReflectorWiring(reflectorName);

  let result = '';
  for (const char of text.toUpperCase()) {
    const idx = charToIndex(char);
    if (idx < 0 || idx >= 26) continue;
    stepRotors(rotors);
    result += indexToChar(encryptChar(idx, rotors, reflector));
  }
  return result;
}

/**
 * Calculates a quick IC for confidence scoring.
 */
function quickIC(text: string): number {
  const counts = new Array(26).fill(0);
  let total = 0;
  for (const c of text) {
    const idx = charToIndex(c);
    if (idx >= 0 && idx < 26) { counts[idx]++; total++; }
  }
  if (total < 2) return 0;
  let sum = 0;
  for (let i = 0; i < 26; i++) sum += counts[i] * (counts[i] - 1);
  return sum / (total * (total - 1));
}

// ─── Worker Message Handler ───────────────────────────────────────

let cancelled = false;

function postMsg(msg: BombeWorkerResponse): void {
  self.postMessage(msg);
}

self.onmessage = (event: MessageEvent<BombeWorkerMessage>) => {
  const msg = event.data;

  if (msg.type === 'CANCEL') {
    cancelled = true;
    return;
  }

  if (msg.type === 'START') {
    cancelled = false;
    runBombe(msg.config);
  }
};

function runBombe(config: BombeConfig): void {
  const startTime = performance.now();

  postMsg({ type: 'STATUS_CHANGE', status: 'RUNNING' as any });

  const rotorPool = config.rotorCandidates ?? [...AVAILABLE_ROTORS_LIST];
  const reflectors = config.reflectorCandidates ?? [...AVAILABLE_REFLECTORS_LIST];
  const timeoutMs = config.timeoutMs ?? 30000;
  const ringSettings: readonly number[] = [0, 0, 0]; // MVP: fixed

  // Generate all 3-permutations of available rotors
  const rotorPerms = permutations(rotorPool as RotorName[], 3);

  // Total configurations: perms × reflectors × 26³
  const totalConfigs = rotorPerms.length * reflectors.length * 26 * 26 * 26;
  let tested = 0;
  const candidates: BombeCandidate[] = [];

  const cipherSegment = config.ciphertext.toUpperCase().substring(
    config.cribPosition,
    config.cribPosition + config.crib.length,
  );

  const PROGRESS_INTERVAL = 1000;

  for (const rotorCombo of rotorPerms) {
    for (const reflector of reflectors) {
      for (let posL = 0; posL < 26; posL++) {
        for (let posM = 0; posM < 26; posM++) {
          for (let posR = 0; posR < 26; posR++) {
            if (cancelled) {
              postMsg({
                type: 'COMPLETE',
                candidates,
                totalTested: tested,
                elapsedMs: performance.now() - startTime,
              });
              return;
            }

            // Timeout check
            if (performance.now() - startTime > timeoutMs) {
              postMsg({
                type: 'STATUS_CHANGE',
                status: 'TIMEOUT' as any,
              });
              postMsg({
                type: 'COMPLETE',
                candidates,
                totalTested: tested,
                elapsedMs: performance.now() - startTime,
              });
              return;
            }

            tested++;

            // Test this configuration: encrypt the ciphertext segment
            // In Enigma, encryption is its own inverse, so encrypting ciphertext
            // with the correct key yields plaintext.
            const decryptedSegment = encryptString(
              cipherSegment,
              rotorCombo,
              [posL, posM, posR],
              ringSettings as number[],
              reflector,
            );

            // Check if decrypted segment matches the crib
            if (decryptedSegment === config.crib.toUpperCase()) {
              // Full decrypt for preview
              const decryptedFull = encryptString(
                config.ciphertext,
                rotorCombo,
                [posL, posM, posR],
                ringSettings as number[],
                reflector,
              );

              const ic = quickIC(decryptedFull);
              const candidate: BombeCandidate = {
                rotorTypes: [...rotorCombo],
                rotorPositions: [posL, posM, posR],
                ringSettings: [...ringSettings],
                reflectorType: reflector,
                decryptedPreview: decryptedFull.substring(0, 100),
                confidenceScore: Math.min(1, ic / 0.067), // Normalize against English IC
              };

              candidates.push(candidate);
              postMsg({ type: 'CANDIDATE_FOUND', candidate });
            }

            // Progress report
            if (tested % PROGRESS_INTERVAL === 0) {
              postMsg({
                type: 'PROGRESS',
                tested,
                total: totalConfigs,
                percentComplete: Math.round((tested / totalConfigs) * 10000) / 100,
              });
            }
          }
        }
      }
    }
  }

  postMsg({
    type: 'COMPLETE',
    candidates,
    totalTested: tested,
    elapsedMs: performance.now() - startTime,
  });
}
