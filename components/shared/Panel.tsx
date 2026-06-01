/**
 * Panel — Base container component with header and body.
 * Cyberpunk Noir style with optional active state glow.
 */

import React from 'react';

interface PanelProps {
  title: string;
  active?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ title, active, badge, children, className }) => (
  <div className={`panel${active ? ' panel--active' : ''} ${className ?? ''}`}>
    <div className="panel__header">
      <span className="panel__title">{title}</span>
      {badge}
    </div>
    <div className="panel__body">
      {children}
    </div>
  </div>
);
