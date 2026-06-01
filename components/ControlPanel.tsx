/**
 * ControlPanel — Machine configuration panel.
 * Migrated from Tailwind to vanilla CSS design system.
 */

import React from 'react';
import { RotorSetting } from '../types/enigma.types';
import { ReflectorName } from '../constants';
import RotorConfigControl from './RotorConfigControl';
import ReflectorConfigControl from './ReflectorConfigControl';
import { SteckerbrettConfig } from './SteckerbrettConfig';
import { Panel } from './shared/Panel';

interface ControlPanelProps {
  rotorSettings: RotorSetting[];
  reflectorType: ReflectorName;
  plugboardConfig: Record<string, string>;
  onRotorSettingChange: (updatedRotorSetting: RotorSetting) => void;
  onReflectorTypeChange: (newReflector: ReflectorName) => void;
  onPlugboardChange: (config: Record<string, string>) => void;
  onReset: () => void;
  machineType: 'M3' | 'M4';
  onMachineTypeChange: (type: 'M3' | 'M4') => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rotorSettings,
  reflectorType,
  plugboardConfig,
  onRotorSettingChange,
  onReflectorTypeChange,
  onPlugboardChange,
  onReset,
  machineType,
  onMachineTypeChange,
}) => {
  const rotorLabelsM3 = ['Left (L)', 'Middle (M)', 'Right (R)'];
  const rotorLabelsM4 = ['Fourth (4)', 'Left (L)', 'Middle (M)', 'Right (R)'];
  const rotorLabels = machineType === 'M4' ? rotorLabelsM4 : rotorLabelsM3;

  return (
    <Panel title="Machine Configuration">
      <div className="flex justify-between items-center mb-md pb-sm border-b" style={{ borderBottom: '1px solid var(--border-dim)' }}>
        <div className="text-mono text-sm text-accent">MODEL</div>
        <div className="flex gap-sm">
          <button 
            className={`btn btn--sm ${machineType === 'M3' ? 'btn--primary' : ''}`}
            onClick={() => onMachineTypeChange('M3')}
          >
            M3 WEHRMACHT
          </button>
          <button 
            className={`btn btn--sm ${machineType === 'M4' ? 'btn--primary' : ''}`}
            onClick={() => onMachineTypeChange('M4')}
          >
            M4 KRIEGSMARINE
          </button>
        </div>
      </div>
      <div className="rotor-grid" style={{ gridTemplateColumns: `repeat(${rotorSettings.length}, 1fr)` }}>
        {rotorSettings.map((setting, index) => (
          <RotorConfigControl
            key={setting.id}
            rotorSetting={setting}
            onRotorSettingChange={onRotorSettingChange}
            rotorLabel={rotorLabels[index]}
            isFourthRotor={machineType === 'M4' && index === 0}
          />
        ))}
      </div>
      <div className="reflector-config">
        <ReflectorConfigControl
          reflectorType={reflectorType}
          onReflectorTypeChange={onReflectorTypeChange}
          machineType={machineType}
        />
        <button className="btn btn--danger btn--sm" onClick={onReset}>
          Reset All
        </button>
      </div>
      <div style={{ marginTop: 'var(--gap-md)' }}>
        <SteckerbrettConfig config={plugboardConfig} onChange={onPlugboardChange} />
      </div>
    </Panel>
  );
};
