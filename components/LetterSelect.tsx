
import React from 'react';
import { ALPHABET } from '../constants';

interface LetterSelectProps {
  label: string;
  value: number; // 0-25
  onChange: (newValue: number) => void;
  idSuffix?: string;
}

const LetterSelect: React.FC<LetterSelectProps> = ({ label, value, onChange, idSuffix = '' }) => {
  const selectId = `letter-select-${label.toLowerCase().replace(/\s+/g, '-')}-${idSuffix}`;
  
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="block w-full p-2.5 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-cyan-500 focus:border-cyan-500 rounded-md shadow-sm appearance-none"
      >
        {ALPHABET.split('').map((letter, index) => (
          <option key={letter} value={index}>
            {letter}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LetterSelect;
