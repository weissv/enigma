import { useState, useCallback, useEffect } from 'react';
import { RotorSetting } from '../types';
import { INITIAL_ROTOR_SETTINGS, INITIAL_REFLECTOR, ReflectorName } from '../constants';
import { EnigmaMachine } from '../services/enigmaService';

export const useEnigma = () => {
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
    const machine = new EnigmaMachine([...rotorSettings], reflectorType);
    const processed = machine.processString(inputText);
    setOutputText(processed);
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
  };

  return {
    inputText,
    outputText,
    rotorSettings,
    reflectorType,
    handleInputChange,
    handleRotorSettingChange,
    setReflectorType,
    resetSettings
  };
};
