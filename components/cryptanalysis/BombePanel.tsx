/**
 * BombePanel — Control interface for the Turing Bombe brute-force.
 * Crib input, start/cancel, progress bar.
 */

import React, { useState } from 'react';
import type { BombeConfig } from '../../types/cryptanalysis.types';
import { BombeStatus } from '../../types/cryptanalysis.types';
import { formatNumber } from '../../utils/formatting';

interface BombePanelProps {
  ciphertext: string;
  status: BombeStatus;
  tested: number;
  total: number;
  percentComplete: number;
  error: string | null;
  onStart: (config: BombeConfig) => void;
  onCancel: () => void;
  onReset: () => void;
}



export const BombePanel: React.FC<BombePanelProps> = ({
  ciphertext,
  status,
  tested,
  total,
  percentComplete,
  error,
  onStart,
  onCancel,
  onReset,
}) => {
  const [crib, setCrib] = useState('');
  const [cribPosition, setCribPosition] = useState(0);
  const isRunning = status === BombeStatus.RUNNING;

  const handleStart = (): void => {
    if (!crib.trim() || !ciphertext.trim()) return;
    onStart({
      ciphertext: ciphertext.toUpperCase(),
      crib: crib.toUpperCase(),
      cribPosition,
      timeoutMs: 60000,
    });
  };



  return (
    <div>
      <div className="bombe-controls">
        <div>
          <label className="label" htmlFor="bombe-crib">Crib (Known Plaintext)</label>
          <input
            id="bombe-crib"
            type="text"
            className="input"
            value={crib}
            onChange={(e) => setCrib(e.target.value.toUpperCase())}
            placeholder="e.g. WETTERBERICHT"
            disabled={isRunning}
          />
        </div>
        <div>
          <label className="label" htmlFor="bombe-position">Crib Position</label>
          <input
            id="bombe-position"
            type="number"
            className="input"
            value={cribPosition}
            onChange={(e) => setCribPosition(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            disabled={isRunning}
          />
        </div>
        <div className="flex gap-sm" style={{ alignSelf: 'end' }}>
          {!isRunning ? (
            <button
              className="btn btn--primary"
              onClick={handleStart}
              disabled={!crib.trim() || !ciphertext.trim()}
            >
              Run Bombe
            </button>
          ) : (
            <button className="btn btn--danger" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="btn btn--sm" onClick={onReset} disabled={isRunning}>
            Reset
          </button>
        </div>
      </div>

      {(isRunning || status === BombeStatus.COMPLETED || status === BombeStatus.TIMEOUT) && (
        <div className="bombe-progress">
          <div className="bombe-progress__bar">
            <div
              className="bombe-progress__fill"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="bombe-progress__text">
            <span>{formatNumber(tested)} / {formatNumber(total)} configs</span>
            <span>{percentComplete.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-mono text-sm mt-sm" style={{ color: 'var(--accent-red)' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};
