/**
 * FrequencyChart — SVG bar chart showing letter frequencies
 * compared against the English language reference distribution.
 */

import React from 'react';
import type { FrequencyAnalysisResult } from '../../types/cryptanalysis.types';

interface FrequencyChartProps {
  analysis: FrequencyAnalysisResult | null;
}

const CHART_WIDTH = 520;
const CHART_HEIGHT = 160;
const BAR_WIDTH = 14;
const GAP = 6;
const MARGIN = { top: 10, bottom: 24, left: 0, right: 0 };
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ analysis }) => {
  if (!analysis || analysis.totalLetters === 0) {
    return (
      <div className="freq-chart" style={{ textAlign: 'center', padding: 'var(--gap-lg)', color: 'var(--text-muted)' }}>
        <span className="text-mono text-sm">Frequency data will appear as you type</span>
      </div>
    );
  }

  const maxFreq = Math.max(
    ...analysis.frequencies.map(f => Math.max(f.frequency, f.expectedFrequency)),
    0.001
  );
  const scale = PLOT_HEIGHT / maxFreq;

  return (
    <div className="freq-chart">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto' }}
      >
        {/* Horizontal reference lines */}
        {[0.02, 0.06, 0.10].map(v => {
          if (v > maxFreq) return null;
          const y = MARGIN.top + PLOT_HEIGHT - v * scale;
          return (
            <g key={v}>
              <line
                x1={0} y1={y} x2={CHART_WIDTH} y2={y}
                stroke="var(--border-dim)" strokeWidth={0.5}
              />
              <text
                x={CHART_WIDTH - 2} y={y - 2}
                textAnchor="end"
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
                fontSize="7"
                opacity={0.5}
              >
                {(v * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {analysis.frequencies.map((f, i) => {
          const x = i * (BAR_WIDTH + GAP) + GAP;
          const barHeight = f.frequency * scale;
          const expHeight = f.expectedFrequency * scale;
          const barY = MARGIN.top + PLOT_HEIGHT - barHeight;
          const expY = MARGIN.top + PLOT_HEIGHT - expHeight;

          return (
            <g key={f.letter}>
              {/* Expected frequency bar (background) */}
              <rect
                x={x} y={expY}
                width={BAR_WIDTH} height={expHeight}
                className="freq-bar freq-bar--expected"
                rx={1}
              />
              {/* Observed frequency bar */}
              <rect
                x={x + 2} y={barY}
                width={BAR_WIDTH - 4} height={barHeight}
                className="freq-bar freq-bar--observed"
                rx={1}
              />
              {/* Letter label */}
              <text
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT - 4}
                className="freq-label"
              >
                {f.letter}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-mono text-xs text-muted mt-sm" style={{ padding: '0 var(--gap-sm)' }}>
        <span>N = {analysis.totalLetters}</span>
        <span>χ² = {analysis.chiSquared.toFixed(2)}</span>
        <span>
          <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--accent-cyan)', borderRadius: 1, marginRight: 4, verticalAlign: 'middle' }} />
          Observed
          <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--text-muted)', opacity: 0.3, borderRadius: 1, marginLeft: 12, marginRight: 4, verticalAlign: 'middle' }} />
          English ref
        </span>
      </div>
    </div>
  );
};
