import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TeenPrefs } from '../types';
import { addISODays, fromISODate } from './dates';

const PERIOD_ID = 'teen-period';
const MOOD_ID = 'teen-mood';

function clockParts(clock: string) {
  const [hour, minute] = clock.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 19,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

export async function syncTeenReminders(prefs: TeenPrefs, nextPeriodDate: string | null) {
  try {
    await Notifications.cancelScheduledNotificationAsync(PERIOD_ID).catch(() => undefined);
    await Notifications.cancelScheduledNotificationAsync(MOOD_ID).catch(() => undefined);
    if (!prefs.periodReminder && !prefs.moodReminder) return;

    const current = await Notifications.getPermissionsAsync();
    const allowed =
      current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    const granted = allowed
      ? true
      : (
          await Notifications.requestPermissionsAsync({
            ios: { allowAlert: true, allowSound: true, allowBadge: false },
          })
        ).granted;
    if (!granted) return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('teen', {
        name: 'Teen reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    const clock = clockParts(prefs.reminderTime);
    const quiet = prefs.discreet ? 'Time for a quick check-in.' : '';

    if (prefs.moodReminder) {
      await Notifications.scheduleNotificationAsync({
        identifier: MOOD_ID,
        content: {
          title: 'Ovella',
          body: quiet || 'How are you feeling today?',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: clock.hour,
          minute: clock.minute,
          channelId: 'teen',
        },
      });
    }

    if (prefs.periodReminder && nextPeriodDate) {
      const when = fromISODate(addISODays(nextPeriodDate, -2));
      when.setHours(clock.hour, clock.minute, 0, 0);
      if (when.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          identifier: PERIOD_ID,
          content: {
            title: 'Ovella',
            body: quiet || 'Your period may start in a couple of days.',
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: when,
            channelId: 'teen',
          },
        });
      }
    }
  } catch {
    // Reminders stay optional if the device cannot schedule them.
  }
}
