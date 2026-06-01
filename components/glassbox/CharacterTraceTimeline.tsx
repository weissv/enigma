/**
 * CharacterTraceTimeline — Clickable character grid for selecting
 * which character's trace to view in the Glass Box.
 */

import React from 'react';
import type { MessageTrace } from '../../types/trace.types';

interface CharacterTraceTimelineProps {
  messageTrace: MessageTrace | null;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const CharacterTraceTimeline: React.FC<CharacterTraceTimelineProps> = ({
  messageTrace,
  selectedIndex,
  onSelect,
}) => {
  if (!messageTrace || messageTrace.traces.length === 0) {
    return null;
  }

  return (
    <div className="trace-timeline">
      {messageTrace.traces.map((trace, i) => (
        <button
          key={i}
          className={`trace-char ${i === selectedIndex ? 'trace-char--selected' : ''}`}
          onClick={() => onSelect(i)}
          title={`${trace.inputChar} → ${trace.outputChar} (char #${i})`}
        >
          {trace.inputChar}
        </button>
      ))}
    </div>
  );
};
