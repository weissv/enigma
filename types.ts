/**
 * Root types re-export — backward compatibility shim.
 * All new code should import from types/ subdirectory directly.
 */

export type { RotorSetting, EnigmaConfig } from './types/enigma.types';
export type {
  TraceStage,
  TraceStep,
  ExtendedTraceStep,
  SignalTrace,
  MessageTrace,
  RotorComponentState,
  ReflectorComponentState,
  IdentityComponentState,
  ExtendedComponentState,
  ComponentState,
} from './types/trace.types';
export { TraceStage as TraceStageEnum } from './types/trace.types';
export type {
  LetterFrequency,
  FrequencyAnalysisResult,
  ICResult,
  BombeConfig,
  BombeCandidate,
  BombeResult,
} from './types/cryptanalysis.types';
export { ICInterpretation, BombeStatus } from './types/cryptanalysis.types';
