import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-10 text-center text-sm text-slate-500">
      <p>Enigma is reciprocal: to decrypt, use the exact same settings as encryption.</p>
      <p>Only A-Z characters are encrypted. Others (numbers, spaces, symbols) are passed through unchanged.</p>
    </footer>
  );
};
