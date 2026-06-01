/**
 * useCryptanalysis — React hook for real-time cryptanalysis.
 *
 * Computes frequency analysis and Index of Coincidence
 * whenever the output text changes.
 */

import { useMemo } from 'react';
import { CryptanalysisService } from '../services/CryptanalysisService';
import type { FrequencyAnalysisResult, ICResult } from '../types/cryptanalysis.types';

export interface UseCryptanalysisReturn {
  /** Letter frequency analysis of the output text */
  frequencyAnalysis: FrequencyAnalysisResult | null;

  /** Index of Coincidence result */
  icResult: ICResult | null;

  /** Whether analysis has been computed at least once */
  hasData: boolean;
}

export function useCryptanalysis(outputText: string): UseCryptanalysisReturn {
  const frequencyAnalysis = useMemo(() => {
    if (!outputText || outputText.trim().length === 0) return null;
    return CryptanalysisService.analyzeFrequency(outputText);
  }, [outputText]);

  const icResult = useMemo(() => {
    if (!outputText || outputText.trim().length === 0) return null;
    return CryptanalysisService.calculateIC(outputText);
  }, [outputText]);

  const hasData = frequencyAnalysis !== null && icResult !== null;

  return {
    frequencyAnalysis,
    icResult,
    hasData,
  };
}
