import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CUP_ML = 250;

export interface HydrationSip {
  id: string;
  date: string;
  time: string;
  ml: number;
}

export interface HydrationLog {
  goalCups: number;
  reminders: boolean;
  reminderStart: string;
  reminderEnd: string;
  reminderEveryHours: number;
  sips: HydrationSip[];
}

const keyFor = (userId: string) => `ovella.hydration.${userId}`;

export function defaultHydration(): HydrationLog {
  return {
    goalCups: 8,
    reminders: false,
    reminderStart: '08:00',
    reminderEnd: '20:00',
    reminderEveryHours: 2,
    sips: [],
  };
}

export async function loadHydration(userId: string): Promise<HydrationLog> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return defaultHydration();
  const saved = JSON.parse(raw) as Partial<HydrationLog>;
  return { ...defaultHydration(), ...saved, sips: saved.sips ?? [] };
}

export async function saveHydration(userId: string, log: HydrationLog) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(log));
  return syncHydrationReminders(log);
}

function clockParts(clock: string) {
  const [hour, minute] = clock.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 8,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

function reminderClocks(log: HydrationLog) {
  const start = clockParts(log.reminderStart);
  const end = clockParts(log.reminderEnd);
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  const step = Math.max(1, log.reminderEveryHours) * 60;
  const clocks: { hour: number; minute: number }[] = [];
  if (endMinutes < startMinutes) return clocks;
  for (let cursor = startMinutes; cursor <= endMinutes && clocks.length < 16; cursor += step) {
    clocks.push({ hour: Math.floor(cursor / 60), minute: cursor % 60 });
  }
  return clocks;
}

async function clearHydrationReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith('hydration-'))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier).catch(() => undefined)),
  );
}

export async function syncHydrationReminders(log: HydrationLog): Promise<'scheduled' | 'cleared' | 'denied'> {
  try {
    await clearHydrationReminders();
    if (!log.reminders) return 'cleared';
    const current = await Notifications.getPermissionsAsync();
    const allowed =
      current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    const granted = allowed
      ? true
      : (await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowSound: true, allowBadge: false },
        })).granted;
    if (!granted) return 'denied';
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('hydration', {
        name: 'Hydration',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }
    await Promise.all(
      reminderClocks(log).map((clock) =>
        Notifications.scheduleNotificationAsync({
          identifier: `hydration-${clock.hour}-${clock.minute}`,
          content: {
            title: 'Time for a sip',
            body: 'A glass of water keeps today’s goal in reach.',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: clock.hour,
            minute: clock.minute,
            channelId: 'hydration',
          },
        }),
      ),
    );
    return 'scheduled';
  } catch {
    return log.reminders ? 'denied' : 'cleared';
  }
}
