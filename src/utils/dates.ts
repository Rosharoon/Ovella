import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

export function toISODate(date: Date): string {
  return format(startOfDay(date), 'yyyy-MM-dd');
}

export function fromISODate(value: string): Date {
  return startOfDay(parseISO(value));
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(fromISODate(b), fromISODate(a));
}

export function addISODays(value: string, amount: number): string {
  return toISODate(addDays(fromISODate(value), amount));
}

export function prettyTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? 'PM' : 'AM';
  const shown = hour % 12 || 12;
  return `${shown}:${minute} ${period}`;
}

export function prettyDate(value: string): string {
  return format(fromISODate(value), 'MMM d, yyyy');
}

export function prettyWeekday(value: string): string {
  return format(fromISODate(value), 'EEEE, MMM d');
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
