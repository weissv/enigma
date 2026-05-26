import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-cyan-400 tracking-wider">Enigma Simulator</h1>
      <p className="text-slate-400 mt-2">Configure rotors and reflector to encrypt/decrypt messages.</p>
    </header>
  );
};
