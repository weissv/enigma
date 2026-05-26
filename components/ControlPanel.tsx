import React from 'react';
import { RotorSetting } from '../types';
import { ReflectorName } from '../constants';
import RotorConfigControl from './RotorConfigControl';
import ReflectorConfigControl from './ReflectorConfigControl';

interface ControlPanelProps {
  rotorSettings: RotorSetting[];
  reflectorType: ReflectorName;
  onRotorSettingChange: (updatedRotorSetting: RotorSetting) => void;
  onReflectorTypeChange: (newReflector: ReflectorName) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rotorSettings,
  reflectorType,
  onRotorSettingChange,
  onReflectorTypeChange
}) => {
  const rotorLabels = ["Slot 1 (Leftmost)", "Slot 2 (Middle)", "Slot 3 (Rightmost)"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
      {rotorSettings.map((setting, index) => (
        <RotorConfigControl
          key={setting.id}
          rotorSetting={setting}
          onRotorSettingChange={onRotorSettingChange}
          rotorLabel={rotorLabels[index]}
        />
      ))}
      <div className="md:col-span-3">
        <ReflectorConfigControl
          reflectorType={reflectorType}
          onReflectorTypeChange={onReflectorTypeChange}
        />
      </div>
    </div>
  );
};
