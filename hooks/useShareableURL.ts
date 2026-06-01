import { useEffect } from 'react';
import type { EnigmaConfig } from '../types/enigma.types';


export const useShareableURL = (
  config: EnigmaConfig,
  onLoad: (config: EnigmaConfig) => void
) => {
  // Sync config to URL
  useEffect(() => {
    // Debounce slightly to avoid slamming the history API
    const timeout = setTimeout(() => {
      try {
        const json = JSON.stringify(config);
        const b64 = btoa(json);
        const url = new URL(window.location.href);
        url.searchParams.set('state', b64);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.error('Failed to stringify state for URL', e);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [config]);

  // Load config from URL on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const stateB64 = url.searchParams.get('state');
    if (stateB64) {
      try {
        const json = atob(stateB64);
        const parsed = JSON.parse(json) as EnigmaConfig;
        
        // Basic validation
        if (parsed.rotors && parsed.reflector && parsed.plugboard) {
          onLoad(parsed);
        }
      } catch (e) {
        console.error('Failed to parse URL state', e);
        // Clear broken state from URL
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } catch (e) {
      return false;
    }
  };

  return { copyShareLink };
};
