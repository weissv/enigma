
import React, { useState, useEffect, useCallback } from 'react';
import { RotorSetting } from './types';
import { INITIAL_ROTOR_SETTINGS, INITIAL_REFLECTOR, ReflectorName } from './constants';
import { EnigmaMachine } from './services/enigmaService';
import RotorConfigControl from './components/RotorConfigControl';
import ReflectorConfigControl from './components/ReflectorConfigControl';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [rotorSettings, setRotorSettings] = useState<RotorSetting[]>(INITIAL_ROTOR_SETTINGS);
  const [reflectorType, setReflectorType] = useState<ReflectorName>(INITIAL_REFLECTOR);

  const handleRotorSettingChange = useCallback((updatedRotorSetting: RotorSetting) => {
    setRotorSettings(prevSettings =>
      prevSettings.map(rs => (rs.id === updatedRotorSetting.id ? updatedRotorSetting : rs))
    );
  }, []);

  const processText = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }
    // Create a new machine instance for each processing run to ensure fresh state
    // The rotorSettings are already in [Left, Middle, Right] order from INITIAL_ROTOR_SETTINGS
    const machine = new EnigmaMachine([...rotorSettings], reflectorType);
    const processed = machine.processString(inputText);
    setOutputText(processed);
  }, [inputText, rotorSettings, reflectorType]);

  useEffect(() => {
    processText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, rotorSettings, reflectorType]); // Re-process when any of these change. processText is memoized with these deps.

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Convert input to uppercase as Enigma operates on uppercase letters.
    // Non-alphabetic characters will be handled by the EnigmaMachine (passed through).
    setInputText(e.target.value.toUpperCase());
  };

  const resetSettings = () => {
    setRotorSettings(INITIAL_ROTOR_SETTINGS);
    setReflectorType(INITIAL_REFLECTOR);
    setInputText('');
    setOutputText('');
  };

  // Labels for rotors in UI: Slot 1 (Leftmost), Slot 2 (Middle), Slot 3 (Rightmost)
  // This matches the order in INITIAL_ROTOR_SETTINGS and how EnigmaMachine expects them.
  const rotorLabels = ["Slot 1 (Leftmost)", "Slot 2 (Middle)", "Slot 3 (Rightmost)"];

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 bg-gray-800 shadow-2xl rounded-xl border border-gray-700/50 my-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-cyan-400 tracking-wider">Enigma Simulator</h1>
        <p className="text-slate-400 mt-2">Configure rotors and reflector to encrypt/decrypt messages.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        {rotorSettings.map((setting, index) => (
          <RotorConfigControl
            key={setting.id}
            rotorSetting={setting}
            onRotorSettingChange={handleRotorSettingChange}
            rotorLabel={rotorLabels[index]}
          />
        ))}
         {/* Reflector takes full width on small screens or fits into grid */}
        <div className="md:col-span-3"> 
          <ReflectorConfigControl
            reflectorType={reflectorType}
            onReflectorTypeChange={setReflectorType}
          />
        </div>
      </div>
      
      <div className="mb-6 flex justify-center">
        <button
          onClick={resetSettings}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Reset All Settings & Text
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="input-text" className="block text-lg font-semibold text-slate-300 mb-2">Input Text</label>
          <textarea
            id="input-text"
            rows={8}
            value={inputText}
            onChange={handleInputChange}
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
      <footer className="mt-10 text-center text-sm text-slate-500">
        <p>Enigma is reciprocal: to decrypt, use the exact same settings as encryption.</p>
        <p>Only A-Z characters are encrypted. Others (numbers, spaces, symbols) are passed through unchanged.</p>
      </footer>
    </div>
  );
};

export default App;
