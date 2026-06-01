import React, { useMemo } from 'react';
import { generateMenuGraph } from '../../utils/bombeGraph';

interface CribGraphProps {
  ciphertext: string;
  crib: string;
}

export const CribGraph: React.FC<CribGraphProps> = ({ ciphertext, crib }) => {
  const graph = useMemo(() => generateMenuGraph(ciphertext, crib), [ciphertext, crib]);

  const SVG_SIZE = 400;
  const CENTER = SVG_SIZE / 2;
  const RADIUS = 150;

  const nodeCoords = useMemo(() => {
    const coords = new Map<string, { x: number, y: number }>();
    const count = graph.nodes.length;
    graph.nodes.forEach((node, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      coords.set(node, {
        x: CENTER + Math.cos(angle) * RADIUS,
        y: CENTER + Math.sin(angle) * RADIUS
      });
    });
    return coords;
  }, [graph.nodes]);

  // Determine if there is a crash (a letter mapped to itself, impossible in Enigma)
  const hasCrash = graph.edges.some(e => e.from === e.to);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex justify-between items-end border-b border-[var(--color-primary-dim)] pb-1">
        <h3 className="text-xs tracking-[0.2em] font-mono text-[var(--color-primary)] uppercase">
          Turing Bombe Graph (Menu)
        </h3>
        <div className="text-xs font-mono flex gap-3">
          <span className="text-[var(--color-text-muted)]">
            LOOPS: <span className="text-[var(--color-primary)]">{graph.loops.length}</span>
          </span>
          {hasCrash && <span className="text-red-500 font-bold">CRIB CRASH DETECTED</span>}
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center bg-black rounded border border-[var(--color-surface-lighter)] p-2">
        {graph.nodes.length === 0 ? (
          <span className="text-mono text-sm text-[var(--color-text-muted)] opacity-50">
            ENTER CRIB TO GENERATE GRAPH
          </span>
        ) : (
          <svg width="100%" height="100%" viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} preserveAspectRatio="xMidYMid meet">
            {/* Draw edges */}
            {graph.edges.map((edge, i) => {
              const start = nodeCoords.get(edge.from);
              const end = nodeCoords.get(edge.to);
              if (!start || !end) return null;
              
              // If it's a crash
              if (start === end) {
                return (
                  <circle
                    key={i}
                    cx={start.x} cy={start.y - 15} r={10}
                    fill="none" stroke="red" strokeWidth={2}
                  />
                );
              }

              return (
                <g key={i}>
                  <line
                    x1={start.x} y1={start.y}
                    x2={end.x} y2={end.y}
                    stroke="var(--accent-gold)"
                    strokeWidth={2}
                    opacity={0.6}
                  />
                  {/* Position Label */}
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 4}
                    fill="var(--accent-gold)"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                  >
                    {edge.position}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {graph.nodes.map(node => {
              const coord = nodeCoords.get(node);
              if (!coord) return null;
              return (
                <g key={node}>
                  {/* Hanko Seal */}
                  <rect
                    x={coord.x - 14} y={coord.y - 14}
                    width={28} height={28} rx={6} ry={6}
                    fill="var(--accent-cinnabar)"
                    stroke="var(--accent-gold)"
                    strokeWidth={2}
                  />
                  <text
                    x={coord.x} y={coord.y + 5}
                    fill="#ffffff"
                    fontSize={14}
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
