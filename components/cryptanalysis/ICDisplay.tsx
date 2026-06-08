/**
 * ICDisplay — Index of Coincidence metric with visual meter
 * and semantic interpretation.
 */

import React from 'react';
import type { ICResult } from '../../types/cryptanalysis.types';
import { ICInterpretation } from '../../types/cryptanalysis.types';

interface ICDisplayProps {
  icResult: ICResult | null;
}

const IC_COLORS: Record<ICInterpretation, string> = {
  [ICInterpretation.RANDOM]:         'var(--accent-red)',
  [ICInterpretation.POLYALPHABETIC]: 'var(--accent-amber)',
  [ICInterpretation.WEAK_CIPHER]:    'var(--accent-purple)',
  [ICInterpretation.MONOALPHABETIC]: 'var(--accent-cyan)',
  [ICInterpretation.NATURAL_LANG]:   'var(--accent-green)',
};

const IC_LABELS: Record<ICInterpretation, string> = {
  [ICInterpretation.RANDOM]:         'Random / Noise',
  [ICInterpretation.POLYALPHABETIC]: 'Polyalphabetic Cipher',
  [ICInterpretation.WEAK_CIPHER]:    'Weak Cipher',
  [ICInterpretation.MONOALPHABETIC]: 'Monoalphabetic Cipher',
  [ICInterpretation.NATURAL_LANG]:   'Natural Language',
};

const IC_CSS: Record<ICInterpretation, string> = {
  [ICInterpretation.RANDOM]:         'ic-value--random',
  [ICInterpretation.POLYALPHABETIC]: 'ic-value--poly',
  [ICInterpretation.WEAK_CIPHER]:    'ic-value--weak',
  [ICInterpretation.MONOALPHABETIC]: 'ic-value--mono',
  [ICInterpretation.NATURAL_LANG]:   'ic-value--natural',
};

export const ICDisplay: React.FC<ICDisplayProps> = ({ icResult }) => {
  if (!icResult) {
    return (
      <div className="ic-display" style={{ flexWrap: 'wrap' }}>
        <span className="text-mono text-sm text-muted">IC data unavailable</span>
      </div>
    );
  }

  const ic = icResult.indexOfCoincidence;
  const interp = icResult.interpretation;
  const color = IC_COLORS[interp];

  // Map IC to meter width: 0.0 → 0%, 0.08 → 100%
  const meterPercent = Math.min(100, Math.max(0, (ic / 0.08) * 100));

  return (
    <div className="ic-display" style={{ flexWrap: 'wrap' }}>
      <div className="ic-meta">
        <span className="ic-meta__label">Index of Coincidence</span>
        <span className={`ic-value ${IC_CSS[interp]}`}>
          {ic.toFixed(4)}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--gap-xs)' }}>
        <div className="ic-meter">
          <div
            className="ic-meter__fill"
            style={{ width: `${meterPercent}%`, background: color }}
          />
          {/* Reference markers */}
          <div style={{
            position: 'absolute',
            left: `${(0.038 / 0.08) * 100}%`,
            top: 0,
            width: 1,
            height: '100%',
            background: 'var(--text-muted)',
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute',
            left: `${(0.067 / 0.08) * 100}%`,
            top: 0,
            width: 1,
            height: '100%',
            background: 'var(--accent-green)',
            opacity: 0.5,
          }} />
        </div>
        <div className="flex justify-between text-mono text-xs">
          <span style={{ color }}>
            {IC_LABELS[interp]}
          </span>
          <span className="text-muted">
            N={icResult.textLength}
          </span>
        </div>
      </div>
    </div>
  );
};
