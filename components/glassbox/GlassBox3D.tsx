import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, CatmullRomLine, Edges, MeshTransmissionMaterial } from '@react-three/drei';
import type { SignalTrace } from '../../types/trace.types';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface GlassBox3DProps {
  trace: SignalTrace | null;
}

const X_POSITIONS = {
  INPUT: 4,
  PLUGBOARD: 3,
  ROTOR_R: 1.5,
  ROTOR_M: 0,
  ROTOR_L: -1.5,
  ROTOR_4: -3,
  REFLECTOR: -4.5
};

const Z_POSITIONS = {
  FRONT: 1.5,
  BACK: -1.5
};

function getCoord(stageStr: string, signalIndex: number): [number, number, number] {
  // Convert 0-25 signal index to angle on the cylinder
  const angle = (signalIndex / 26) * Math.PI * 2;
  const radius = 1.2;
  
  // y, z coordinates based on angle
  const y = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  if (stageStr.includes('INPUT') || stageStr.includes('OUTPUT')) return [X_POSITIONS.INPUT, y, z];
  if (stageStr.includes('PLUGBOARD')) return [X_POSITIONS.PLUGBOARD, y, z];
  if (stageStr.includes('ROTOR_R')) return [X_POSITIONS.ROTOR_R, y, z];
  if (stageStr.includes('ROTOR_M')) return [X_POSITIONS.ROTOR_M, y, z];
  if (stageStr.includes('ROTOR_L')) return [X_POSITIONS.ROTOR_L, y, z];
  if (stageStr.includes('ROTOR_4')) return [X_POSITIONS.ROTOR_4, y, z];
  if (stageStr.includes('REFLECTOR')) return [X_POSITIONS.REFLECTOR, y, z];
  
  return [0, 0, 0];
}

const RotorCylinder = ({ position, label }: { position: [number, number, number], label: string }) => {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[1.3, 1.3, 0.8, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          temporalDistortion={0.2}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#10121d"
          color="#d4af37"
          transparent
          opacity={0.8}
        />
        <Edges scale={1} threshold={15} color="rgba(212, 175, 55, 0.4)" />
      </mesh>
    </group>
  );
};

const FlatPanel = ({ position, label, isReflector }: { position: [number, number, number], label: string, isReflector?: boolean }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 3, 3]} />
        <meshStandardMaterial color={isReflector ? "#5a1814" : "#1a1c29"} transparent opacity={0.6} metalness={0.8} roughness={0.2} />
        <Edges scale={1.01} color={isReflector ? "#e34234" : "rgba(212, 175, 55, 0.3)"} />
      </mesh>
    </group>
  );
};

const SignalPath = ({ trace }: { trace: SignalTrace }) => {
  const points = useMemo(() => {
    return trace.steps.map(step => {
      return new THREE.Vector3(...getCoord(step.stage, step.signalOut));
    });
  }, [trace]);

  if (points.length < 2) return null;

  return (
    <group>
      <CatmullRomLine
        points={points}
        color="#e34234" // Cinnabar red for the signal trace
        lineWidth={3}
        dashed={false}
        tension={0.5} // Creates flowing bezier-like curves
      />
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#d4af37" /> {/* Gold nodes */}
        </mesh>
      ))}
    </group>
  );
};

export const GlassBox3D: React.FC<GlassBox3DProps> = ({ trace }) => {
  return (
    <div style={{ width: '100%', height: '350px', background: '#0a0b12', borderRadius: '4px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [3, 3, 5], fov: 50 }}>
        <color attach="background" args={['#0a0b12']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#d4af37" />
        <spotLight position={[-10, -10, -10]} intensity={2} color="#e34234" />

        <group position={[0.5, 0, 0]}>
          <FlatPanel position={[X_POSITIONS.INPUT, 0, 0]} label="I/O" />
          <FlatPanel position={[X_POSITIONS.PLUGBOARD, 0, 0]} label="Steckerbrett" />
          <RotorCylinder position={[X_POSITIONS.ROTOR_R, 0, 0]} label="Rotor R" />
          <RotorCylinder position={[X_POSITIONS.ROTOR_M, 0, 0]} label="Rotor M" />
          <RotorCylinder position={[X_POSITIONS.ROTOR_L, 0, 0]} label="Rotor L" />
          {/* We render a 4th rotor if the trace indicates M4 (wait, we can just conditionally render it if it has trace or just always render it) */}
          <RotorCylinder position={[X_POSITIONS.ROTOR_4, 0, 0]} label="Rotor 4" />
          <FlatPanel position={[X_POSITIONS.REFLECTOR, 0, 0]} label="Reflector" isReflector />

          {trace && <SignalPath trace={trace} />}
        </group>

        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.5}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} opacity={1} intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
