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

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ControlPanel } from './components/ControlPanel';
import { IOArea } from './components/IOArea';
import { Panel } from './components/shared/Panel';
import { Badge } from './components/shared/Badge';

// Glass Box
import { SignalPathDiagram } from './components/glassbox/SignalPathDiagram';
import { TraceStepDetail } from './components/glassbox/TraceStepDetail';
import { RotorWiringView } from './components/glassbox/RotorWiringView';
import { CharacterTraceTimeline } from './components/glassbox/CharacterTraceTimeline';

// Cryptanalysis
import { FrequencyChart } from './components/cryptanalysis/FrequencyChart';
import { ICDisplay } from './components/cryptanalysis/ICDisplay';
import { BombePanel } from './components/cryptanalysis/BombePanel';
import { BombeResultsTable } from './components/cryptanalysis/BombeResultsTable';

import { BombeStatus } from './types/cryptanalysis.types';

const App: React.FC = () => {
  // ── Core Enigma State ──
  const {
    inputText,
    outputText,
    rotorSettings,
    reflectorType,
    messageTrace,
    handleInputChange,
    handleRotorSettingChange,
    setReflectorType,
    resetSettings,
  } = useEnigma();

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
      <Header />

      <DashboardLayout
        controls={
          <ControlPanel
            rotorSettings={rotorSettings}
            reflectorType={reflectorType}
            onRotorSettingChange={handleRotorSettingChange}
            onReflectorTypeChange={setReflectorType}
            onReset={resetSettings}
          />
        }

        glassbox={
          <Panel
            title="Glass Box // Signal Trace"
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
            <SignalPathDiagram trace={selectedTrace} />
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
          <Panel title="I/O Terminal">
            <IOArea
              inputText={inputText}
              outputText={outputText}
              onInputChange={handleInputChange}
            />
          </Panel>
        }

        cryptanalysis={
          <Panel title="Cryptanalysis // Statistics">
            <FrequencyChart analysis={frequencyAnalysis} />
            <ICDisplay icResult={icResult} />
          </Panel>
        }

        bombe={
          <Panel
            title="Turing Bombe // Brute Force"
            badge={<Badge {...bombeStatusBadge[bombe.status]} />}
          >
            <BombePanel
              ciphertext={outputText}
              status={bombe.status}
              tested={bombe.tested}
              total={bombe.total}
              percentComplete={bombe.percentComplete}
              error={bombe.error}
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
