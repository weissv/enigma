/**
 * Header — Cyberpunk Noir platform header.
 */

import React from 'react';

export const Header: React.FC = () => (
  <header className="app-header">
    <div>
      <h1 className="app-header__title">Enigma // Cryptanalysis Platform</h1>
      <p className="app-header__subtitle">M3 Wehrmacht · Mechanistic Interpretability · Turing Bombe</p>
    </div>
    <div className="text-mono text-xs text-muted">
      v2.0 · Research Build
    </div>
  </header>
);
