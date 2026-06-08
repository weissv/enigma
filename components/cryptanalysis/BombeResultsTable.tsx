/**
 * BombeResultsTable — Displays found Bombe candidates in a data table.
 */

import React from 'react';
import type { BombeCandidate } from '../../types/cryptanalysis.types';
import { indexToChar } from '../../constants';
import { toPercent } from '../../utils/formatting';
import { useI18n } from '../../utils/i18n';

interface BombeResultsTableProps {
  candidates: BombeCandidate[];
}

export const BombeResultsTable: React.FC<BombeResultsTableProps> = ({ candidates }) => {
  const { t } = useI18n();

  if (candidates.length === 0) {
    return (
      <div className="text-mono text-sm text-muted mt-md" style={{ textAlign: 'center', padding: 'var(--gap-md)' }}>
        {t('noCandidates')}
      </div>
    );
  }

  // Sort by confidence descending
  const sorted = [...candidates].sort((a, b) => b.confidenceScore - a.confidenceScore);

  return (
    <div className="overflow-x-auto" style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }}>
      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('tableRotor')}</th>
            <th>{t('tablePos')}</th>
            <th>{t('tableRef')}</th>
            <th>{t('tableStecker')}</th>
            <th>{t('tableScore')}</th>
            <th>{t('tablePreview')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c, i) => {
            const scoreColor = c.confidenceScore > 0.7
              ? 'var(--accent-green)'
              : c.confidenceScore > 0.4
                ? 'var(--accent-amber)'
                : 'var(--accent-red)';

            return (
              <tr key={i}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td>{c.rotorTypes.join('-')}</td>
                <td>
                  {c.rotorPositions.map(p => indexToChar(p)).join('-')}
                  <span className="text-muted"> ({c.rotorPositions.join(',')})</span>
                </td>
                <td>{c.reflectorType}</td>
                <td style={{ fontSize: '0.75rem', maxWidth: '100px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                  {Object.entries(c.plugboard).map(([a, b]) => `${a}${b}`).join(' ')}
                </td>
                <td>
                  <span className="results-table__score">
                    <span
                      className="results-table__score-fill"
                      style={{
                        width: `${c.confidenceScore * 100}%`,
                        background: scoreColor,
                      }}
                    />
                  </span>
                  {toPercent(c.confidenceScore, 0)}
                </td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.decryptedPreview}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
