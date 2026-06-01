import React, { useEffect, useState } from 'react';
import type { TelemetryPayload } from '../../types/worker.types';
import { ALPHABET } from '../../constants';
import { BombeStatus } from '../../types/cryptanalysis.types';

interface BombeTelemetryViewProps {
  telemetry: TelemetryPayload | null;
  status: BombeStatus;
}

export const BombeTelemetryView: React.FC<BombeTelemetryViewProps> = ({ telemetry, status }) => {
  const [iocHistory, setIocHistory] = useState<{ x: number; current: number; best: number }[]>([]);

  useEffect(() => {
    if (!telemetry) {
      setIocHistory([]);
      return;
    }

    setIocHistory((prev) => {
      // If we jump back to iteration 1, it means a new position is being evaluated.
      // We clear the graph for the new local hill climb.
      if (telemetry.currentIteration === 1 || (prev.length > 0 && telemetry.currentIteration < prev[prev.length - 1].x)) {
        return [{ x: telemetry.currentIteration, current: telemetry.currentIoC, best: telemetry.bestIoC }];
      }
      return [...prev, { x: telemetry.currentIteration, current: telemetry.currentIoC, best: telemetry.bestIoC }];
    });
  }, [telemetry]);

  if (!telemetry && status !== BombeStatus.RUNNING) {
    return null;
  }

  // Formatting graph lines
  const MAX_ITER = telemetry?.maxIterations || 150;
  const GRAPH_WIDTH = 400;
  const GRAPH_HEIGHT = 100;
  const Y_MIN = 0.03;
  const Y_MAX = 0.08;

  const mapX = (iter: number) => (iter / MAX_ITER) * GRAPH_WIDTH;
  const mapY = (val: number) => {
    const clamped = Math.max(Y_MIN, Math.min(Y_MAX, val));
    const normalized = (clamped - Y_MIN) / (Y_MAX - Y_MIN);
    return GRAPH_HEIGHT - normalized * GRAPH_HEIGHT;
  };

  const currentPoints = iocHistory.map(p => `${mapX(p.x)},${mapY(p.current)}`).join(' ');
  const bestPoints = iocHistory.map(p => `${mapX(p.x)},${mapY(p.best)}`).join(' ');

  const plugboard = telemetry?.currentPlugboard || {};

  return (
    <div className="telemetry-view border-panel mt-md p-md" style={{ background: 'var(--surface-color)' }}>
      <h3 className="text-mono text-sm mb-sm text-accent" style={{ color: 'var(--accent-amber)' }}>
        <span className="blinking-cursor">_</span> HILL CLIMBING TELEMETRY (LIVE)
      </h3>
      
      {/* Fitness Graph */}
      <div className="mb-md">
        <div className="text-xs text-muted mb-xs flex" style={{ justifyContent: 'space-between' }}>
          <span>Fitness Score (IoC)</span>
          <span>Iter: {telemetry?.currentIteration || 0}/{MAX_ITER}</span>
        </div>
        <svg width="100%" height={GRAPH_HEIGHT} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} preserveAspectRatio="none" style={{ background: 'var(--surface-sunken)', border: '1px solid var(--border-color)', display: 'block' }}>
          {/* Grid lines */}
          <line x1="0" y1={mapY(0.06)} x2={GRAPH_WIDTH} y2={mapY(0.06)} stroke="var(--accent-green)" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
          <text x="5" y={mapY(0.06) - 5} fill="var(--accent-green)" fontSize="10" opacity="0.5" fontFamily="monospace">Target (0.060)</text>
          
          <line x1="0" y1={mapY(0.04)} x2={GRAPH_WIDTH} y2={mapY(0.04)} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2,2" opacity="0.2" />
          <text x="5" y={mapY(0.04) - 5} fill="var(--text-muted)" fontSize="10" opacity="0.5" fontFamily="monospace">Random (0.038)</text>

          <polyline points={currentPoints} fill="none" stroke="var(--accent-amber)" strokeWidth="1" opacity="0.4" />
          <polyline points={bestPoints} fill="none" stroke="var(--accent-green)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 2px var(--accent-green))' }} />
        </svg>
      </div>

      {/* Steckerbrett Matrix */}
      <div className="mb-md">
        <div className="text-xs text-muted mb-xs">Mutating Steckerbrett</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: '4px' }}>
          {ALPHABET.split('').map(char => {
            const isPlugged = char in plugboard;
            const target = plugboard[char];
            return (
              <div 
                key={char}
                style={{ 
                  textAlign: 'center', 
                  fontSize: '10px',
                  padding: '4px 0',
                  background: isPlugged ? 'var(--accent-green)' : 'var(--surface-sunken)',
                  color: isPlugged ? '#000' : 'var(--text-muted)',
                  border: `1px solid ${isPlugged ? 'var(--accent-green)' : 'var(--border-color)'}`,
                  transition: 'background 0.05s ease-out, color 0.05s ease-out',
                  fontFamily: 'monospace',
                  fontWeight: isPlugged ? 'bold' : 'normal',
                }}
                title={isPlugged ? `${char} ↔ ${target}` : undefined}
              >
                {char}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Decrypt Stream */}
      <div>
        <div className="text-xs text-muted mb-xs flex" style={{ justifyContent: 'space-between' }}>
          <span>Decryption Stream</span>
          {telemetry && (
            <span style={{ color: telemetry.bestIoC > 0.060 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
              Best IoC: {telemetry.bestIoC.toFixed(4)}
            </span>
          )}
        </div>
        <div 
          className="text-mono" 
          style={{ 
            background: 'var(--surface-sunken)', 
            padding: 'var(--gap-sm)', 
            fontSize: '12px', 
            height: '80px', 
            overflow: 'hidden',
            wordWrap: 'break-word',
            color: (telemetry?.bestIoC || 0) > 0.060 ? 'var(--accent-green)' : 'var(--text-main)',
            border: '1px solid var(--border-color)',
            lineHeight: 1.4,
          }}
        >
          {telemetry?.currentDecryptedText || 'WAITING FOR PROMISING POSITIONS...'}
        </div>
      </div>
    </div>
  );
};
