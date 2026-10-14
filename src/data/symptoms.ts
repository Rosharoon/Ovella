import { Ionicons } from '@expo/vector-icons';
import { AppMode } from '../types';

export const PERIOD_SYMPTOMS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'cramps', label: 'Cramps', icon: 'pulse-outline' },
  { id: 'headache', label: 'Headache', icon: 'happy-outline' },
  { id: 'bloating', label: 'Bloating', icon: 'ellipse-outline' },
  { id: 'fatigue', label: 'Low energy', icon: 'battery-half-outline' },
  { id: 'tender', label: 'Tender chest', icon: 'heart-outline' },
  { id: 'mood', label: 'Mood changes', icon: 'partly-sunny-outline' },
  { id: 'back', label: 'Back pain', icon: 'body-outline' },
  { id: 'sleep', label: 'Sleep changes', icon: 'moon-outline' },
];

export const PREGNANCY_SYMPTOMS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'nausea', label: 'Nausea', icon: 'sad-outline' },
  { id: 'fatigue', label: 'Tiredness', icon: 'battery-half-outline' },
  { id: 'heartburn', label: 'Heartburn', icon: 'flame-outline' },
  { id: 'headache', label: 'Headache', icon: 'happy-outline' },
  { id: 'back', label: 'Back pain', icon: 'body-outline' },
  { id: 'swelling', label: 'Swelling', icon: 'water-outline' },
  { id: 'cramps', label: 'Cramping', icon: 'pulse-outline' },
  { id: 'kicks', label: 'Kicks', icon: 'heart-outline' },
  { id: 'mood', label: 'Mood', icon: 'partly-sunny-outline' },
  { id: 'sleep', label: 'Sleep', icon: 'moon-outline' },
  { id: 'pelvic', label: 'Pelvic pain', icon: 'body-outline' },
  { id: 'breath', label: 'Short breath', icon: 'cloud-outline' },
];

export function symptomLabel(id: string, mode: AppMode | null) {
  const primary = mode === 'pregnancy' ? PREGNANCY_SYMPTOMS : PERIOD_SYMPTOMS;
  const secondary = mode === 'pregnancy' ? PERIOD_SYMPTOMS : PREGNANCY_SYMPTOMS;
  return primary.find((item) => item.id === id)?.label ?? secondary.find((item) => item.id === id)?.label ?? id;
}

const periodIds = new Set(PERIOD_SYMPTOMS.map((item) => item.id));
const pregnancyIds = new Set(PREGNANCY_SYMPTOMS.map((item) => item.id));

export function logForMode<T extends { symptoms: string[]; loggedMode?: AppMode }>(
  log: T | undefined,
  mode: AppMode | null,
): T | undefined {
  if (!log || !mode) return undefined;
  if (log.loggedMode) return log.loggedMode === mode ? log : undefined;
  const allowed = mode === 'pregnancy' ? pregnancyIds : periodIds;
  const other = mode === 'pregnancy' ? periodIds : pregnancyIds;
  const belongsToOther = log.symptoms.some((id) => other.has(id) && !allowed.has(id));
  if (belongsToOther) return undefined;
  return { ...log, symptoms: log.symptoms.filter((id) => allowed.has(id)) };
}
