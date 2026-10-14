import { addISODays } from './dates';

export interface CalendarDayMark {
  pregnancy: boolean;
  due: boolean;
  period: boolean;
  predictedPeriod: boolean;
  fertile: boolean;
  ovulation: boolean;
}

const EMPTY: CalendarDayMark = {
  pregnancy: false,
  due: false,
  period: false,
  predictedPeriod: false,
  fertile: false,
  ovulation: false,
};

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function pregnancyCalendarMarks({
  lastPeriodStart,
  dueDate,
  periodLength,
  cycleLength,
  loggedPeriodStarts,
  rangeStart,
  rangeEnd,
}: {
  lastPeriodStart: string;
  dueDate: string;
  periodLength: number;
  cycleLength: number;
  loggedPeriodStarts: string[];
  rangeStart: string;
  rangeEnd: string;
}): Record<string, CalendarDayMark> {
  const length = clamp(cycleLength, 15, 60, 28);
  const bleeding = clamp(periodLength, 1, 10, 5);
  const marks: Record<string, CalendarDayMark> = {};
  const logged = new Set(loggedPeriodStarts.filter(Boolean));

  const ensure = (iso: string) => {
    if (iso < rangeStart || iso > rangeEnd) return null;
    if (!marks[iso]) marks[iso] = { ...EMPTY };
    return marks[iso];
  };

  const pregnancyEnd = dueDate >= lastPeriodStart ? dueDate : lastPeriodStart;
  for (let iso = lastPeriodStart; iso <= pregnancyEnd; iso = addISODays(iso, 1)) {
    const mark = ensure(iso);
    if (mark) mark.pregnancy = true;
  }
  const due = ensure(pregnancyEnd);
  if (due) due.due = true;

  const starts = new Set<string>([lastPeriodStart, ...logged]);
  let cursor = lastPeriodStart;
  for (let guard = 0; guard < 80; guard += 1) {
    cursor = addISODays(cursor, -length);
    if (cursor < rangeStart) break;
    starts.add(cursor);
  }

  const ovulationDay = Math.max(10, length - 14);
  for (const start of starts) {
    const real = start === lastPeriodStart || logged.has(start);
    for (let day = 0; day < bleeding; day += 1) {
      const iso = addISODays(start, day);
      if (!real && iso >= lastPeriodStart) continue;
      const mark = ensure(iso);
      if (!mark) continue;
      if (real) mark.period = true;
      else if (!mark.period) mark.predictedPeriod = true;
    }

    if (start > lastPeriodStart) continue;
    const cycleEnd = addISODays(start, length);
    const ovulation = addISODays(start, ovulationDay - 1);
    if (ovulation >= cycleEnd || ovulation > pregnancyEnd) continue;
    const fertileStart = addISODays(ovulation, -5);
    const fertileEnd = addISODays(ovulation, 1);
    for (let iso = fertileStart; iso <= fertileEnd; iso = addISODays(iso, 1)) {
      if (iso < start || iso >= cycleEnd) continue;
      const mark = ensure(iso);
      if (!mark) continue;
      mark.fertile = true;
      if (iso === ovulation) mark.ovulation = true;
    }
  }

  return marks;
}
