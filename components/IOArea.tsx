/**
 * IOArea — Input/Output text areas.
 * Migrated from Tailwind to vanilla CSS design system.
 */

import React from 'react';

interface IOAreaProps {
  inputText: string;
  outputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const IOArea: React.FC<IOAreaProps> = ({ inputText, outputText, onInputChange }) => {
  return (
    <div className="io-grid">
      <div className="io-column">
        <label htmlFor="input-text" className="label">Plaintext Input</label>
        <textarea
          id="input-text"
          rows={6}
          value={inputText}
          onChange={onInputChange}
          placeholder="TYPE YOUR MESSAGE HERE (A-Z)..."
          className="textarea"
        />
      </div>
      <div className="io-column">
        <label htmlFor="output-text" className="label">Ciphertext Output</label>
        <textarea
          id="output-text"
          rows={6}
          value={outputText}
          readOnly
          placeholder="ENCRYPTED OUTPUT APPEARS HERE..."
          className="textarea textarea--readonly"
        />
      </div>
    </div>
  );
};
