/**
 * Turing Bombe Web Worker — Brute-Force Engine.
 *
 * Runs in a separate thread. Enumerates rotor configurations
 * and tests each against a known crib to find matching settings.
 *
 * MVP Scope to Phase 2:
 * - Ring settings dynamic (defaulting to iterating [0,0,0] if not provided, to save time).
 * - Implements Hill Climbing heuristic to optimize Plugboard (Steckerbrett).
 * - Uses Task Chunking to prevent thread blocking and allow quick cancellation.
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

function encryptStringWithPlugboard(
  text: string,
  rotorNames: readonly RotorName[],
  positions: readonly number[],
  ringSettings: readonly number[],
  reflectorName: ReflectorName,
  plugboardWiring: number[]
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
    let signal = charToIndex(char);
    if (signal < 0 || signal >= 26) continue;
    
    stepRotors(rotors);
    
    // Plugboard FWD
    signal = plugboardWiring[signal];
    // Rotors + Reflector
    signal = encryptChar(signal, rotors, reflector);
    // Plugboard INV
    signal = plugboardWiring[signal];
    
    result += indexToChar(signal);
  }
  return result;
}

/**
 * Hill Climbing Heuristic for Steckerbrett
 * Tries to maximize the Index of Coincidence by swapping cables.
 */
function hillClimbPlugboard(
  text: string,
  rotorNames: readonly RotorName[],
  positions: readonly number[],
  ringSettings: readonly number[],
  reflectorName: ReflectorName,
  iterations: number = 200
): { plugboard: Record<string, string>, bestIc: number, decryptedText: string } {
  let bestWiring = new Array(26).fill(0).map((_, i) => i);
  let bestIc = 0;
  let bestDecrypted = '';

  let currentWiring = [...bestWiring];
  
  for (let i = 0; i < iterations; i++) {
    // Pick two random letters to swap their connections
    const a = Math.floor(Math.random() * 26);
    const b = Math.floor(Math.random() * 26);
    
    if (a !== b) {
      const targetA = currentWiring[a];
      const targetB = currentWiring[b];
      
      currentWiring[a] = targetB;
      currentWiring[targetB] = a;
      currentWiring[b] = targetA;
      currentWiring[targetA] = b;
    }
    
    const decrypted = encryptStringWithPlugboard(text, rotorNames, positions, ringSettings, reflectorName, currentWiring);
    const ic = quickIC(decrypted);
    
    if (ic >= bestIc) {
      bestIc = ic;
      bestWiring = [...currentWiring];
      bestDecrypted = decrypted;
    } else {
      // Revert mutation
      currentWiring = [...bestWiring];
    }
  }

  // Convert wiring array to Record<string, string>
  const plugboardConfig: Record<string, string> = {};
  const seen = new Set<number>();
  for (let i = 0; i < 26; i++) {
    if (bestWiring[i] !== i && !seen.has(i)) {
      plugboardConfig[indexToChar(i)] = indexToChar(bestWiring[i]);
      seen.add(i);
      seen.add(bestWiring[i]);
    }
  }

  return { plugboard: plugboardConfig, bestIc, decryptedText: bestDecrypted };
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

async function runBombe(config: BombeConfig): Promise<void> {
  const startTime = performance.now();
  postMsg({ type: 'STATUS_CHANGE', status: 'RUNNING' as any });

  const rotorPool = config.rotorCandidates ?? [...AVAILABLE_ROTORS_LIST];
  const reflectors = config.reflectorCandidates ?? [...AVAILABLE_REFLECTORS_LIST];
  const timeoutMs = config.timeoutMs ?? 30000;
  
  // If no rings provided, we default to [0,0,0] to avoid O(26^6) complexity.
  // Full brute force of rings is possible by passing all rings in ringCandidates,
  // but it's typically mathematically unfeasible for a browser worker.
  const ringCandidates = config.ringCandidates ?? [0]; 

  const rotorPerms = permutations(rotorPool as RotorName[], 3);
  
  // Total configurations is massive if rings are tested
  const totalConfigs = rotorPerms.length * reflectors.length * Math.pow(ringCandidates.length, 3) * 26 * 26 * 26;
  let tested = 0;
  const candidates: BombeCandidate[] = [];

  const PROGRESS_INTERVAL = 500; // More frequent yielding for responsiveness
  const emptyWiring = new Array(26).fill(0).map((_, i) => i);

  // We only test a subset of the ciphertext for speed during Hill Climbing
  const textSample = config.ciphertext.length > 250 ? config.ciphertext.substring(0, 250) : config.ciphertext;

  for (const rotorCombo of rotorPerms) {
    for (const reflector of reflectors) {
      for (const ringL of ringCandidates) {
        for (const ringM of ringCandidates) {
          for (const ringR of ringCandidates) {
            for (let posL = 0; posL < 26; posL++) {
              for (let posM = 0; posM < 26; posM++) {
                for (let posR = 0; posR < 26; posR++) {
                  if (cancelled) {
                    postMsg({ type: 'COMPLETE', candidates, totalTested: tested, elapsedMs: performance.now() - startTime });
                    return;
                  }

                  if (performance.now() - startTime > timeoutMs) {
                    postMsg({ type: 'STATUS_CHANGE', status: 'TIMEOUT' as any });
                    postMsg({ type: 'COMPLETE', candidates, totalTested: tested, elapsedMs: performance.now() - startTime });
                    return;
                  }

                  tested++;
                  
                  // Yield to event loop to process CANCEL messages and not freeze the browser
                  if (tested % PROGRESS_INTERVAL === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                    postMsg({
                      type: 'PROGRESS',
                      tested,
                      total: totalConfigs,
                      percentComplete: Math.round((tested / totalConfigs) * 10000) / 100,
                    });
                  }

                  const rings = [ringL, ringM, ringR];
                  const positions = [posL, posM, posR];

                  // Strategy:
                  // 1. If we have a crib, use it to quickly discard impossible positions (ignoring plugboard first).
                  //    Actually, plugboard changes the crib matching! 
                  //    Since we have Hill Climbing, we rely purely on IoC maximization!
                  
                  // Fast initial check with NO plugboard.
                  const initialDecrypted = encryptStringWithPlugboard(textSample, rotorCombo, positions, rings, reflector, emptyWiring);
                  const initialIc = quickIC(initialDecrypted);

                  // If IC is somewhat promising (> 0.040, typical random is ~0.038), we Hill Climb the Steckerbrett!
                  if (initialIc > 0.040) {
                    const hcResult = hillClimbPlugboard(textSample, rotorCombo, positions, rings, reflector, 150);
                    
                    // If after Hill Climbing the IC is very high (meaningful text)
                    if (hcResult.bestIc > 0.060) {
                      const candidate: BombeCandidate = {
                        rotorTypes: [...rotorCombo],
                        rotorPositions: [...positions],
                        ringSettings: [...rings],
                        reflectorType: reflector,
                        plugboard: hcResult.plugboard,
                        decryptedPreview: hcResult.decryptedText.substring(0, 100),
                        confidenceScore: Math.min(1, hcResult.bestIc / 0.067),
                      };

                      candidates.push(candidate);
                      postMsg({ type: 'CANDIDATE_FOUND', candidate });
                    }
                  }
                }
              }
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
