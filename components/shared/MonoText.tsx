/**
 * MonoText — Monospaced text block with optional character highlighting.
 */

import React from 'react';

interface MonoTextProps {
  text: string;
  highlightIndex?: number;
  highlightColor?: string;
  grouped?: boolean;
  groupSize?: number;
}

export const MonoText: React.FC<MonoTextProps> = ({
  text,
  highlightIndex,
  highlightColor = 'var(--accent-green)',
  grouped = false,
  groupSize = 5,
}) => {
  const chars = text.split('');

  return (
    <span className="text-mono" style={{ wordBreak: 'break-all', lineHeight: 1.8 }}>
      {chars.map((char, i) => {
        const isHighlighted = highlightIndex !== undefined && i === highlightIndex;
        const addSpace = grouped && i > 0 && i % groupSize === 0;
        return (
          <React.Fragment key={i}>
            {addSpace && <span style={{ width: '0.4em', display: 'inline-block' }}> </span>}
            <span
              style={{
                color: isHighlighted ? highlightColor : undefined,
                fontWeight: isHighlighted ? 700 : undefined,
                textDecoration: isHighlighted ? 'underline' : undefined,
                textDecorationColor: isHighlighted ? highlightColor : undefined,
                textUnderlineOffset: '3px',
              }}
            >
              {char}
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );
};
