import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useI18n } from '../../utils/i18n';

interface BigFreeze3DProps {
  currentEntropy: number; // e.g. 0 to 4.7 (max for English is ~4.17, random is 4.7)
  isCracked: boolean;     // Triggers the final crystalline lattice freeze
}

const PARTICLE_COUNT = 3000;
const BOUNDS = 10;

const Particles = ({ currentEntropy, isCracked }: BigFreeze3DProps) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Store original positions, velocities, and target lattice positions
  const { positions, velocities, targets } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const tgt = new Float32Array(PARTICLE_COUNT * 3);
    
    const gridSize = Math.ceil(Math.pow(PARTICLE_COUNT, 1/3));
    const spacing = 1.5;
    const offset = (gridSize * spacing) / 2;

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          if (i >= PARTICLE_COUNT) break;
          
          // Random chaotic initial positions
          pos[i * 3] = (Math.random() - 0.5) * BOUNDS * 2;
          pos[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS * 2;
          pos[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS * 2;
          
          // Random velocities
          vel[i * 3] = (Math.random() - 0.5) * 0.2;
          vel[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
          vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          
          // Strict lattice targets
          tgt[i * 3] = x * spacing - offset;
          tgt[i * 3 + 1] = y * spacing - offset;
          tgt[i * 3 + 2] = z * spacing - offset;
          
          i++;
        }
      }
    }
    return { positions: pos, velocities: vel, targets: tgt };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Update loop
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Normalize entropy to a temperature scale (0 = absolute zero, 1 = max chaos)
    const maxEntropy = 4.7;
    const temp = Math.max(0, Math.min(1, (currentEntropy - 3.5) / (maxEntropy - 3.5)));
    
    // If cracked, temperature immediately drops to 0 (Big Freeze)
    const effectiveTemp = isCracked ? 0 : temp;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      if (effectiveTemp > 0.1) {
        // Brownian motion (Chaos)
        positions[ix] += velocities[ix] * effectiveTemp;
        positions[iy] += velocities[iy] * effectiveTemp;
        positions[iz] += velocities[iz] * effectiveTemp;
        
        // Bounce off bounds
        if (Math.abs(positions[ix]) > BOUNDS) velocities[ix] *= -1;
        if (Math.abs(positions[iy]) > BOUNDS) velocities[iy] *= -1;
        if (Math.abs(positions[iz]) > BOUNDS) velocities[iz] *= -1;
      } else {
        // Big Freeze: Snap to lattice
        positions[ix] += (targets[ix] - positions[ix]) * 0.05;
        positions[iy] += (targets[iy] - positions[iy]) * 0.05;
        positions[iz] += (targets[iz] - positions[iz]) * 0.05;
      }

      dummy.position.set(positions[ix], positions[iy], positions[iz]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Calculate color based on temperature (Red/Cinnabar for hot, Cyan/Blue for cold)
  const colorStr = isCracked ? "#00ffff" : (currentEntropy > 4.2 ? "#e34234" : "#d4af37");

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={colorStr} />
    </instancedMesh>
  );
};

export const BigFreeze3D: React.FC<BigFreeze3DProps> = ({ currentEntropy, isCracked }) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex justify-between items-end border-b border-[var(--border-dim)] pb-1">
        <h3 className="text-xs tracking-[0.2em] font-mono text-[var(--text-accent)] uppercase">
          {t('topologicalEntropy')}
        </h3>
        <span className="text-xs font-mono text-[var(--text-muted)]">
          H: <span className="text-[var(--text-primary)]">{currentEntropy.toFixed(3)}</span>
        </span>
      </div>
      
      <div style={{ width: '100%', height: '350px', background: 'var(--bg-void)', borderRadius: '4px', overflow: 'hidden' }}>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={['#0a0b12']} />
          <ambientLight intensity={0.5} />
          
          <Particles currentEntropy={currentEntropy} isCracked={isCracked} />
          
          <OrbitControls
            autoRotate
            autoRotateSpeed={isCracked ? 1.0 : 4.0}
            enablePan={false}
          />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={isCracked ? 2.0 : 1.0} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
};
