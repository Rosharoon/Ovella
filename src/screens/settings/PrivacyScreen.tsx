import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientWash } from '../../components/chrome';
import { useApp } from '../../context/AppContext';
import { symptomLabel } from '../../data/symptoms';
import { colors, fonts } from '../../theme';
import { DayLog } from '../../types';
import { prettyDate } from '../../utils/dates';
import { loadHealthLink } from '../../utils/healthConnect';
import { loadHydration } from '../../utils/hydration';

function permissionLabel(granted: boolean | null) {
  if (granted == null) return 'Checking…';
  return granted ? 'Allowed' : 'Not allowed';
}

function logLine(log: DayLog) {
  const bits = [
    log.mood ? `mood ${log.mood}` : '',
    log.flow ? `flow ${log.flow}` : '',
    log.symptoms.length ? log.symptoms.map((id) => symptomLabel(id, log.loggedMode ?? null)).join(', ') : '',
    log.sleepHours ? `${log.sleepHours}h sleep` : '',
    log.note ? `note: ${log.note}` : '',
  ].filter(Boolean);
  return `${prettyDate(log.date)}${bits.length ? ` — ${bits.join(' · ')}` : ''}`;
}

export function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    user,
    mode,
    cycle,
    pregnancy,
    pregnancyHistory,
    logs,
    appointments,
    clearLogs,
    eraseTracking,
    deleteAccount,
  } = useApp();
  const [notifications, setNotifications] = useState<boolean | null>(null);
  const [location, setLocation] = useState<boolean | null>(null);
  const [healthConnected, setHealthConnected] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<'export' | 'logs' | 'tracking' | 'account' | null>(null);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    const notes = await Notifications.getPermissionsAsync();
    const place = await Location.getForegroundPermissionsAsync();
    setNotifications(notes.granted || notes.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL);
    setLocation(place.granted);
    if (user) {
      const link = await loadHealthLink(user.id);
      setHealthConnected(link.connected);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const exportData = async () => {
    if (!user || busy) return;
    setBusy('export');
    const hydration = await loadHydration(user.id);
    const checkIns = Object.values(logs).sort((a, b) => a.date.localeCompare(b.date));
    const lines = [
      'Ovella data export',
      'Stored on this phone. This file does not include your password.',
      '',
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      user.birthDate ? `Date of birth: ${prettyDate(user.birthDate)}` : '',
      `Mode: ${mode ?? 'not chosen'}`,
      '',
      cycle
        ? `Cycle: ${cycle.cycleLength} days, period usually ${cycle.periodLength} days, last start ${prettyDate(cycle.lastPeriodStart)}`
        : 'Cycle: none',
      cycle?.loggedPeriodStarts.length
        ? `Logged period starts: ${cycle.loggedPeriodStarts.map(prettyDate).join(', ')}`
        : 'Logged period starts: none',
      pregnancy
        ? `Pregnancy: due ${prettyDate(pregnancy.dueDate)}${pregnancy.babyName ? `, ${pregnancy.babyName}` : ''}`
        : 'Pregnancy: none',
      pregnancyHistory.length
        ? `Pregnancy log: ${pregnancyHistory
            .map((record) => `${record.outcome} ${prettyDate(record.lastPeriodStart)}–${prettyDate(record.endDate)} (${record.days} days)`)
            .join('; ')}`
        : '',
      '',
      `Check-ins (${checkIns.length})`,
      ...(checkIns.length ? checkIns.map(logLine) : ['None']),
      '',
      `Appointments (${appointments.length})`,
      ...(appointments.length
        ? appointments.map((item) => `${prettyDate(item.date)} ${item.time ?? ''} ${item.title}${item.place ? ` · ${item.place}` : ''}`)
        : ['None']),
      '',
      `Water logged: ${hydration.sips.length} cups`,
    ].filter((line) => line !== '');
    try {
      const result = await Share.share({ title: 'Ovella data export', message: lines.join('\n') });
      if (result.action === Share.sharedAction) {
        setNotice('Export shared.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setNotice('The export could not be shared.');
    }
    setBusy(null);
  };

  const confirmClearLogs = () => {
    const count = Object.keys(logs).length;
    Alert.alert(
      'Clear check-ins?',
      count ? `This removes ${count} saved ${count === 1 ? 'day' : 'days'} of symptoms, mood, and notes.` : 'There are no check-ins to clear.',
      count
        ? [
            { text: 'Keep them', style: 'cancel' },
            {
              text: 'Clear check-ins',
              style: 'destructive',
              onPress: async () => {
                setBusy('logs');
                await clearLogs();
                setNotice('Check-ins cleared.');
                setBusy(null);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
            },
          ]
        : [{ text: 'OK' }],
    );
  };

  const confirmErase = () => {
    Alert.alert(
      'Delete tracking data?',
      'This removes logged periods, check-ins, appointments, water, pregnancy records, and the Apple Health link. Your account stays.',
      [
        { text: 'Keep data', style: 'cancel' },
        {
          text: 'Delete tracking',
          style: 'destructive',
          onPress: async () => {
            setBusy('tracking');
            await eraseTracking();
            setNotice('Tracking data deleted.');
            setBusy(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This signs you out and removes the data stored for this account on this phone.',
      [
        { text: 'Keep account', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            setBusy('account');
            await deleteAccount();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <GradientWash style={{ paddingTop: insets.top + 8 }}>
          <View style={styles.nav}>
            <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
              <Ionicons name="chevron-back" size={18} color={colors.white} />
              <Text style={styles.backText}>You</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Privacy & data</Text>
          <Text style={styles.lead}>Your logs stay on this phone. Nothing here is sold or sent to a server.</Text>
        </GradientWash>

        <View style={styles.sheet}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Export</Text>
            <Text style={styles.cardCopy}>
              Share a copy of your cycle, check-ins, appointments, and water log. Your password is not included.
            </Text>
            <Pressable onPress={exportData} style={styles.action} disabled={busy != null}>
              <Ionicons name="share-outline" size={18} color={colors.plum} />
              <Text style={styles.actionText}>{busy === 'export' ? 'Preparing…' : 'Export my data'}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Permissions</Text>
            <PermRow icon="notifications-outline" title="Notifications" value={permissionLabel(notifications)} />
            <View style={styles.divider} />
            <PermRow icon="location-outline" title="Location" value={permissionLabel(location)} />
            <View style={styles.divider} />
            <PermRow
              icon="heart-outline"
              title="Apple Health"
              value={healthConnected == null ? 'Checking…' : healthConnected ? 'Connected' : 'Not connected'}
            />
            <Text style={styles.cardCopy}>
              Ovella uses notifications for reminders, and location only when you pin an appointment. Lock-screen previews are controlled in your phone settings.
            </Text>
            <Pressable onPress={() => Linking.openSettings()} style={styles.action}>
              <Ionicons name="settings-outline" size={18} color={colors.plum} />
              <Text style={styles.actionText}>Open phone settings</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data controls</Text>
            <Text style={styles.cardCopy}>
              {Object.keys(logs).length} check-ins · {appointments.length} appointments
              {cycle ? ` · ${cycle.loggedPeriodStarts.length} logged periods` : ''}
            </Text>
            <Pressable onPress={confirmClearLogs} style={styles.action} disabled={busy != null}>
              <Ionicons name="trash-outline" size={18} color={colors.plum} />
              <Text style={styles.actionText}>Clear check-ins</Text>
            </Pressable>
            <Pressable onPress={confirmErase} style={styles.action} disabled={busy != null}>
              <Ionicons name="close-circle-outline" size={18} color={colors.periodText} />
              <Text style={[styles.actionText, styles.danger]}>Delete tracking data</Text>
            </Pressable>
            <Pressable onPress={confirmDeleteAccount} style={styles.action} disabled={busy != null}>
              <Ionicons name="person-remove-outline" size={18} color={colors.periodText} />
              <Text style={[styles.actionText, styles.danger]}>Delete account</Text>
            </Pressable>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

function PermRow({ icon, title, value }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string }) {
  return (
    <View style={styles.perm}>
      <Ionicons name={icon} size={16} color={colors.rose} />
      <Text style={styles.permTitle}>{title}</Text>
      <Text style={styles.permValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  nav: { paddingHorizontal: 20, marginBottom: 12 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodySemi, color: colors.white, fontSize: 14 },
  title: { fontFamily: fonts.display, color: colors.white, fontSize: 32, paddingHorizontal: 24 },
  lead: {
    fontFamily: fonts.body,
    color: 'rgba(255,252,253,0.9)',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  sheet: {
    marginTop: -16,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 12,
  },
  cardTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 22 },
  cardCopy: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, lineHeight: 19 },
  action: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  actionText: { fontFamily: fonts.bodySemi, color: colors.plum, fontSize: 14 },
  danger: { color: colors.periodText },
  divider: { height: 1, backgroundColor: colors.line },
  perm: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permTitle: { flex: 1, fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 14 },
  permValue: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13 },
  notice: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, textAlign: 'center' },
});
