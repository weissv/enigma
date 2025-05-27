
import React from 'react';
import { RotorSetting } from '../types';
import { AVAILABLE_ROTORS_LIST, RotorName } from '../constants';
import LetterSelect from './LetterSelect';

interface RotorConfigControlProps {
  rotorSetting: RotorSetting;
  onRotorSettingChange: (newSetting: RotorSetting) => void;
  rotorLabel: string; // e.g., "Rotor 1 (Leftmost)"
}

const RotorConfigControl: React.FC<RotorConfigControlProps> = ({ rotorSetting, onRotorSettingChange, rotorLabel }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRotorSettingChange({ ...rotorSetting, type: e.target.value as RotorName });
  };

  const handlePositionChange = (newPosition: number) => {
    onRotorSettingChange({ ...rotorSetting, initialPosition: newPosition });
  };

  const handleRingChange = (newRingSetting: number) => {
    onRotorSettingChange({ ...rotorSetting, ringSetting: newRingSetting });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow space-y-3 border border-gray-700">
      <h3 className="text-md font-semibold text-cyan-400">{rotorLabel}</h3>
      <div className="flex flex-col space-y-2">
        <div>
          <label htmlFor={`rotor-type-${rotorSetting.id}`} className="block text-sm font-medium text-slate-300 mb-1">Type</label>
          <select
            id={`rotor-type-${rotorSetting.id}`}
            value={rotorSetting.type}
            onChange={handleTypeChange}
            className="block w-full p-2.5 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500 rounded-md shadow-sm appearance-none"
          >
            {AVAILABLE_ROTORS_LIST.map((rotorName) => (
              <option key={rotorName} value={rotorName}>
                Rotor {rotorName}
              </option>
            ))}
          </select>
        </div>
        <LetterSelect
          label="Start Position (A-Z)"
          value={rotorSetting.initialPosition}
          onChange={handlePositionChange}
          idSuffix={rotorSetting.id}
        />
        <LetterSelect
          label="Ring Setting (A-Z)"
          value={rotorSetting.ringSetting}
          onChange={handleRingChange}
          idSuffix={rotorSetting.id}
        />
      </div>
    </div>
  );
};

export default RotorConfigControl;
