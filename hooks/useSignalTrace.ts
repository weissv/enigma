/**
 * useSignalTrace — React hook for managing signal trace state.
 *
 * Provides the currently selected trace and navigation controls
 * for the Glass Box visualization module.
 */

import { useState, useCallback, useMemo } from 'react';
import type { SignalTrace, MessageTrace } from '../types/trace.types';

export interface UseSignalTraceReturn {
  /** Full message trace (all characters) */
  messageTrace: MessageTrace | null;

  /** Currently selected character trace for detail view */
  selectedTrace: SignalTrace | null;

  /** Index of the currently selected character */
  selectedIndex: number;

  /** Update the full message trace (called when text/config changes) */
  setMessageTrace: (trace: MessageTrace | null) => void;

  /** Select a specific character trace by index */
  selectCharacter: (index: number) => void;

  /** Navigate to the next character trace */
  selectNext: () => void;

  /** Navigate to the previous character trace */
  selectPrev: () => void;

  /** Total number of traced characters */
  totalTraced: number;
}

export function useSignalTrace(): UseSignalTraceReturn {
  const [messageTrace, setMessageTrace] = useState<MessageTrace | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const totalTraced = useMemo(
    () => messageTrace?.traces.length ?? 0,
    [messageTrace],
  );

  const selectedTrace = useMemo(
    () => {
      if (!messageTrace || selectedIndex < 0 || selectedIndex >= messageTrace.traces.length) {
        return null;
      }
      return messageTrace.traces[selectedIndex];
    },
    [messageTrace, selectedIndex],
  );

  const selectCharacter = useCallback((index: number) => {
    setSelectedIndex(Math.max(0, Math.min(index, (messageTrace?.traces.length ?? 1) - 1)));
  }, [messageTrace]);

  const selectNext = useCallback(() => {
    setSelectedIndex(prev => {
      const max = (messageTrace?.traces.length ?? 1) - 1;
      return Math.min(prev + 1, max);
    });
  }, [messageTrace]);

  const selectPrev = useCallback(() => {
    setSelectedIndex(prev => Math.max(prev - 1, 0));
  }, [messageTrace]);

  const handleSetMessageTrace = useCallback((trace: MessageTrace | null) => {
    setMessageTrace(trace);
    // Auto-select last character when trace updates
    if (trace && trace.traces.length > 0) {
      setSelectedIndex(trace.traces.length - 1);
    } else {
      setSelectedIndex(0);
    }
  }, []);

  return {
    messageTrace,
    selectedTrace,
    selectedIndex,
    setMessageTrace: handleSetMessageTrace,
    selectCharacter,
    selectNext,
    selectPrev,
    totalTraced,
  };
}
