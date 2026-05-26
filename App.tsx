
import React from 'react';
import { useEnigma } from './hooks/useEnigma';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ControlPanel } from './components/ControlPanel';
import { IOArea } from './components/IOArea';

const App: React.FC = () => {
  const {
    inputText,
    outputText,
    rotorSettings,
    reflectorType,
    handleInputChange,
    handleRotorSettingChange,
    setReflectorType,
    resetSettings
  } = useEnigma();

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 bg-gray-800 shadow-2xl rounded-xl border border-gray-700/50 my-8">
      <Header />

      <ControlPanel
        rotorSettings={rotorSettings}
        reflectorType={reflectorType}
        onRotorSettingChange={handleRotorSettingChange}
        onReflectorTypeChange={setReflectorType}
      />
      
      <div className="mb-6 flex justify-center">
        <button
          onClick={resetSettings}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Reset All Settings & Text
        </button>
      </div>

      <IOArea
        inputText={inputText}
        outputText={outputText}
        onInputChange={handleInputChange}
      />

      <Footer />
    </div>
  );
};

export default App;
