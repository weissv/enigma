import React, { useMemo, useEffect, useRef } from 'react';
import { calculateShannonEntropy, generateEntropyHeatmap } from '../../utils/shannon';

interface ShannonHeatmapProps {
  ciphertext: string;
  decryptedText: string;
}

export const ShannonHeatmap: React.FC<ShannonHeatmapProps> = ({ ciphertext, decryptedText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate overall entropy
  const cipherEntropy = useMemo(() => calculateShannonEntropy(ciphertext), [ciphertext]);
  const currentEntropy = useMemo(() => calculateShannonEntropy(decryptedText), [decryptedText]);

  // Generate heatmap array (sliding window)
  const heatmapData = useMemo(() => {
    return generateEntropyHeatmap(decryptedText, 15, 3); // Window 15, step 3
  }, [decryptedText]);

  // Render heatmap to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (heatmapData.length === 0) return;

    const blockWidth = width / heatmapData.length;
    
    // Theoretical max for 26 chars is ~4.7
    const maxH = 4.7;
    // English is roughly 4.1. Let's map 3.8 - 4.7 to colors.
    
    heatmapData.forEach((h, i) => {
      // Normalize between 3.5 and 4.7
      const normalized = Math.max(0, Math.min(1, (h - 3.5) / (4.7 - 3.5)));
      
      // Color scale: High entropy (white noise) = Red/Orange
      // Low entropy (structure) = Cyan/Blue
      // Let's use HSL: Hue from 200 (Blue) to 0 (Red)
      const hue = (1 - normalized) * 200;
      
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      ctx.fillRect(i * blockWidth, 0, blockWidth, height);
      
      // Add subtle glow or grid line
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(i * blockWidth + blockWidth - 1, 0, 1, height);
    });

  }, [heatmapData]);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex justify-between items-end border-b border-[var(--color-primary-dim)] pb-1">
        <h3 className="text-xs tracking-[0.2em] font-mono text-[var(--color-primary)] uppercase">
          Shannon Entropy Matrix
        </h3>
        <div className="text-xs font-mono flex gap-3">
          <span className="text-[var(--color-text-muted)]">
            CYPHER: <span className="text-[var(--color-primary)]">{cipherEntropy.toFixed(3)}</span>
          </span>
          <span className="text-[var(--color-text-muted)]">
            CURRENT: <span className={currentEntropy < 4.2 ? "text-cyan-400 font-bold" : "text-amber-500"}>{currentEntropy.toFixed(3)}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 relative min-h-[40px] rounded overflow-hidden border border-[var(--color-surface-lighter)] bg-black">
        <canvas
          ref={canvasRef}
          width={800}
          height={100}
          className="absolute inset-0 w-full h-full opacity-80 mix-blend-screen"
        />
        {/* Overlay a scanning line effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
      </div>
      <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider flex justify-between">
        <span>Organized Structure (Blue)</span>
        <span>White Noise (Red)</span>
      </div>
    </div>
  );
};
