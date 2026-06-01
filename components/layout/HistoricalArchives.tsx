import React from 'react';
import { ARCHIVES, HistoricalMission } from '../../data/historicalArchives';

interface HistoricalArchivesProps {
  onLoadMission: (mission: HistoricalMission) => void;
}

export const HistoricalArchives: React.FC<HistoricalArchivesProps> = ({ onLoadMission }) => {
  return (
    <div className="historical-archives">
      <p className="text-sm text-muted mb-md">
        Select a historical intercept to populate the machine state and input.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-sm)' }}>
        {ARCHIVES.map((mission) => (
          <div 
            key={mission.id} 
            className="border-panel p-sm" 
            style={{ 
              cursor: 'pointer', 
              transition: 'border-color 0.2s',
              background: 'var(--surface-sunken)' 
            }}
            onClick={() => onLoadMission(mission)}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-amber)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div className="flex justify-between mb-xs">
              <strong className="text-accent">{mission.name}</strong>
              <span className="text-xs text-muted">{mission.date}</span>
            </div>
            <p className="text-xs text-muted mb-xs">{mission.context}</p>
            <div className="text-mono text-xs" style={{ color: 'var(--accent-green)' }}>
              Crib: {mission.crib} (Pos: {mission.cribPosition})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
