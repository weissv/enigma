/**
 * SteckerbrettConfig — Brutalist UI for the Enigma Plugboard.
 * Allows users to connect pairs of letters (e.g., A-Z, B-X).
 */

import React, { useState } from 'react';
import type { PlugboardConfig } from '../types/enigma.types';

interface SteckerbrettConfigProps {
  config: PlugboardConfig;
  onChange: (newConfig: PlugboardConfig) => void;
}

export const SteckerbrettConfig: React.FC<SteckerbrettConfigProps> = ({ config, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pairs = Object.entries(config);
  const isFull = pairs.length >= 13;

  const handleAdd = () => {
    setError(null);
    const val = inputValue.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (val.length !== 2) {
      setError('Pair must be exactly 2 letters.');
      return;
    }

    const [a, b] = val;
    if (a === b) {
      setError('Cannot connect a letter to itself.');
      return;
    }

    // Check if either letter is already used
    const used = new Set(Object.entries(config).flat());
    if (used.has(a)) {
      setError(`Letter ${a} is already connected.`);
      return;
    }
    if (used.has(b)) {
      setError(`Letter ${b} is already connected.`);
      return;
    }

    onChange({ ...config, [a]: b });
    setInputValue('');
  };

  const handleRemove = (key: string) => {
    const newConfig = { ...config };
    delete newConfig[key];
    onChange(newConfig);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isFull) {
      handleAdd();
    }
  };

  return (
    <div className="steckerbrett-config" style={{ border: '1px solid var(--border-dim)', padding: 'var(--gap-md)', background: 'rgba(0, 0, 0, 0.2)' }}>
      <div className="flex justify-between items-center mb-sm">
        <span className="text-mono text-sm" style={{ color: 'var(--text-accent)' }}>
          STECKERBRETT (PLUGBOARD)
        </span>
        <span className="text-mono text-xs text-muted">
          {pairs.length}/13 PAIRS
        </span>
      </div>

      <div className="flex gap-sm items-start mb-md" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            className="input text-mono"
            style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}
            placeholder={isFull ? 'MAX CAPACITY' : 'E.G. AB'}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2));
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isFull}
          />
          {error && <div className="text-mono text-xs mt-xs" style={{ color: 'var(--accent-red)' }}>{error}</div>}
        </div>
        <button
          className="btn btn--primary"
          onClick={handleAdd}
          disabled={isFull || inputValue.length !== 2}
        >
          PLUG
        </button>
      </div>

      {pairs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 'var(--gap-sm)' }}>
          {pairs.map(([a, b]) => (
            <div key={`${a}-${b}`} className="flex items-center justify-between" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-dim)', padding: '2px 6px' }}>
              <span className="text-mono text-sm">
                {a}<span style={{ opacity: 0.5 }}>-</span>{b}
              </span>
              <button
                onClick={() => handleRemove(a)}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}
                title="Unplug"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-mono text-xs text-muted" style={{ textAlign: 'center', padding: 'var(--gap-sm) 0' }}>
          NO CABLES CONNECTED
        </div>
      )}
    </div>
  );
};
