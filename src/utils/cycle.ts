import { CyclePhase, CycleProfile, CycleSnapshot } from '../types';
import { addISODays, daysBetween, toISODate } from './dates';

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: 'Menstrual phase',
  follicular: 'Follicular phase',
  ovulation: 'Ovulation',
  luteal: 'Luteal phase',
};

export function getOvulationDay(cycleLength: number): number {
  return Math.max(10, cycleLength - 14);
}

export function cycleLengthFromLogs(starts: string[], fallback: number): number {
  const sorted = [...new Set(starts.filter(Boolean))].sort();
  const gaps: number[] = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const gap = daysBetween(sorted[index - 1], sorted[index]);
    if (gap >= 15 && gap <= 60) gaps.push(gap);
  }
  if (!gaps.length) return fallback;
  const recent = gaps.slice(-3);
  return Math.round(recent.reduce((total, gap) => total + gap, 0) / recent.length);
}

export function getCycleAnchor(profile: CycleProfile, dateISO: string): string {
  const logged = profile.loggedPeriodStarts.filter((start) => start && start <= dateISO).sort();
  const latest = logged[logged.length - 1];
  if (profile.lastPeriodStart && profile.lastPeriodStart <= dateISO && (!latest || profile.lastPeriodStart > latest)) {
    return profile.lastPeriodStart;
  }
  if (latest) return latest;
  return profile.lastPeriodStart;
}

function periodStartFor(profile: CycleProfile, dateISO: string): string | null {
  const origin = profile.lastPeriodStart;
  if (!origin || dateISO < origin) return null;
  const offset = daysBetween(origin, dateISO);
  const intoCycle = offset % profile.cycleLength;
  return addISODays(dateISO, -intoCycle);
}

export function periodLengthFor(profile: CycleProfile, start: string): number {
  const ended = profile.periodEnds?.[start];
  if (!ended || ended < start) return profile.periodLength;
  return Math.max(1, daysBetween(start, ended) + 1);
}

export function datesForCycle(profile: CycleProfile, dateISO: string): { day: number; iso: string }[] {
  const anchor = getCycleAnchor(profile, dateISO);
  return Array.from({ length: profile.cycleLength }, (_, i) => ({
    day: i + 1,
    iso: addISODays(anchor, i),
  }));
}

export function getCycleSnapshot(profile: CycleProfile, date: Date = new Date()): CycleSnapshot {
  const dateISO = toISODate(date);
  const cycleLength = profile.cycleLength;
  const periodLength = profile.periodLength;
  const ovulationDay = getOvulationDay(cycleLength);
  const fertileStart = Math.max(1, ovulationDay - 5);
  const fertileEnd = Math.min(cycleLength, ovulationDay + 1);
  const anchor = getCycleAnchor(profile, dateISO);
  const logged = new Set(profile.loggedPeriodStarts);
  const cycleDay = Math.max(1, daysBetween(anchor, dateISO) + 1);
  const periodStart = periodStartFor(profile, dateISO);
  const isPeriod = profile.loggedPeriodStarts.some((start) => {
    const delta = daysBetween(start, dateISO);
    return delta >= 0 && delta < periodLengthFor(profile, start);
  });
  const nextPeriodDate = addISODays(anchor, cycleLength);
  const today = toISODate(new Date());
  const laterLogged = profile.loggedPeriodStarts.some((start) => start > anchor);
  const periodIsLate = !laterLogged && today > nextPeriodDate && !logged.has(nextPeriodDate);
  const isPredictedPeriod = periodIsLate
    ? !isPeriod && dateISO >= nextPeriodDate && daysBetween(nextPeriodDate, dateISO) < periodLength
    : Boolean(periodStart) &&
      !logged.has(periodStart as string) &&
      daysBetween(periodStart as string, dateISO) < periodLength &&
      !isPeriod;
  const daysLate =
    dateISO > nextPeriodDate && !logged.has(nextPeriodDate) ? daysBetween(nextPeriodDate, dateISO) : 0;
  const inThisCycle = cycleDay <= cycleLength && daysLate === 0;
  const dayInSpan = ((cycleDay - 1) % cycleLength) + 1;
  const inPredictedCycle = !periodIsLate && cycleDay > cycleLength && !isPeriod;
  const isOvulation =
    (inThisCycle && cycleDay === ovulationDay) || (inPredictedCycle && dayInSpan === ovulationDay);
  const isFertile =
    (inThisCycle && cycleDay >= fertileStart && cycleDay <= fertileEnd) ||
    (inPredictedCycle && dayInSpan >= fertileStart && dayInSpan <= fertileEnd);

  const phaseDay = inPredictedCycle ? dayInSpan : cycleDay;
  const phaseOpen = inThisCycle || inPredictedCycle;
  let phase: CyclePhase;
  if (isPeriod) {
    phase = 'menstrual';
  } else if (isOvulation) {
    phase = 'ovulation';
  } else if (phaseOpen && phaseDay < ovulationDay) {
    phase = 'follicular';
  } else {
    phase = 'luteal';
  }

  const daysUntilPeriod = dateISO < nextPeriodDate ? daysBetween(dateISO, nextPeriodDate) : 0;
  const ovulationDate = addISODays(anchor, ovulationDay - 1);
  const daysUntilOvulation = dateISO < ovulationDate ? daysBetween(dateISO, ovulationDate) : 0;

  return {
    date: dateISO,
    cycleDay,
    cycleLength,
    periodLength,
    phase,
    phaseLabel: daysLate > 0 ? 'Period late' : PHASE_LABELS[phase],
    isPeriod,
    isFertile,
    isOvulation,
    isPredictedPeriod,
    daysLate,
    ovulationDay,
    fertileStart,
    fertileEnd,
    daysUntilPeriod,
    daysUntilOvulation,
    nextPeriodDate,
    ovulationDate,
  };
}

export function getPhaseCopy(phase: CyclePhase): { title: string; body: string } {
  switch (phase) {
    case 'menstrual':
      return {
        title: 'Be extra gentle',
        body: 'Your period is here. Warmth, iron-rich foods, and slower plans help your body reset.',
      };
    case 'follicular':
      return {
        title: 'Energy is rising',
        body: 'Estrogen is climbing after your period. This is a lovely window for movement, ideas, and social plans.',
      };
    case 'ovulation':
      return {
        title: 'Peak fertility',
        body: 'An egg is released around now. If you are trying to conceive, this is your most fertile day.',
      };
    case 'luteal':
      return {
        title: 'Wind down softly',
        body: 'Progesterone is higher. Cravings, tender breasts, or mood shifts are common. Rest is productive.',
      };
  }
}

export function loggedCycleDays(starts: string[], start: string): number | null {
  const prior = starts.filter((item) => item && item < start).sort().pop();
  if (!prior) return null;
  const days = daysBetween(prior, start);
  return days > 0 ? days : null;
}

export function cycleLengthNote(cycleDays: number | null, keptLength: number): string | null {
  if (!cycleDays) return null;
  const measured = `This cycle was ${cycleDays} ${cycleDays === 1 ? 'day' : 'days'}.`;
  if (cycleDays < 15 || cycleDays > 60) {
    return `${measured} Predictions continue on your ${keptLength}-day cycle.`;
  }
  return measured;
}

export function rangeMarks(profile: CycleProfile, startISO: string, endISO: string): Record<string, CycleSnapshot> {
  const marks: Record<string, CycleSnapshot> = {};
  for (let iso = startISO; iso <= endISO; iso = addISODays(iso, 1)) {
    marks[iso] = getCycleSnapshot(profile, new Date(`${iso}T12:00:00`));
  }
  return marks;
}

export function monthMarks(profile: CycleProfile, monthDate: Date): Record<string, CycleSnapshot> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const last = new Date(year, month + 1, 0).getDate();
  const marks: Record<string, CycleSnapshot> = {};
  for (let day = 1; day <= last; day += 1) {
    const snapshot = getCycleSnapshot(profile, new Date(year, month, day));
    marks[snapshot.date] = snapshot;
  }
  return marks;
}
