import React from 'react';

interface IOAreaProps {
  inputText: string;
  outputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const IOArea: React.FC<IOAreaProps> = ({ inputText, outputText, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="input-text" className="block text-lg font-semibold text-slate-300 mb-2">Input Text</label>
        <textarea
          id="input-text"
          rows={8}
          value={inputText}
          onChange={onInputChange}
          placeholder="Type your message here (A-Z)..."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-lg"
        />
      </div>
      <div>
        <label htmlFor="output-text" className="block text-lg font-semibold text-slate-300 mb-2">Output Text</label>
        <textarea
          id="output-text"
          rows={8}
          value={outputText}
          readOnly
          placeholder="Processed text will appear here..."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-slate-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-lg cursor-not-allowed"
        />
      </div>
    </div>
  );
};
