/**
 * useEnigma — Core hook for Enigma machine state management.
 *
 * Refactored to produce MessageTrace alongside encryption output,
 * enabling the Glass Box visualization module.
 */

import { useState, useCallback, useEffect } from 'react';
import { RotorSetting } from '../types/enigma.types';
import type { EnigmaConfig } from '../types/enigma.types';
import type { MessageTrace } from '../types/trace.types';
import { INITIAL_ROTOR_SETTINGS, INITIAL_REFLECTOR, ReflectorName } from '../constants';
import { EnigmaMachine } from '../services/enigmaService';

export const useEnigma = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [rotorSettings, setRotorSettings] = useState<RotorSetting[]>(INITIAL_ROTOR_SETTINGS);
  const [reflectorType, setReflectorType] = useState<ReflectorName>(INITIAL_REFLECTOR);
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
    };

    const machine = new EnigmaMachine([...rotorSettings], reflectorType);
    const { result, trace } = machine.processStringTraced(inputText, config);

    setOutputText(result);
    setMessageTrace(trace);
  }, [inputText, rotorSettings, reflectorType]);

  useEffect(() => {
    processText();
  }, [inputText, rotorSettings, reflectorType, processText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value.toUpperCase());
  };

  const resetSettings = () => {
    setRotorSettings(INITIAL_ROTOR_SETTINGS);
    setReflectorType(INITIAL_REFLECTOR);
    setInputText('');
    setOutputText('');
    setMessageTrace(null);
  };

  return {
    inputText,
    outputText,
    rotorSettings,
    reflectorType,
    messageTrace,
    handleInputChange,
    handleRotorSettingChange,
    setReflectorType,
    resetSettings,
  };
};
