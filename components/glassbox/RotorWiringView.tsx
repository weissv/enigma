/**
 * RotorWiringView — Visualizes the internal wiring mapping of the currently
 * active rotor at the selected trace step.
 */

import React from 'react';
import type { SignalTrace } from '../../types/trace.types';
import { indexToChar } from '../../constants';

interface RotorWiringViewProps {
  trace: SignalTrace | null;
}

export const RotorWiringView: React.FC<RotorWiringViewProps> = ({ trace }) => {
  if (!trace) return null;

  // Show positions at encryption time
  const positions = trace.rotorPositionsAtEncryption;

  return (
    <div className="flex gap-md mt-md" style={{ flexWrap: 'wrap' }}>
      {positions.map((pos, i) => {
        const labels = ['Left', 'Middle', 'Right'];
        const step = trace.steps[3 - i]; // Forward steps are 1,2,3 for R,M,L
        const rotorType = step?.componentState.kind === 'rotor'
          ? step.componentState.rotorType
          : '?';

        return (
          <div key={i} className="rotor-config" style={{ flex: '1', minWidth: '100px' }}>
            <div className="rotor-config__label">{labels[i]} · {rotorType}</div>
            <div className="flex items-center justify-center gap-sm">
              <span className="text-mono text-lg" style={{ color: 'var(--accent-cyan)' }}>
                {indexToChar(pos)}
              </span>
              <span className="text-mono text-xs text-muted">
                ({pos})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
