import { fromISODate } from './dates';

export function ageFromBirthDate(birthDate: string, today = new Date()): number {
  const born = fromISODate(birthDate);
  let age = today.getFullYear() - born.getFullYear();
  const month = today.getMonth() - born.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
}

export function isTeenBirthDate(birthDate?: string | null, today = new Date()): boolean {
  if (!birthDate) return false;
  const age = ageFromBirthDate(birthDate, today);
  return age >= 0 && age < 18;
}
