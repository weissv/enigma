/**
 * Badge — Status indicator with colored dot.
 */

import React from 'react';

type BadgeVariant = 'idle' | 'running' | 'success' | 'error';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label }) => (
  <span className={`badge badge--${variant}`}>
    <span className="badge__dot" />
    {label}
  </span>
);
