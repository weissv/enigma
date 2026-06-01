import {
  charToIndex,
  indexToChar,
  AVAILABLE_ROTORS_LIST,
} from '../constants';
import type { RotorName, ReflectorName } from '../constants';
import type { BombeConfig, BombeCandidate } from '../types/cryptanalysis.types';
import type { BombeWorkerMessage, BombeWorkerResponse } from '../types/worker.types';
import { permutations } from '../utils/math';

// Map string names to AS indices
const ROTOR_MAP: Record<string, number> = {
  'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'Beta': 5, 'Gamma': 6
};
const REFLECTOR_MAP: Record<string, number> = {
  'B': 0, 'C': 1, 'B Thin': 2, 'C Thin': 3
};

let wasmInstance: any = null;
let wasmMemory: WebAssembly.Memory | null = null;
let ciphertextPtr: number = 0;
let plugboardPtr: number = 0;
let bestPlugboardPtr: number = 0;

let cancelled = false;

function postMsg(msg: BombeWorkerResponse): void {
  self.postMessage(msg);
}

self.onmessage = async (event: MessageEvent<BombeWorkerMessage>) => {
  const msg = event.data;

  if (msg.type === 'CANCEL') {
    cancelled = true;
    return;
  }

  if (msg.type === 'START') {
    cancelled = false;
    await runBombe(msg.config);
  }
};

async function initWasm() {
  if (wasmInstance) return;

  // We fetch the WASM binary from the public directory.
  // In Vite dev and prod, assets in public/ are served at the root.
  const response = await fetch('/bombe-engine.wasm');
  const buffer = await response.arrayBuffer();
  
  const module = await WebAssembly.instantiate(buffer, {
    env: {
      abort: () => console.error('WASM Abort called')
    }
  });

  wasmInstance = module.instance.exports;
  wasmMemory = wasmInstance.memory;
  
  // Get exported memory addresses
  ciphertextPtr = wasmInstance.ciphertextBuffer.valueOf();
  plugboardPtr = wasmInstance.plugboard.valueOf();
  bestPlugboardPtr = wasmInstance.bestPlugboard.valueOf();
}

async function runBombe(config: BombeConfig): Promise<void> {
  const startTime = performance.now();
  postMsg({ type: 'STATUS_CHANGE', status: 'RUNNING' as any });

  try {
    await initWasm();
  } catch (err) {
    postMsg({ type: 'STATUS_CHANGE', status: 'ERROR' as any });
    return;
  }

  const isM4 = config.machineType === 'M4';
  const timeoutMs = config.timeoutMs ?? 30000;
  
  let rotorPool = config.rotorCandidates ?? [...AVAILABLE_ROTORS_LIST];
  if (isM4) {
    // Only I-V for the right 3 slots
    rotorPool = rotorPool.filter(r => r !== 'Beta' && r !== 'Gamma');
  }

  const reflectors = config.reflectorCandidates ?? (isM4 ? ['B Thin', 'C Thin'] : ['B', 'C']);
  const ringCandidates = config.ringCandidates ?? [0]; 
  
  const rotorPerms = permutations(rotorPool as RotorName[], 3);
  
  // Total configurations
  let fourthRotors = isM4 ? ['Beta', 'Gamma'] : ['none'];
  const totalConfigs = fourthRotors.length * rotorPerms.length * reflectors.length * Math.pow(ringCandidates.length, 3) * (isM4 ? 26 : 1) * 26 * 26 * 26;
  
  let tested = 0;
  const candidates: BombeCandidate[] = [];
  const PROGRESS_INTERVAL = 1000; 

  const textSample = config.ciphertext.length > 250 ? config.ciphertext.substring(0, 250) : config.ciphertext;
  
  // Write ciphertext to WASM memory
  const memArray = new Uint8Array(wasmMemory!.buffer);
  for (let i = 0; i < textSample.length; i++) {
    memArray[ciphertextPtr + i] = charToIndex(textSample[i]);
  }
  wasmInstance.setCiphertextLength(textSample.length);

  for (const fourth of fourthRotors) {
    const r0Name = isM4 ? fourth : 'I';
    const r0 = ROTOR_MAP[r0Name];
    // In M3, r0 is ignored by WASM logic because isM4 = false
    
    for (const rotorCombo of rotorPerms) {
      const r1 = ROTOR_MAP[rotorCombo[0]];
      const r2 = ROTOR_MAP[rotorCombo[1]];
      const r3 = ROTOR_MAP[rotorCombo[2]];

      for (const refName of reflectors) {
        const ref = REFLECTOR_MAP[refName];

        for (const ringL of ringCandidates) {
          for (const ringM of ringCandidates) {
            for (const ringR of ringCandidates) {
              const pos4Range = isM4 ? 26 : 1;
              
              for (let p0 = 0; p0 < pos4Range; p0++) {
                for (let p1 = 0; p1 < 26; p1++) {
                  for (let p2 = 0; p2 < 26; p2++) {
                    for (let p3 = 0; p3 < 26; p3++) {
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
                      
                      if (tested % PROGRESS_INTERVAL === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                        postMsg({
                          type: 'PROGRESS',
                          tested,
                          total: totalConfigs,
                          percentComplete: Math.round((tested / totalConfigs) * 10000) / 100,
                        });
                      }

                      // Configure WASM Enigma
                      wasmInstance.configureMachine(
                        isM4,
                        r0, r1, r2, r3,
                        p0, p1, p2, p3,
                        0, ringL, ringM, ringR, // ring0=0 always (rarely changed historically)
                        ref
                      );

                      // Fast check: reset plugboard and evaluate IC
                      wasmInstance.resetPlugboard();
                      const initialIc = wasmInstance.evaluateIC();

                      if (initialIc > 0.040) {
                        // Very promising, run WASM Hill Climb (150 iterations)
                        const bestIc = wasmInstance.hillClimb(150);

                        if (bestIc > 0.060) {
                          // We found a match! Extract plugboard from WASM memory
                          const plugArray = new Uint8Array(wasmMemory!.buffer, bestPlugboardPtr, 26);
                          const currentPlugboardConfig: Record<string, string> = {};
                          const seenConfig = new Set<number>();
                          
                          for (let j = 0; j < 26; j++) {
                            const target = plugArray[j];
                            if (target !== j && !seenConfig.has(j)) {
                              currentPlugboardConfig[indexToChar(j)] = indexToChar(target);
                              seenConfig.add(j);
                              seenConfig.add(target);
                            }
                          }

                          // Get preview string by running WASM one last time with best plugboard
                          // Copy best to current plugboard
                          const currentPlug = new Uint8Array(wasmMemory!.buffer, plugboardPtr, 26);
                          for (let j = 0; j < 26; j++) {
                            currentPlug[j] = plugArray[j];
                          }
                          // Manually encrypt preview string (slow JS is fine for preview)
                          // Actually, we could just evaluateIC again to leave it in some state, but we don't have an encryptString exported.
                          // So we'll just show the config for now.
                          
                          const actualRotors: RotorName[] = isM4 
                            ? [fourth as RotorName, ...rotorCombo] 
                            : [...rotorCombo];
                          
                          const actualPositions = isM4 ? [p0, p1, p2, p3] : [p1, p2, p3];
                          const actualRings = isM4 ? [0, ringL, ringM, ringR] : [ringL, ringM, ringR];

                          const candidate: BombeCandidate = {
                            rotorTypes: actualRotors,
                            rotorPositions: actualPositions,
                            ringSettings: actualRings,
                            reflectorType: refName as ReflectorName,
                            plugboard: currentPlugboardConfig,
                            decryptedPreview: "WASM FOUND MATCH",
                            confidenceScore: Math.min(1, bestIc / 0.067),
                          };

                          candidates.push(candidate);
                          postMsg({ type: 'CANDIDATE_FOUND', candidate });
                          
                          // Telemetry
                          postMsg({
                            type: 'TELEMETRY',
                            payload: {
                              currentIteration: 150,
                              maxIterations: 150,
                              currentIoC: bestIc,
                              bestIoC: bestIc,
                              currentPlugboard: currentPlugboardConfig,
                              currentDecryptedText: "Match Found via WASM",
                            },
                          });
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
    }
  }

  postMsg({
    type: 'COMPLETE',
    candidates,
    totalTested: tested,
    elapsedMs: performance.now() - startTime,
  });
}
