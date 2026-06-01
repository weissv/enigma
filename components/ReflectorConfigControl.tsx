/**
 * ReflectorConfigControl — Reflector type selection.
 * Migrated from Tailwind to vanilla CSS design system.
 */

import React from 'react';
import { AVAILABLE_REFLECTORS_LIST, ReflectorName } from '../constants';

interface ReflectorConfigControlProps {
  reflectorType: ReflectorName;
  onReflectorTypeChange: (newReflector: ReflectorName) => void;
}

const ReflectorConfigControl: React.FC<ReflectorConfigControlProps> = ({
  reflectorType,
  onReflectorTypeChange,
}) => {
  return (
    <div className="flex items-center gap-md" style={{ flex: 1 }}>
      <label className="label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Reflector (UKW)</label>
      <select
        className="select"
        value={reflectorType}
        onChange={(e) => onReflectorTypeChange(e.target.value as ReflectorName)}
        style={{ maxWidth: '120px' }}
      >
        {AVAILABLE_REFLECTORS_LIST.map(r => (
          <option key={r} value={r}>UKW-{r}</option>
        ))}
      </select>
    </div>
  );
};

export default ReflectorConfigControl;
