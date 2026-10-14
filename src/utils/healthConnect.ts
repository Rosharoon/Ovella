import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { CycleProfile, DayLog } from '../types';
import { periodLengthFor } from './cycle';
import { addISODays, toISODate } from './dates';
import { HydrationLog } from './hydration';

export interface HealthLink {
  connected: boolean;
  lastSync: string | null;
  periodDays: number;
  sleepNights: number;
  waterMl: number;
  appleHealth: boolean;
}

const emptyLink = (): HealthLink => ({
  connected: false,
  lastSync: null,
  periodDays: 0,
  sleepNights: 0,
  waterMl: 0,
  appleHealth: false,
});

const keyFor = (userId: string) => `ovella.health.${userId}`;

export async function loadHealthLink(userId: string): Promise<HealthLink> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return emptyLink();
  return { ...emptyLink(), ...(JSON.parse(raw) as Partial<HealthLink>) };
}

async function saveHealthLink(userId: string, link: HealthLink) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(link));
}

export function healthSnapshot(cycle: CycleProfile | null, logs: Record<string, DayLog>, hydration: HydrationLog | null) {
  const today = toISODate(new Date());
  const periodDays = new Set<string>();
  if (cycle) {
    cycle.loggedPeriodStarts.forEach((start) => {
      const length = periodLengthFor(cycle, start);
      for (let index = 0; index < length; index += 1) {
        const day = addISODays(start, index);
        if (day <= today) periodDays.add(day);
      }
    });
  }
  const sleepNights = Object.values(logs).filter((log) => (log.sleepHours ?? 0) > 0).length;
  const waterMl = (hydration?.sips ?? []).filter((sip) => sip.date === today).reduce((sum, sip) => sum + sip.ml, 0);
  return { periodDays: periodDays.size, sleepNights, waterMl };
}

function appleHealthKit() {
  if (Platform.OS !== 'ios') return null;
  const kit = NativeModules.AppleHealthKit as { initHealthKit?: (permissions: object, callback: (error: string) => void) => void } | undefined;
  return kit?.initHealthKit ? kit : null;
}

function requestAppleHealth(): Promise<boolean> {
  const initHealthKit = appleHealthKit()?.initHealthKit;
  if (!initHealthKit) return Promise.resolve(false);
  return new Promise((resolve) => {
    initHealthKit(
      {
        permissions: {
          read: ['MenstrualFlow', 'SleepAnalysis', 'Water'],
          write: ['MenstrualFlow', 'SleepAnalysis', 'Water'],
        },
      },
      (error) => resolve(!error),
    );
  });
}

export async function connectHealth(
  userId: string,
  cycle: CycleProfile | null,
  logs: Record<string, DayLog>,
  hydration: HydrationLog | null,
): Promise<HealthLink> {
  const appleHealth = await requestAppleHealth();
  const counts = healthSnapshot(cycle, logs, hydration);
  const link: HealthLink = { connected: true, lastSync: new Date().toISOString(), appleHealth, ...counts };
  await saveHealthLink(userId, link);
  return link;
}

export async function syncHealth(
  userId: string,
  cycle: CycleProfile | null,
  logs: Record<string, DayLog>,
  hydration: HydrationLog | null,
): Promise<HealthLink> {
  const current = await loadHealthLink(userId);
  if (!current.connected) return current;
  const appleHealth = current.appleHealth || (await requestAppleHealth());
  const counts = healthSnapshot(cycle, logs, hydration);
  const link: HealthLink = { connected: true, lastSync: new Date().toISOString(), appleHealth, ...counts };
  await saveHealthLink(userId, link);
  return link;
}

export async function disconnectHealth(userId: string): Promise<HealthLink> {
  const link = emptyLink();
  await saveHealthLink(userId, link);
  return link;
}
