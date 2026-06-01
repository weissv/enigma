/**
 * Web Worker Message Types — Bombe Worker Protocol.
 *
 * Discriminated unions for type-safe postMessage communication
 * between the main thread and the Bombe Web Worker.
 */

import type { BombeConfig, BombeCandidate, BombeStatus } from './cryptanalysis.types';

// ─── Main Thread → Worker ─────────────────────────────────────────

export type BombeWorkerMessage =
  | { readonly type: 'START'; readonly config: BombeConfig }
  | { readonly type: 'CANCEL' };

// ─── Worker → Main Thread ─────────────────────────────────────────

export type BombeWorkerResponse =
  | {
      readonly type: 'PROGRESS';
      readonly tested: number;
      readonly total: number;
      readonly percentComplete: number;
    }
  | {
      readonly type: 'CANDIDATE_FOUND';
      readonly candidate: BombeCandidate;
    }
  | {
      readonly type: 'COMPLETE';
      readonly candidates: readonly BombeCandidate[];
      readonly totalTested: number;
      readonly elapsedMs: number;
    }
  | {
      readonly type: 'ERROR';
      readonly message: string;
    }
  | {
      readonly type: 'STATUS_CHANGE';
      readonly status: BombeStatus;
    };
