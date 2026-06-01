/**
 * App — Root component for the Enigma Cryptanalysis Platform.
 *
 * Orchestrates all modules:
 * - Machine Configuration (ControlPanel)
 * - I/O Area (plaintext/ciphertext)
 * - Glass Box (signal trace visualization)
 * - Cryptanalysis Dashboard (frequency analysis + IC)
 * - Turing Bombe (brute-force attack)
 */

import React from 'react';
import { useEnigma } from './hooks/useEnigma';
import { useSignalTrace } from './hooks/useSignalTrace';
import { useCryptanalysis } from './hooks/useCryptanalysis';
import { useBombe } from './hooks/useBombe';
import { useShareableURL } from './hooks/useShareableURL';
import { useI18n } from './utils/i18n';
import type { EnigmaConfig } from './types/enigma.types';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { HistoricalArchives } from './components/layout/HistoricalArchives';
import { ControlPanel } from './components/ControlPanel';
import { IOArea } from './components/IOArea';
import { Panel } from './components/shared/Panel';
import { Badge } from './components/shared/Badge';
import { HistoricalMission } from './data/historicalArchives';

// Glass Box
import { GlassBox3D } from './components/glassbox/GlassBox3D';
import { TraceStepDetail } from './components/glassbox/TraceStepDetail';
import { RotorWiringView } from './components/glassbox/RotorWiringView';
import { CharacterTraceTimeline } from './components/glassbox/CharacterTraceTimeline';

// Cryptanalysis
import { FrequencyChart } from './components/cryptanalysis/FrequencyChart';
import { BigFreeze3D } from './components/cryptanalysis/BigFreeze3D';
import { ICDisplay } from './components/cryptanalysis/ICDisplay';
import { BombePanel } from './components/cryptanalysis/BombePanel';
import { BombeResultsTable } from './components/cryptanalysis/BombeResultsTable';

import { BombeStatus } from './types/cryptanalysis.types';

const App: React.FC = () => {
  // ── I18n ──
  const { t } = useI18n();

  // ── Core Enigma State ──
  const {
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
    setRotorSettings,
    setInputText,
    machineType,
    handleMachineTypeChange,
  } = useEnigma();

  // ── Shareable URL State ──
  const { copyShareLink } = useShareableURL(
    { rotors: rotorSettings, reflector: reflectorType, plugboard: plugboardConfig },
    (loadedConfig: EnigmaConfig) => {
      setRotorSettings(loadedConfig.rotors);
      setReflectorType(loadedConfig.reflector);
      setPlugboardConfig(loadedConfig.plugboard);
    }
  );

  const handleLoadMission = (mission: HistoricalMission) => {
    setRotorSettings(mission.config.rotors);
    setReflectorType(mission.config.reflector);
    setPlugboardConfig(mission.config.plugboard);
    setInputText(mission.plaintext);
  };

  // ── Signal Trace (Glass Box) ──
  const {
    selectedTrace,
    selectedIndex,
    selectCharacter,
    selectNext,
    selectPrev,
    totalTraced,
    setMessageTrace,
  } = useSignalTrace();

  // Sync message trace from useEnigma to useSignalTrace
  React.useEffect(() => {
    setMessageTrace(messageTrace);
  }, [messageTrace, setMessageTrace]);

  // ── Cryptanalysis ──
  const { frequencyAnalysis, icResult } = useCryptanalysis(outputText);

  // ── Turing Bombe ──
  const bombe = useBombe();

  // Calculate Entropy for BigFreeze
  const activeText = outputText || inputText || '';
  const calculateEntropy = (text: string) => {
    if (!text) return 4.7;
    const freqs: Record<string, number> = {};
    for (const char of text) freqs[char] = (freqs[char] || 0) + 1;
    let h = 0;
    for (const char in freqs) {
      const p = freqs[char] / text.length;
      h -= p * Math.log2(p);
    }
    return h;
  };
  const currentEntropy = calculateEntropy(activeText);
  const isCracked = bombe.status === BombeStatus.COMPLETED && bombe.candidates.length > 0;

  const bombeStatusBadge = {
    [BombeStatus.IDLE]:      { variant: 'idle' as const, label: 'Idle' },
    [BombeStatus.RUNNING]:   { variant: 'running' as const, label: 'Running' },
    [BombeStatus.COMPLETED]: { variant: 'success' as const, label: 'Complete' },
    [BombeStatus.TIMEOUT]:   { variant: 'error' as const, label: 'Timeout' },
    [BombeStatus.CANCELLED]: { variant: 'idle' as const, label: 'Cancelled' },
    [BombeStatus.ERROR]:     { variant: 'error' as const, label: 'Error' },
  };

  return (
    <div className="app-container">
      <Header onShare={copyShareLink} />

      <DashboardLayout
        archives={
          <HistoricalArchives onLoadMission={handleLoadMission} />
        }
        controls={
          <ControlPanel
            machineType={machineType}
            onMachineTypeChange={handleMachineTypeChange}
            rotorSettings={rotorSettings}
            reflectorType={reflectorType}
            plugboardConfig={plugboardConfig}
            onRotorSettingChange={handleRotorSettingChange}
            onReflectorTypeChange={setReflectorType}
            onPlugboardChange={setPlugboardConfig}
            onReset={resetSettings}
          />
        }

        glassbox={
          <Panel
            title={t('areaGlassbox')}
            active={!!selectedTrace}
            badge={
              totalTraced > 0
                ? <span className="text-mono text-xs text-muted">
                    char {selectedIndex + 1}/{totalTraced}
                    <button className="btn btn--sm" onClick={selectPrev} style={{ marginLeft: 8, padding: '1px 6px' }}>←</button>
                    <button className="btn btn--sm" onClick={selectNext} style={{ marginLeft: 4, padding: '1px 6px' }}>→</button>
                  </span>
                : undefined
            }
          >
            <GlassBox3D trace={selectedTrace} />
            <TraceStepDetail trace={selectedTrace} />
            <RotorWiringView trace={selectedTrace} />
            <CharacterTraceTimeline
              messageTrace={messageTrace}
              selectedIndex={selectedIndex}
              onSelect={selectCharacter}
            />
          </Panel>
        }

        io={
          <Panel title={t('areaIO')}>
            <IOArea
              inputText={inputText}
              outputText={outputText}
              onInputChange={handleInputChange}
            />
          </Panel>
        }

        cryptanalysis={
          <Panel title={t('areaCryptanalysis')}>
            <BigFreeze3D currentEntropy={currentEntropy} isCracked={isCracked} />
            <div className="mt-md">
              <FrequencyChart analysis={frequencyAnalysis} />
            </div>
            <ICDisplay icResult={icResult} />
          </Panel>
        }

        bombe={
          <Panel
            title={t('areaBombe')}
            badge={<Badge {...bombeStatusBadge[bombe.status]} />}
          >
            <BombePanel
              ciphertext={outputText}
              status={bombe.status}
              tested={bombe.tested}
              total={bombe.total}
              percentComplete={bombe.percentComplete}
              error={bombe.error}
              telemetry={bombe.telemetry}
              onStart={bombe.start}
              onCancel={bombe.cancel}
              onReset={bombe.reset}
            />
            <BombeResultsTable candidates={bombe.candidates} />
          </Panel>
        }
      />

      <Footer />
    </div>
  );
};

export default App;
