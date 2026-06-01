/**
 * SwarmOrchestrator — The Command Center
 * 
 * Spawns the multi-agent swarm (Alpha, Betas, Gamma) and manages the Event Bus.
 */

import { BombeConfig, BombeCandidate, BombeStatus } from '../types/cryptanalysis.types';
import { TelemetryPayload } from '../types/worker.types';

export interface SwarmCallbacks {
  onProgress: (tested: number, total: number, percent: number) => void;
  onCandidateFound: (candidate: BombeCandidate) => void;
  onComplete: (result: any) => void;
  onError: (msg: string) => void;
  onStatusChange: (status: BombeStatus) => void;
  onTelemetry: (payload: TelemetryPayload) => void;
}

export class SwarmOrchestrator {
  private alphaWorker: Worker | null = null;
  private betaWorkers: Worker[] = [];
  private gammaWorker: Worker | null = null;
  
  private eventBus: BroadcastChannel | null = null;
  private status: BombeStatus = BombeStatus.IDLE;
  
  private startTime: number = 0;
  private totalTested: number = 0;
  private totalConfigs: number = 0;
  private activeBetas: number = 0;

  constructor() {}

  public start(config: BombeConfig, callbacks: SwarmCallbacks): () => void {
    this.cancel();
    
    this.status = BombeStatus.RUNNING;
    this.startTime = performance.now();
    callbacks.onStatusChange(this.status);

    this.eventBus = new BroadcastChannel('enigma_swarm');

    // Listen to Event Bus from Main Thread for global UI updates
    this.eventBus.onmessage = (event) => {
      const msg = event.data;
      if (msg.type === 'CANDIDATE_FOUND') {
        callbacks.onCandidateFound(msg.candidate);
      } else if (msg.type === 'TELEMETRY') {
        callbacks.onTelemetry(msg.payload);
      } else if (msg.type === 'PROGRESS') {
        this.totalTested += msg.testedDelta; // aggregate progress
        this.totalConfigs = msg.totalConfigs;
        const percent = Math.round((this.totalTested / this.totalConfigs) * 10000) / 100;
        callbacks.onProgress(this.totalTested, this.totalConfigs, percent);
      } else if (msg.type === 'ALPHA_COMPLETE') {
        // Alpha finished sweeping. We wait for Betas to finish processing their queues.
      } else if (msg.type === 'BETA_IDLE') {
        this.activeBetas--;
        if (this.activeBetas <= 0) {
          // All done
          this.status = BombeStatus.COMPLETED;
          callbacks.onStatusChange(this.status);
          callbacks.onComplete({
            candidates: [],
            totalConfigurationsTested: this.totalTested,
            elapsedMs: performance.now() - this.startTime,
            status: BombeStatus.COMPLETED
          });
          this.cleanup();
        }
      }
    };

    // Spawn Agent Alpha (Rotor Sweep)
    this.alphaWorker = new Worker(new URL('./agentAlpha.worker.ts', import.meta.url), { type: 'module' });
    this.alphaWorker.postMessage({ type: 'START', config });

    // Spawn Agent Betas (Steckerbrett Mutations)
    const betaCount = Math.max(1, (navigator.hardwareConcurrency || 4) - 2); // Leave cores for UI & Alpha
    this.activeBetas = betaCount;
    for (let i = 0; i < betaCount; i++) {
      const beta = new Worker(new URL('./agentBeta.worker.ts', import.meta.url), { type: 'module' });
      beta.postMessage({ type: 'INIT', workerId: i });
      this.betaWorkers.push(beta);
    }

    // Spawn Agent Gamma (Crib Dragging) if Crib is present
    if (config.crib) {
      this.gammaWorker = new Worker(new URL('./agentGamma.worker.ts', import.meta.url), { type: 'module' });
      this.gammaWorker.postMessage({ type: 'START', config });
    }

    return () => this.cancel();
  }

  public cancel(): void {
    if (this.alphaWorker) this.alphaWorker.terminate();
    this.betaWorkers.forEach(w => w.terminate());
    if (this.gammaWorker) this.gammaWorker.terminate();
    
    this.alphaWorker = null;
    this.betaWorkers = [];
    this.gammaWorker = null;
    
    if (this.eventBus) {
      this.eventBus.close();
      this.eventBus = null;
    }
    
    this.status = BombeStatus.CANCELLED;
  }

  private cleanup(): void {
    this.cancel();
  }
}
