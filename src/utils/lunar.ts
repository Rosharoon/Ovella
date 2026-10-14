import { LunarName } from '../types';

const LUNAR_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

export interface LunarSnapshot {
  name: LunarName;
  emoji: string;
  illumination: number;
  age: number;
  message: string;
}

const PHASES: { name: LunarName; emoji: string; message: string }[] = [
  {
    name: 'New Moon',
    emoji: '🌑',
    message: 'A quiet reset. Rest, reflect, and set a gentle intention for this cycle.',
  },
  {
    name: 'Waxing Crescent',
    emoji: '🌒',
    message: 'Energy is gathering. Small habits and nourishing routines love this phase.',
  },
  {
    name: 'First Quarter',
    emoji: '🌓',
    message: 'Decision time. Meet the day with curiosity and a little extra movement.',
  },
  {
    name: 'Waxing Gibbous',
    emoji: '🌔',
    message: 'Almost full. Refine, hydrate, and listen to what your body is asking for.',
  },
  {
    name: 'Full Moon',
    emoji: '🌕',
    message: 'Heightened feelings are normal. Soft lighting, warmth, and early rest help.',
  },
  {
    name: 'Waning Gibbous',
    emoji: '🌖',
    message: 'Share what you learned this month. Journaling feels especially good now.',
  },
  {
    name: 'Last Quarter',
    emoji: '🌗',
    message: 'Release what is heavy. A slower evening rhythm supports this lunar turn.',
  },
  {
    name: 'Waning Crescent',
    emoji: '🌘',
    message: 'The moon is resting. Keep plans light and lean into comfort.',
  },
];

export function getLunarPhase(date: Date = new Date()): LunarSnapshot {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const age =
    ((local.getTime() - KNOWN_NEW_MOON) /
      86400000) %
    LUNAR_MONTH;
  const normalized = age < 0 ? age + LUNAR_MONTH : age;
  const index = Math.floor(((normalized / LUNAR_MONTH) * 8 + 0.5) % 8);
  const phase = PHASES[index];
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * normalized) / LUNAR_MONTH)) * 50);

  return {
    ...phase,
    age: Number(normalized.toFixed(1)),
    illumination,
  };
}
