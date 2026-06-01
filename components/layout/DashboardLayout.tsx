/**
 * DashboardLayout — Main grid layout for the cryptanalysis platform.
 * Organizes all panels into the cyberpunk dashboard grid.
 */

import React from 'react';

interface DashboardLayoutProps {
  controls: React.ReactNode;
  glassbox: React.ReactNode;
  io: React.ReactNode;
  cryptanalysis: React.ReactNode;
  bombe: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  controls,
  glassbox,
  io,
  cryptanalysis,
  bombe,
}) => (
  <div className="dashboard-grid">
    <div className="area-controls">{controls}</div>
    <div className="area-glassbox">{glassbox}</div>
    <div className="area-io">{io}</div>
    <div className="area-cryptanalysis">{cryptanalysis}</div>
    <div className="area-bombe">{bombe}</div>
  </div>
);
