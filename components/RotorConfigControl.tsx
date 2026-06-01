/**
 * RotorConfigControl — Individual rotor configuration.
 * Migrated from Tailwind to vanilla CSS design system.
 */

import React from 'react';
import { RotorSetting } from '../types/enigma.types';
import { AVAILABLE_ROTORS_LIST, ALPHABET, RotorName } from '../constants';

interface RotorConfigControlProps {
  rotorSetting: RotorSetting;
  onRotorSettingChange: (updatedRotorSetting: RotorSetting) => void;
  rotorLabel: string;
}

const RotorConfigControl: React.FC<RotorConfigControlProps> = ({
  rotorSetting,
  onRotorSettingChange,
  rotorLabel,
}) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRotorSettingChange({ ...rotorSetting, type: e.target.value as RotorName });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRotorSettingChange({ ...rotorSetting, initialPosition: parseInt(e.target.value) });
  };

  const handleRingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRotorSettingChange({ ...rotorSetting, ringSetting: parseInt(e.target.value) });
  };

  return (
    <div className="rotor-config">
      <div className="rotor-config__label">{rotorLabel}</div>

      <div>
        <label className="label">Rotor</label>
        <select className="select" value={rotorSetting.type} onChange={handleTypeChange}>
          {AVAILABLE_ROTORS_LIST.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Position</label>
        <select className="select" value={rotorSetting.initialPosition} onChange={handlePositionChange}>
          {ALPHABET.split('').map((letter, i) => (
            <option key={i} value={i}>{letter} ({i})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Ring Setting</label>
        <select className="select" value={rotorSetting.ringSetting} onChange={handleRingChange}>
          {ALPHABET.split('').map((letter, i) => (
            <option key={i} value={i}>{letter} ({i})</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RotorConfigControl;
