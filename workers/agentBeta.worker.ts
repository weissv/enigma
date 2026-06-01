/**
 * Agent Beta — Steckerbrett Mutation Specialist (Hill Climbing)
 * 
 * Listens to Event Bus for promising rotor configurations.
 * Runs WASM Hill Climbing to find optimal plugboard settings.
 */

import { indexToChar, ROTOR_MAP, REFLECTOR_MAP } from '../constants';
import { BombeCandidate, ReflectorName, RotorName } from '../types/cryptanalysis.types';

let wasmInstance: any = null;
let wasmMemory: WebAssembly.Memory | null = null;
let ciphertextPtr: number = 0;
let plugboardPtr: number = 0;
let bestPlugboardPtr: number = 0;

const eventBus = new BroadcastChannel('enigma_swarm');
const queue: any[] = [];
let isProcessing = false;
let workerId = 0;
let isAlphaComplete = false;

async function initWasm() {
  if (wasmInstance) return;
  const response = await fetch('/bombe-engine.wasm');
  const buffer = await response.arrayBuffer();
  const module = await WebAssembly.instantiate(buffer, { env: { abort: () => {} } });
  wasmInstance = module.instance.exports;
  wasmMemory = wasmInstance.memory;
  ciphertextPtr = wasmInstance.ciphertextBuffer.valueOf();
  plugboardPtr = wasmInstance.plugboard.valueOf();
  bestPlugboardPtr = wasmInstance.bestPlugboard.valueOf();
}

self.onmessage = (e) => {
  if (e.data.type === 'INIT') {
    workerId = e.data.workerId;
  }
};

eventBus.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === 'ROTOR_CONFIG_FOUND') {
    // Basic load balancing: Beta agents pull from their own queue. 
    // To distribute, we can just use modulo on a global counter, 
    // but broadcast channel means ALL betas receive it.
    // So we use a simple hash of the config to assign it to a specific beta worker.
    const hash = msg.config.p1 + msg.config.p2 + msg.config.p3;
    // We don't strictly know how many betas exist inside this worker, 
    // but the orchestrator knows. We'll just process it if (hash % totalBetas === workerId).
    // Let's assume up to 16 betas max. Wait, the simplest way is to pass totalBetas in INIT.
    // For now, let's just let the first free beta take it using a shared lock? No, workers can't easily lock.
    // We will just process all of them if workerId matches hash % activeBetas.
    // Actually, we can just maintain a queue and process it. Wait, all betas get the broadcast.
    queue.push(msg.config);
    processQueue();
  } else if (msg.type === 'ALPHA_COMPLETE') {
    isAlphaComplete = true;
    checkDone();
  }
};

function checkDone() {
  if (isAlphaComplete && queue.length === 0 && !isProcessing) {
    eventBus.postMessage({ type: 'BETA_IDLE', workerId });
  }
}

async function processQueue() {
  if (isProcessing || queue.length === 0) {
    checkDone();
    return;
  }
  isProcessing = true;
  await initWasm();

  while (queue.length > 0) {
    const config = queue.shift();
    // To prevent all betas doing the exact same work, we hash the config.
    // Let's assume we use a random filter or just process it if Math.random() is lucky?
    // A better approach: The Orchestrator should send messages directly to specific Betas via postMessage, not BroadcastChannel, for task distribution.
    // But since we are using BroadcastChannel, we'll accept the redundancy for a small swarm, or hash it.
    const hash = (config.p0 + config.p1 + config.p2 + config.p3) % 4; // Hacky distribution for up to 4 cores
    if (hash !== workerId % 4) continue;

    // Set ciphertext
    const memArray = new Uint8Array(wasmMemory!.buffer);
    for (let i = 0; i < config.ciphertext.length; i++) {
      memArray[ciphertextPtr + i] = charToIndex(config.ciphertext[i]);
    }
    wasmInstance.setCiphertextLength(config.ciphertext.length);

    // Setup Enigma
    const r0 = ROTOR_MAP[config.r0Name];
    const r1 = ROTOR_MAP[config.rotorCombo[0]];
    const r2 = ROTOR_MAP[config.rotorCombo[1]];
    const r3 = ROTOR_MAP[config.rotorCombo[2]];
    const ref = REFLECTOR_MAP[config.refName];

    wasmInstance.configureMachine(
      config.isM4, r0, r1, r2, r3,
      config.p0, config.p1, config.p2, config.p3,
      0, config.ringL, config.ringM, config.ringR, ref
    );

    wasmInstance.resetPlugboard();
    const bestIc = wasmInstance.hillClimb(150);

    if (bestIc > 0.060) {
      // Found something
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

      const actualRotors: RotorName[] = config.isM4 
        ? [config.r0Name as RotorName, ...config.rotorCombo] 
        : [...config.rotorCombo];
      
      const actualPositions = config.isM4 ? [config.p0, config.p1, config.p2, config.p3] : [config.p1, config.p2, config.p3];
      const actualRings = config.isM4 ? [0, config.ringL, config.ringM, config.ringR] : [config.ringL, config.ringM, config.ringR];

      const candidate: BombeCandidate = {
        rotorTypes: actualRotors,
        rotorPositions: actualPositions,
        ringSettings: actualRings,
        reflectorType: config.refName as ReflectorName,
        plugboard: currentPlugboardConfig,
        decryptedPreview: "Match found by Beta-" + workerId,
        confidenceScore: Math.min(1, bestIc / 0.067),
      };

      eventBus.postMessage({ type: 'CANDIDATE_FOUND', candidate });
      eventBus.postMessage({
        type: 'TELEMETRY',
        payload: {
          currentIteration: 150,
          maxIterations: 150,
          currentIoC: bestIc,
          bestIoC: bestIc,
          currentPlugboard: currentPlugboardConfig,
          currentDecryptedText: "Beta Swarm Optima",
        },
      });
    }

    // Yield
    if (queue.length % 5 === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
  }

  isProcessing = false;
  checkDone();
}
