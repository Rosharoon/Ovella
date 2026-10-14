import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addISODays, fromISODate } from './dates';

const PERIOD_ID = 'account-period';
const CHECKIN_ID = 'account-checkin';

export async function syncAccountReminders(enabled: boolean, nextPeriodDate: string | null) {
  try {
    await Notifications.cancelScheduledNotificationAsync(PERIOD_ID).catch(() => undefined);
    await Notifications.cancelScheduledNotificationAsync(CHECKIN_ID).catch(() => undefined);
    if (!enabled) return;

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
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Ovella reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    await Notifications.scheduleNotificationAsync({
      identifier: CHECKIN_ID,
      content: {
        title: 'Ovella',
        body: 'Time for a quick check-in.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
        channelId: 'reminders',
      },
    });

    if (!nextPeriodDate) return;
    const when = fromISODate(addISODays(nextPeriodDate, -2));
    when.setHours(19, 0, 0, 0);
    if (when.getTime() <= Date.now()) return;
    await Notifications.scheduleNotificationAsync({
      identifier: PERIOD_ID,
      content: {
        title: 'Ovella',
        body: 'Your period may start in a couple of days.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: 'reminders',
      },
    });
  } catch {
    // Reminders stay optional if the device cannot schedule them.
  }
}
