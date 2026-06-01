/**
 * TraceStepDetail — Shows detailed step-by-step substitution
 * for the currently selected character trace.
 */

import React from 'react';
import type { SignalTrace } from '../../types/trace.types';
import { TraceStage } from '../../types/trace.types';

interface TraceStepDetailProps {
  trace: SignalTrace | null;
}

const STAGE_CSS: Record<TraceStage, string> = {
  [TraceStage.INPUT]:       'trace-step--input',
  [TraceStage.ROTOR_R_FWD]: 'trace-step--forward',
  [TraceStage.ROTOR_M_FWD]: 'trace-step--forward',
  [TraceStage.ROTOR_L_FWD]: 'trace-step--forward',
  [TraceStage.REFLECTOR]:   'trace-step--reflector',
  [TraceStage.ROTOR_L_INV]: 'trace-step--backward',
  [TraceStage.ROTOR_M_INV]: 'trace-step--backward',
  [TraceStage.ROTOR_R_INV]: 'trace-step--backward',
  [TraceStage.OUTPUT]:      'trace-step--output',
};

const STAGE_NAMES: Record<TraceStage, string> = {
  [TraceStage.INPUT]:       'Input',
  [TraceStage.ROTOR_R_FWD]: 'Rotor R',
  [TraceStage.ROTOR_M_FWD]: 'Rotor M',
  [TraceStage.ROTOR_L_FWD]: 'Rotor L',
  [TraceStage.REFLECTOR]:   'Reflector',
  [TraceStage.ROTOR_L_INV]: 'Rotor L⁻¹',
  [TraceStage.ROTOR_M_INV]: 'Rotor M⁻¹',
  [TraceStage.ROTOR_R_INV]: 'Rotor R⁻¹',
  [TraceStage.OUTPUT]:      'Output',
};

export const TraceStepDetail: React.FC<TraceStepDetailProps> = ({ trace }) => {
  if (!trace) return null;

  return (
    <div className="trace-detail">
      {trace.steps.map((step, i) => (
        <div key={i} className={`trace-step ${STAGE_CSS[step.stage]}`}>
          <span className="trace-step__label">{STAGE_NAMES[step.stage]}</span>
          <span className="trace-step__char" style={{ color: 'var(--text-accent)' }}>
            {step.charIn}
          </span>
          {step.charIn !== step.charOut && (
            <>
              <span className="trace-step__arrow">↓</span>
              <span className="trace-step__char" style={{ color: 'var(--text-primary)' }}>
                {step.charOut}
              </span>
            </>
          )}
          {step.componentState.kind === 'rotor' && (
            <span className="text-mono text-xs text-muted mt-sm">
              {step.componentState.rotorType} · pos:{step.componentState.position}
            </span>
          )}
          {step.componentState.kind === 'reflector' && (
            <span className="text-mono text-xs text-muted mt-sm">
              UKW-{step.componentState.reflectorType}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
