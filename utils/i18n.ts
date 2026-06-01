// Simple i18n dictionary
export type Lang = 'EN' | 'RU';

export const DICT = {
  EN: {
    // Header
    headerTitle: 'Enigma // Cryptanalysis Platform',
    headerSubtitle: 'M3/M4 Kriegsmarine · Swarm Intelligence · Turing Bombe',
    soundOn: 'Sound: ON',
    soundOff: 'Sound: OFF',
    shareUrl: 'Share URL',
    copied: 'Copied!',
    version: 'v3.0 · Research Build',
    
    // Layout Areas
    areaArchives: 'Historical Archives',
    areaControls: 'Machine Configuration',
    areaGlassbox: 'Glass Box // Signal Trace',
    areaIO: 'I/O Terminal',
    areaCryptanalysis: 'Cryptanalysis // Statistics',
    areaBombe: 'Turing Bombe // Swarm Brute Force',

    // Controls
    machineType: 'Machine Type',
    rotors: 'Rotors',
    positions: 'Positions',
    ringSettings: 'Ring Settings',
    reflector: 'Reflector',
    plugboard: 'Steckerbrett (Plugboard)',
    reset: 'Reset Config',

    // I/O
    input: 'Input (Plaintext)',
    output: 'Output (Ciphertext)',

    // Big Freeze
    topologicalEntropy: 'Topological Entropy (Big Freeze)',
    
    // Frequency
    frequencyAnalysis: 'Frequency Analysis',
    observed: 'Observed',
    expected: 'Expected',

    // IC
    indexCoincidence: 'Index of Coincidence (IC)',
    icNatural: 'Natural Language',
    icMono: 'Monoalphabetic',
    icWeak: 'Weak Polyalphabetic',
    icPoly: 'Strong Polyalphabetic',
    icRandom: 'Random / Highly Encrypted',

    // Bombe
    bombeStatus: 'Swarm Status',
    bombeProgress: 'Swarm Progress',
    startSwarm: 'Deploy Swarm',
    cancelSwarm: 'Abort',
    resetSwarm: 'Reset',
    
    tableRotor: 'Rotor Combo',
    tablePos: 'Pos',
    tableRings: 'Rings',
    tableRef: 'Ref',
    tableStecker: 'Steckerbrett Optima',
    tablePreview: 'Preview',
    tableScore: 'Score',
    noCandidates: 'No candidates found yet. Awaiting Swarm...',
    
    // Status badges
    statusIdle: 'Idle',
    statusRunning: 'Swarm Active',
    statusComplete: 'Mission Accomplished',
    statusTimeout: 'Timeout',
    statusCancelled: 'Aborted',
    statusError: 'Error',
  },
  RU: {
    // Header
    headerTitle: 'Enigma // Платформа Криптоанализа',
    headerSubtitle: 'M3/M4 Kriegsmarine · Роевой Интеллект · Машина Тьюринга',
    soundOn: 'Звук: ВКЛ',
    soundOff: 'Звук: ВЫКЛ',
    shareUrl: 'Поделиться',
    copied: 'Скопировано!',
    version: 'v3.0 · Research Build',

    // Layout Areas
    areaArchives: 'Исторические Архивы',
    areaControls: 'Конфигурация Машины',
    areaGlassbox: 'Glass Box // Трассировка Сигнала',
    areaIO: 'I/O Терминал',
    areaCryptanalysis: 'Криптоанализ // Статистика',
    areaBombe: 'Turing Bombe // Роевой Брутфорс',

    // Controls
    machineType: 'Тип Машины',
    rotors: 'Роторы',
    positions: 'Позиции',
    ringSettings: 'Кольца (Ringstellung)',
    reflector: 'Рефлектор',
    plugboard: 'Панель (Steckerbrett)',
    reset: 'Сбросить Настройки',

    // I/O
    input: 'Ввод (Открытый Текст)',
    output: 'Вывод (Шифротекст)',

    // Big Freeze
    topologicalEntropy: 'Топологическая Энтропия (Big Freeze)',
    
    // Frequency
    frequencyAnalysis: 'Частотный Анализ',
    observed: 'Наблюдаемая',
    expected: 'Ожидаемая',

    // IC
    indexCoincidence: 'Индекс Совпадений (IC)',
    icNatural: 'Естественный язык',
    icMono: 'Моноалфавитный',
    icWeak: 'Слабый полиалфавитный',
    icPoly: 'Сильный полиалфавитный',
    icRandom: 'Случайный / Зашифрованный',

    // Bombe
    bombeStatus: 'Статус Роя',
    bombeProgress: 'Прогресс Роя',
    startSwarm: 'Запустить Рой',
    cancelSwarm: 'Отмена',
    resetSwarm: 'Сброс',
    
    tableRotor: 'Комбинация Роторов',
    tablePos: 'Поз',
    tableRings: 'Кольца',
    tableRef: 'Реф',
    tableStecker: 'Steckerbrett (Оптимум)',
    tablePreview: 'Дешифровка',
    tableScore: 'Оценка',
    noCandidates: 'Кандидаты не найдены. Ожидание роя...',
    
    // Status badges
    statusIdle: 'Ожидание',
    statusRunning: 'Рой Активен',
    statusComplete: 'Миссия Выполнена',
    statusTimeout: 'Таймаут',
    statusCancelled: 'Отменено',
    statusError: 'Ошибка',
  }
};

let currentLang: Lang = 'EN';
const listeners = new Set<() => void>();

export function setLang(l: Lang) {
  currentLang = l;
  listeners.forEach(fn => fn());
}

export function getLang(): Lang {
  return currentLang;
}

export function t(key: keyof typeof DICT.EN): string {
  return DICT[currentLang][key];
}

import { useState, useEffect } from 'react';

export function useI18n() {
  const [lang, setLangState] = useState<Lang>(currentLang);
  
  useEffect(() => {
    const handler = () => setLangState(currentLang);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);
  
  return { t, lang, setLang };
}
