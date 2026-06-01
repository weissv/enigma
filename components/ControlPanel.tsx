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
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rotorSettings,
  reflectorType,
  plugboardConfig,
  onRotorSettingChange,
  onReflectorTypeChange,
  onPlugboardChange,
  onReset,
}) => {
  const rotorLabels = ['Left (L)', 'Middle (M)', 'Right (R)'];

  return (
    <Panel title="Machine Configuration">
      <div className="rotor-grid">
        {rotorSettings.map((setting, index) => (
          <RotorConfigControl
            key={setting.id}
            rotorSetting={setting}
            onRotorSettingChange={onRotorSettingChange}
            rotorLabel={rotorLabels[index]}
          />
        ))}
      </div>
      <div className="reflector-config">
        <ReflectorConfigControl
          reflectorType={reflectorType}
          onReflectorTypeChange={onReflectorTypeChange}
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
