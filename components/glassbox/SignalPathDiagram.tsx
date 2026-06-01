/**
 * SignalPathDiagram — SVG visualization of the electrical signal path
 * through the Enigma machine for a single character.
 *
 * Shows: Input → Rotor R → Rotor M → Rotor L → Reflector → L(inv) → M(inv) → R(inv) → Output
 * Each node displays the letter transformation. Active paths are highlighted.
 */

import React from 'react';
import type { SignalTrace } from '../../types/trace.types';
import { TraceStage } from '../../types/trace.types';

interface SignalPathDiagramProps {
  trace: SignalTrace | null;
}

const STAGE_LABELS: Record<TraceStage, string> = {
  [TraceStage.INPUT]:       'IN',
  [TraceStage.PLUGBOARD_FWD]: 'PLUG',
  [TraceStage.ROTOR_R_FWD]: 'R →',
  [TraceStage.ROTOR_M_FWD]: 'M →',
  [TraceStage.ROTOR_L_FWD]: 'L →',
  [TraceStage.ROTOR_4_FWD]: '4 →',
  [TraceStage.REFLECTOR]:   'UKW',
  [TraceStage.ROTOR_4_INV]: '← 4',
  [TraceStage.ROTOR_L_INV]: '← L',
  [TraceStage.ROTOR_M_INV]: '← M',
  [TraceStage.ROTOR_R_INV]: '← R',
  [TraceStage.PLUGBOARD_INV]: 'PLUG',
  [TraceStage.OUTPUT]:      'OUT',
};

const STAGE_COLORS: Record<TraceStage, string> = {
  [TraceStage.INPUT]:       'var(--signal-input)',
  [TraceStage.PLUGBOARD_FWD]: 'var(--signal-forward)',
  [TraceStage.ROTOR_R_FWD]: 'var(--signal-forward)',
  [TraceStage.ROTOR_M_FWD]: 'var(--signal-forward)',
  [TraceStage.ROTOR_L_FWD]: 'var(--signal-forward)',
  [TraceStage.ROTOR_4_FWD]: 'var(--signal-forward)',
  [TraceStage.REFLECTOR]:   'var(--signal-reflector)',
  [TraceStage.ROTOR_4_INV]: 'var(--signal-backward)',
  [TraceStage.ROTOR_L_INV]: 'var(--signal-backward)',
  [TraceStage.ROTOR_M_INV]: 'var(--signal-backward)',
  [TraceStage.ROTOR_R_INV]: 'var(--signal-backward)',
  [TraceStage.PLUGBOARD_INV]: 'var(--signal-backward)',
  [TraceStage.OUTPUT]:      'var(--signal-output)',
};

const NODE_X_POSITIONS = [30, 89, 148, 207, 266, 325, 384, 443, 502, 561, 620];
const SVG_WIDTH = 650;
const SVG_HEIGHT = 120;
const NODE_Y = 50;
const NODE_R = 18;

export const SignalPathDiagram: React.FC<SignalPathDiagramProps> = ({ trace }) => {
  if (!trace) {
    return (
      <div className="signal-path" style={{ textAlign: 'center', padding: 'var(--gap-lg)', color: 'var(--text-muted)' }}>
        <span className="text-mono text-sm">Type a character to see signal path</span>
      </div>
    );
  }

  const steps = trace.steps;

  return (
    <div className="signal-path">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} xmlns="http://www.w3.org/2000/svg">
        {/* Connection lines */}
        {steps.slice(0, -1).map((_step, i) => {
          const x1 = NODE_X_POSITIONS[i] + NODE_R;
          const x2 = NODE_X_POSITIONS[i + 1] - NODE_R;
          const color = STAGE_COLORS[steps[i + 1].stage];
          return (
            <line
              key={`edge-${i}`}
              x1={x1} y1={NODE_Y}
              x2={x2} y2={NODE_Y}
              stroke={color}
              strokeWidth={2}
              opacity={0.6}
            />
          );
        })}

        {/* Arrow heads at midpoints */}
        {steps.slice(0, -1).map((_, i) => {
          const midX = (NODE_X_POSITIONS[i] + NODE_X_POSITIONS[i + 1]) / 2;
          const color = STAGE_COLORS[steps[i + 1].stage];
          return (
            <polygon
              key={`arrow-${i}`}
              points={`${midX - 3},${NODE_Y - 4} ${midX + 3},${NODE_Y} ${midX - 3},${NODE_Y + 4}`}
              fill={color}
              opacity={0.6}
            />
          );
        })}

        {/* Nodes */}
        {steps.map((step, i) => {
          const x = NODE_X_POSITIONS[i];
          const color = STAGE_COLORS[step.stage];
          return (
            <g key={`node-${i}`}>
              {/* Node circle */}
              <circle
                cx={x} cy={NODE_Y} r={NODE_R}
                fill="var(--bg-surface)"
                stroke={color}
                strokeWidth={1.5}
              />
              {/* Letter */}
              <text
                x={x} y={NODE_Y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontFamily="var(--font-mono)"
                fontSize="14"
                fontWeight="700"
              >
                {step.charOut}
              </text>
              {/* Stage label */}
              <text
                x={x} y={NODE_Y + NODE_R + 14}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
                fontSize="8"
                letterSpacing="0.05em"
              >
                {STAGE_LABELS[step.stage]}
              </text>
              {/* Signal index */}
              <text
                x={x} y={NODE_Y - NODE_R - 6}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontFamily="var(--font-mono)"
                fontSize="8"
                opacity={0.6}
              >
                {step.signalOut}
              </text>
            </g>
          );
        })}

        {/* Reflector separator line */}
        <line
          x1={295} y1={NODE_Y - 30}
          x2={295} y2={NODE_Y + 30}
          stroke="var(--signal-reflector)"
          strokeWidth={0.5}
          strokeDasharray="3,3"
          opacity={0.3}
        />
        <line
          x1={355} y1={NODE_Y - 30}
          x2={355} y2={NODE_Y + 30}
          stroke="var(--signal-reflector)"
          strokeWidth={0.5}
          strokeDasharray="3,3"
          opacity={0.3}
        />
      </svg>
    </div>
  );
};
