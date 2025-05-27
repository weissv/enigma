
import React from 'react';
import { AVAILABLE_REFLECTORS_LIST, ReflectorName } from '../constants';

interface ReflectorConfigControlProps {
  reflectorType: ReflectorName;
  onReflectorTypeChange: (newReflector: ReflectorName) => void;
}

const ReflectorConfigControl: React.FC<ReflectorConfigControlProps> = ({ reflectorType, onReflectorTypeChange }) => {
  const handleReflectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onReflectorTypeChange(e.target.value as ReflectorName);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow border border-gray-700">
      <h3 className="text-md font-semibold text-cyan-400 mb-2">Reflector</h3>
      <div>
        <label htmlFor="reflector-type" className="block text-sm font-medium text-slate-300 mb-1">Type</label>
        <select
          id="reflector-type"
          value={reflectorType}
          onChange={handleReflectorChange}
          className="block w-full p-2.5 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500 rounded-md shadow-sm appearance-none"
        >
          {AVAILABLE_REFLECTORS_LIST.map((refName) => (
            <option key={refName} value={refName}>
              Reflector {refName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReflectorConfigControl;
