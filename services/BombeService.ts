/**
 * Bombe Service — Web Worker Orchestrator.
 *
 * Manages the lifecycle of the Turing Bombe Web Worker.
 * Provides a clean API for starting, monitoring, and cancelling
 * brute-force attacks from React hooks.
 */

import type {
  BombeConfig,
  BombeCandidate,
  BombeResult,
} from '../types/cryptanalysis.types';
import { BombeStatus } from '../types/cryptanalysis.types';
import type {
  BombeWorkerMessage,
  BombeWorkerResponse,
} from '../types/worker.types';

export interface BombeCallbacks {
  onProgress: (tested: number, total: number, percent: number) => void;
  onCandidateFound: (candidate: BombeCandidate) => void;
  onComplete: (result: BombeResult) => void;
  onError: (message: string) => void;
  onStatusChange?: (status: BombeStatus) => void;
}

export class BombeService {
  private worker: Worker | null = null;
  private status: BombeStatus = BombeStatus.IDLE;
  private startTime: number = 0;
  private collectedCandidates: BombeCandidate[] = [];

  /**
   * Starts the Bombe brute-force in a separate thread.
   *
   * @param config    - Bombe attack configuration
   * @param callbacks - Event handlers for progress, results, and errors
   * @returns Cleanup function (suitable for React useEffect)
   */
  public start(config: BombeConfig, callbacks: BombeCallbacks): () => void {
    // Terminate any existing worker
    this.cancel();

    this.status = BombeStatus.RUNNING;
    this.startTime = performance.now();
    this.collectedCandidates = [];
    callbacks.onStatusChange?.(this.status);

    try {
      this.worker = new Worker(
        new URL('../workers/bombe.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (err) {
      this.status = BombeStatus.ERROR;
      callbacks.onStatusChange?.(this.status);
      callbacks.onError(`Failed to create Web Worker: ${String(err)}`);
      return () => {};
    }

    this.worker.onmessage = (event: MessageEvent<BombeWorkerResponse>) => {
      const msg = event.data;

      switch (msg.type) {
        case 'PROGRESS':
          callbacks.onProgress(msg.tested, msg.total, msg.percentComplete);
          break;

        case 'CANDIDATE_FOUND':
          this.collectedCandidates.push(msg.candidate);
          callbacks.onCandidateFound(msg.candidate);
          break;

        case 'COMPLETE':
          this.status = BombeStatus.COMPLETED;
          callbacks.onStatusChange?.(this.status);
          callbacks.onComplete({
            candidates: msg.candidates,
            totalConfigurationsTested: msg.totalTested,
            elapsedMs: msg.elapsedMs,
            status: BombeStatus.COMPLETED,
          });
          this.cleanup();
          break;

        case 'ERROR':
          this.status = BombeStatus.ERROR;
          callbacks.onStatusChange?.(this.status);
          callbacks.onError(msg.message);
          this.cleanup();
          break;

        case 'STATUS_CHANGE':
          this.status = msg.status;
          callbacks.onStatusChange?.(msg.status);
          break;
      }
    };

    this.worker.onerror = (event: ErrorEvent) => {
      this.status = BombeStatus.ERROR;
      callbacks.onStatusChange?.(this.status);
      callbacks.onError(`Worker error: ${event.message}`);
      this.cleanup();
    };

    // Send START message to worker
    const message: BombeWorkerMessage = { type: 'START', config };
    this.worker.postMessage(message);

    // Return cleanup function
    return () => this.cancel();
  }

  /**
   * Cancels the running Bombe worker.
   */
  public cancel(): void {
    if (this.worker) {
      const message: BombeWorkerMessage = { type: 'CANCEL' };
      this.worker.postMessage(message);
      this.status = BombeStatus.CANCELLED;
      this.cleanup();
    }
  }

  /**
   * Returns the current status of the Bombe.
   */
  public getStatus(): BombeStatus {
    return this.status;
  }

  /**
   * Returns elapsed time since start (ms).
   */
  public getElapsedMs(): number {
    if (this.startTime === 0) return 0;
    return performance.now() - this.startTime;
  }

  private cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
