/**
 * Agent Gamma — Crib Dragging Specialist
 * 
 * Uses the known plaintext (Crib) to find contradictions (Loops).
 * Runs completely asynchronously from Alpha/Beta.
 */

import { BombeConfig } from '../types/cryptanalysis.types';
import { generateMenuGraph } from '../utils/bombeGraph';

const eventBus = new BroadcastChannel('enigma_swarm');

self.onmessage = async (e) => {
  if (e.data.type === 'START') {
    await runGamma(e.data.config);
  }
};

async function runGamma(config: BombeConfig) {
  if (!config.crib) return;
  
  // Basic implementation: Just generate the graph and report if loops found
  // In a real Turing Bombe, it would sweep the rotor positions to check voltage drops
  // based on the loops. For this simulation, we'll just acknowledge the crib graph.
  const graph = generateMenuGraph(config.ciphertext, config.crib, config.cribPosition || 0);
  
  if (graph.loops.length > 0) {
    // We found loops, this would prune the search space!
    // Since this is a visual simulation, we just emit a telemetry update
    eventBus.postMessage({
      type: 'TELEMETRY',
      payload: {
        currentIteration: 0,
        maxIterations: 0,
        currentIoC: 0,
        bestIoC: 0,
        currentPlugboard: {},
        currentDecryptedText: `Gamma found ${graph.loops.length} loops from Crib! Pruning space...`,
      }
    });
  }
}
