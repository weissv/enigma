/**
 * Header — Cyberpunk Noir platform header.
 */

import React, { useState } from 'react';
import { soundEngine } from '../../services/SoundEngine';
import { useI18n } from '../../utils/i18n';

interface HeaderProps {
  onShare: () => Promise<boolean>;
}

export const Header: React.FC<HeaderProps> = ({ onShare }) => {
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEngine.isEnabled());
  const { t, lang, setLang } = useI18n();

  const handleShare = async () => {
    const success = await onShare();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSound = () => {
    const newState = !soundOn;
    soundEngine.setEnabled(newState);
    setSoundOn(newState);
    if (newState) {
      soundEngine.playKeyClick();
    }
  };

  return (
  <header className="app-header">
    <div>
      <h1 className="app-header__title">{t('headerTitle')}</h1>
      <p className="app-header__subtitle">{t('headerSubtitle')}</p>
    </div>
    <div className="text-mono text-xs text-muted flex gap-md align-center" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        className="btn btn--sm"
        onClick={() => setLang(lang === 'EN' ? 'RU' : 'EN')}
        style={{ width: '40px', borderColor: 'var(--accent-gold)' }}
      >
        {lang}
      </button>
      <button 
        className="btn btn--sm" 
        onClick={toggleSound}
        style={{ 
          background: soundOn ? 'rgba(212, 175, 55, 0.2)' : 'transparent', 
          borderColor: soundOn ? 'var(--accent-gold)' : 'var(--border-dim)',
          color: soundOn ? 'var(--accent-gold)' : 'var(--text-muted)' 
        }}
      >
        {soundOn ? t('soundOn') : t('soundOff')}
      </button>
      <button className="btn btn--sm" onClick={handleShare}>
        {copied ? t('copied') : t('shareUrl')}
      </button>
      <span>{t('version')}</span>
    </div>
  </header>
  );
};
