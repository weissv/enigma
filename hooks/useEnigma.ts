/**
 * useEnigma — Core hook for Enigma machine state management.
 *
 * Refactored to produce MessageTrace alongside encryption output,
 * enabling the Glass Box visualization module.
 */

import { useState, useCallback, useEffect } from 'react';
import { RotorSetting, PlugboardConfig } from '../types/enigma.types';
import type { EnigmaConfig } from '../types/enigma.types';
import type { MessageTrace } from '../types/trace.types';
import { INITIAL_ROTOR_SETTINGS, INITIAL_REFLECTOR, INITIAL_M4_ROTOR_SETTINGS, INITIAL_M4_REFLECTOR, ReflectorName } from '../constants';
import { EnigmaMachine } from '../services/enigmaService';
import { soundEngine } from '../services/SoundEngine';

export const useEnigma = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [rotorSettings, setRotorSettings] = useState<RotorSetting[]>(INITIAL_ROTOR_SETTINGS);
  const [reflectorType, setReflectorType] = useState<ReflectorName>(INITIAL_REFLECTOR);
  const [plugboardConfig, setPlugboardConfig] = useState<PlugboardConfig>({});
  const [messageTrace, setMessageTrace] = useState<MessageTrace | null>(null);

  const handleRotorSettingChange = useCallback((updatedRotorSetting: RotorSetting) => {
    setRotorSettings(prevSettings =>
      prevSettings.map(rs => (rs.id === updatedRotorSetting.id ? updatedRotorSetting : rs))
    );
  }, []);

  const machineType: 'M3' | 'M4' = rotorSettings.length === 4 ? 'M4' : 'M3';

  const handleMachineTypeChange = useCallback((type: 'M3' | 'M4') => {
    if (type === 'M4') {
      setRotorSettings(INITIAL_M4_ROTOR_SETTINGS);
      setReflectorType(INITIAL_M4_REFLECTOR);
    } else {
      setRotorSettings(INITIAL_ROTOR_SETTINGS);
      setReflectorType(INITIAL_REFLECTOR);
    }
  }, []);

  const processText = useCallback(() => {
    if (!inputText.trim()) {
      setOutputText('');
      setMessageTrace(null);
      return;
    }

    const config: EnigmaConfig = {
      rotors: [...rotorSettings],
      reflector: reflectorType,
      plugboard: { ...plugboardConfig },
    };

    const machine = new EnigmaMachine(config);
    const { result, trace } = machine.processStringTraced(inputText, config);

    setOutputText(result);
    setMessageTrace(trace);
  }, [inputText, rotorSettings, reflectorType, plugboardConfig]);

  useEffect(() => {
    processText();
  }, [inputText, rotorSettings, reflectorType, plugboardConfig, processText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value.toUpperCase();
    if (newVal.length > inputText.length && soundEngine.isEnabled()) {
      soundEngine.playKeyClick();
      // Simulate physical rotor step thud
      setTimeout(() => soundEngine.playRotorStep(Math.random() > 0.9), 30);
    }
    setInputText(newVal);
  };

  const resetSettings = () => {
    setRotorSettings(INITIAL_ROTOR_SETTINGS);
    setReflectorType(INITIAL_REFLECTOR);
    setPlugboardConfig({});
    setInputText('');
    setOutputText('');
    setMessageTrace(null);
  };

  return {
    inputText,
    outputText,
    rotorSettings,
    reflectorType,
    plugboardConfig,
    messageTrace,
    handleInputChange,
    handleRotorSettingChange,
    setRotorSettings,
    setReflectorType,
    setPlugboardConfig,
    resetSettings,
    setInputText,
    machineType,
    handleMachineTypeChange,
  };
};
