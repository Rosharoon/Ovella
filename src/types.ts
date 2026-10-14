export type AppMode = 'period' | 'pregnancy';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  birthDate?: string;
  authProvider?: 'email' | 'apple' | 'google';
}

export interface TeenPrefs {
  interests: string[];
  periodReminder: boolean;
  moodReminder: boolean;
  reminderTime: string;
  discreet: boolean;
}

export const defaultTeenPrefs = (): TeenPrefs => ({
  interests: ['basics', 'body'],
  periodReminder: true,
  moodReminder: false,
  reminderTime: '19:00',
  discreet: true,
});

export interface CycleProfile {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  loggedPeriodStarts: string[];
  periodEnds?: Record<string, string>;
}

export interface PregnancyProfile {
  dueDate: string;
  lastPeriodStart?: string;
  babyName: string;
}

export interface PregnancyRecord {
  id: string;
  lastPeriodStart: string;
  endDate: string;
  days: number;
  outcome: 'arrived' | 'ended';
  babyName: string;
}

export interface Appointment {
  id: string;
  date: string;
  title: string;
  place: string;
  latitude?: number;
  longitude?: number;
  time?: string;
  reminderTime?: string;
  remind?: boolean;
  remindOffsetDays?: number;
  discreet?: boolean;
}

export interface StoredState {
  user: Omit<User, 'password'> | null;
  mode: AppMode | null;
  cycle: CycleProfile | null;
  pregnancy: PregnancyProfile | null;
  pregnancyHistory: PregnancyRecord[];
  logs: Record<string, DayLog>;
  appointments: Appointment[];
  teenPrefs?: TeenPrefs;
  remindersEnabled?: boolean;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type LunarName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface CycleSnapshot {
  date: string;
  cycleDay: number;
  cycleLength: number;
  periodLength: number;
  phase: CyclePhase;
  phaseLabel: string;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPredictedPeriod: boolean;
  daysLate: number;
  ovulationDay: number;
  fertileStart: number;
  fertileEnd: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  nextPeriodDate: string;
  ovulationDate: string;
}

export interface DayLog {
  date: string;
  flow?: 'light' | 'medium' | 'heavy' | 'super';
  mucus?: string;
  symptoms: string[];
  foods: string[];
  note?: string;
  intensity?: 'mild' | 'moderate' | 'strong';
  loggedMode?: AppMode;
  mood?: string;
  sleepHours?: number;
}
