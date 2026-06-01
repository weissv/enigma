/**
 * Agent Alpha — Rotor Sweep Specialist
 * 
 * Loops through all possible rotor/reflector/ring combinations.
 * Evaluates base IC (without Steckerbrett). If promising, publishes
 * task to Event Bus for Beta agents.
 */

import { BombeConfig } from '../types/cryptanalysis.types';
import { permutations } from '../utils/math';
import { ROTOR_MAP, REFLECTOR_MAP, charToIndex, AVAILABLE_ROTORS_LIST } from '../constants';

let wasmInstance: any = null;
let wasmMemory: WebAssembly.Memory | null = null;
let ciphertextPtr: number = 0;
const eventBus = new BroadcastChannel('enigma_swarm');

async function initWasm() {
  if (wasmInstance) return;
  const response = await fetch('/bombe-engine.wasm');
  const buffer = await response.arrayBuffer();
  const module = await WebAssembly.instantiate(buffer, { env: { abort: () => {} } });
  wasmInstance = module.instance.exports;
  wasmMemory = wasmInstance.memory;
  ciphertextPtr = wasmInstance.ciphertextBuffer.valueOf();
}

self.onmessage = async (e) => {
  if (e.data.type === 'START') {
    await runAlpha(e.data.config);
  }
};

async function runAlpha(config: BombeConfig) {
  await initWasm();
  
  const textSample = config.ciphertext.length > 250 ? config.ciphertext.substring(0, 250) : config.ciphertext;
  const memArray = new Uint8Array(wasmMemory!.buffer);
  for (let i = 0; i < textSample.length; i++) {
    memArray[ciphertextPtr + i] = charToIndex(textSample[i]);
  }
  wasmInstance.setCiphertextLength(textSample.length);

  const isM4 = config.machineType === 'M4';
  let rotorPool = config.rotorCandidates ?? [...AVAILABLE_ROTORS_LIST];
  if (isM4) rotorPool = rotorPool.filter(r => r !== 'Beta' && r !== 'Gamma');
  
  const reflectors = config.reflectorCandidates ?? (isM4 ? ['B Thin', 'C Thin'] : ['B', 'C']);
  const ringCandidates = config.ringCandidates ?? [0];
  const rotorPerms = permutations(rotorPool as any, 3);
  const fourthRotors = isM4 ? ['Beta', 'Gamma'] : ['none'];

  const totalConfigs = fourthRotors.length * rotorPerms.length * reflectors.length * Math.pow(ringCandidates.length, 3) * (isM4 ? 26 : 1) * 26 * 26 * 26;
  let tested = 0;

  for (const fourth of fourthRotors) {
    const r0Name = isM4 ? fourth : 'I';
    const r0 = ROTOR_MAP[r0Name];
    
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
                      tested++;
                      
                      if (tested % 5000 === 0) {
                        eventBus.postMessage({ type: 'PROGRESS', testedDelta: 5000, totalConfigs });
                        // Yield to event loop
                        await new Promise(r => setTimeout(r, 0));
                      }

                      wasmInstance.configureMachine(isM4, r0, r1, r2, r3, p0, p1, p2, p3, 0, ringL, ringM, ringR, ref);
                      wasmInstance.resetPlugboard();
                      const ic = wasmInstance.evaluateIC();

                      if (ic > 0.040) {
                        // Promising! Send to Beta
                        eventBus.postMessage({
                          type: 'ROTOR_CONFIG_FOUND',
                          config: {
                            isM4, r0Name, rotorCombo, refName,
                            p0, p1, p2, p3,
                            ringL, ringM, ringR,
                            ciphertext: textSample
                          }
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
  
  eventBus.postMessage({ type: 'ALPHA_COMPLETE' });
}
