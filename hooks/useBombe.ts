/**
 * useBombe — React hook for Turing Bombe Web Worker management.
 *
 * Provides a clean API for starting, monitoring, and cancelling
 * brute-force attacks with automatic cleanup on unmount.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SwarmOrchestrator } from '../workers/SwarmOrchestrator';
import type { BombeConfig, BombeCandidate, BombeResult } from '../types/cryptanalysis.types';
import { BombeStatus } from '../types/cryptanalysis.types';
import type { TelemetryPayload } from '../types/worker.types';

export interface UseBombeReturn {
  /** Current Bombe status */
  status: BombeStatus;

  /** Progress: configurations tested so far */
  tested: number;

  /** Progress: total configurations to test */
  total: number;

  /** Progress: percentage complete (0-100) */
  percentComplete: number;

  /** Candidates found so far (live updates) */
  candidates: BombeCandidate[];

  /** Final result after completion */
  result: BombeResult | null;

  /** Real-time telemetry from Hill Climbing algorithm */
  telemetry: TelemetryPayload | null;

  /** Error message if any */
  error: string | null;

  /** Start a Bombe attack with the given configuration */
  start: (config: BombeConfig) => void;

  /** Cancel the running Bombe */
  cancel: () => void;

  /** Reset all state to initial */
  reset: () => void;
}

export function useBombe(): UseBombeReturn {
  const [status, setStatus] = useState<BombeStatus>(BombeStatus.IDLE);
  const [tested, setTested] = useState(0);
  const [total, setTotal] = useState(0);
  const [percentComplete, setPercentComplete] = useState(0);
  const [candidates, setCandidates] = useState<BombeCandidate[]>([]);
  const [result, setResult] = useState<BombeResult | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bombeRef = useRef<SwarmOrchestrator>(new SwarmOrchestrator());
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const start = useCallback((config: BombeConfig) => {
    // Reset state
    setStatus(BombeStatus.RUNNING);
    setTested(0);
    setTotal(0);
    setPercentComplete(0);
    setCandidates([]);
    setResult(null);
    setTelemetry(null);
    setError(null);

    cleanupRef.current = bombeRef.current.start(config, {
      onProgress: (t, tot, pct) => {
        setTested(t);
        setTotal(tot);
        setPercentComplete(pct);
      },
      onCandidateFound: (candidate) => {
        setCandidates(prev => [...prev, candidate]);
      },
      onComplete: (bombeResult) => {
        setResult(bombeResult);
        setStatus(bombeResult.status);
      },
      onError: (msg) => {
        setError(msg);
        setStatus(BombeStatus.ERROR);
      },
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onTelemetry: (payload) => {
        setTelemetry(payload);
      },
    });
  }, []);

  const cancel = useCallback(() => {
    bombeRef.current.cancel();
    setStatus(BombeStatus.CANCELLED);
  }, []);

  const reset = useCallback(() => {
    cleanupRef.current?.();
    setStatus(BombeStatus.IDLE);
    setTested(0);
    setTotal(0);
    setPercentComplete(0);
    setCandidates([]);
    setResult(null);
    setTelemetry(null);
    setError(null);
  }, []);

  return {
    status,
    tested,
    total,
    percentComplete,
    candidates,
    result,
    telemetry,
    error,
    start,
    cancel,
    reset,
  };
}
