import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Appointment } from '../types';
import { addISODays, prettyTime } from './dates';

export const DEFAULT_VISIT_TIME = '09:00';
export const DEFAULT_REMINDER_TIME = '08:00';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type ReminderResult = 'scheduled' | 'cleared' | 'denied' | 'past';

function atClock(iso: string, clock: string): Date | null {
  const [year, month, day] = iso.split('-').map(Number);
  const [hour, minute] = clock.split(':').map(Number);
  if (!year || !month || !day || !Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  const at = new Date(year, month - 1, day, hour, minute, 0, 0);
  const now = Date.now();
  if (at.getTime() > now + 2000) return at;
  const end = new Date(year, month - 1, day, 23, 59, 0, 0);
  if (now > end.getTime()) return null;
  return new Date(now + 5000);
}

export function reminderNote(iso: string, clock = DEFAULT_REMINDER_TIME): string {
  const when = atClock(iso, clock);
  if (!when) return 'This day has passed';
  if (when.getTime() - Date.now() < 20000) return 'This time has passed today, so it rings in a few seconds';
  return `Rings at ${prettyTime(clock)}`;
}

export function reminderFiresSoon(iso: string, clock = DEFAULT_REMINDER_TIME): boolean {
  const when = atClock(iso, clock);
  return Boolean(when && when.getTime() - Date.now() < 20000);
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('appointments', {
    name: 'Appointments',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function notificationsAllowed() {
  const current = await Notifications.getPermissionsAsync();
  const allowed =
    current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (allowed) return true;
  const asked = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function syncAppointmentReminder(appointment: Appointment): Promise<ReminderResult> {
  try {
    await Notifications.cancelScheduledNotificationAsync(appointment.id).catch(() => undefined);
    if (!appointment.remind) return 'cleared';
    const clock = appointment.reminderTime || DEFAULT_REMINDER_TIME;
    const day = appointment.remindOffsetDays ? addISODays(appointment.date, -appointment.remindOffsetDays) : appointment.date;
    const when = atClock(day, clock);
    if (!when) return 'past';
    const allowed = await notificationsAllowed();
    if (!allowed) return 'denied';
    await ensureChannel();
    const visit = prettyTime(appointment.time || DEFAULT_VISIT_TIME);
    const place = appointment.place ? ` · ${appointment.place}` : '';
    await Notifications.scheduleNotificationAsync({
      identifier: appointment.id,
      content: {
        title: appointment.discreet ? 'Ovella reminder' : 'Appointment reminder',
        body: appointment.discreet ? 'Time for a quick check-in.' : `${appointment.title} at ${visit}${place}`,
        sound: true,
        data: { appointmentId: appointment.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: 'appointments',
      },
    });
    return 'scheduled';
  } catch {
    return appointment.remind ? 'denied' : 'cleared';
  }
}

export function reminderAlert(result: ReminderResult, date: string, clock = DEFAULT_REMINDER_TIME) {
  if (result === 'denied') {
    return {
      title: 'Notifications are off',
      message: 'Allow notifications for Ovella so the reminder can play a sound.',
    };
  }
  if (result === 'past') {
    return {
      title: 'That day has passed',
      message: 'Choose today or a future date to set a reminder.',
    };
  }
  if (result === 'scheduled' && reminderFiresSoon(date, clock)) {
    return {
      title: 'Reminder set',
      message: 'This visit is today, so Ovella will ring in a few seconds.',
    };
  }
  return null;
}

export async function cancelAppointmentReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}
