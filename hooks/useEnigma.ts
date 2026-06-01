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
import { INITIAL_ROTOR_SETTINGS, INITIAL_REFLECTOR, ReflectorName } from '../constants';
import { EnigmaMachine } from '../services/enigmaService';

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
    setInputText(e.target.value.toUpperCase());
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
    setReflectorType,
    setPlugboardConfig,
    resetSettings,
  };
};
