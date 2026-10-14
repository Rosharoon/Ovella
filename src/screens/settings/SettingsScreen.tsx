import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { GradientWash } from '../../components/chrome';
import { DatePickerModal, Stepper, TextField, PrimaryButton } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, shadows } from '../../theme';
import { AppMode } from '../../types';
import {
  EARLIEST_ARRIVAL_WEEK,
  dueFromLastPeriod,
  lastPeriodForWeek,
  lastPeriodFromDue,
  pregnancyDatesFromSelection,
  pregnancyWeek,
  resolvedDueDate,
  resolvedLastPeriod,
} from '../../data/pregnancyWeeks';
import { isTeenBirthDate } from '../../utils/age';
import { daysBetween, prettyDate, toISODate } from '../../utils/dates';
import { connectHealth, disconnectHealth, HealthLink, healthSnapshot, loadHealthLink, syncHealth } from '../../utils/healthConnect';
import { HydrationLog, loadHydration } from '../../utils/hydration';
import { format, parseISO } from 'date-fns';
import { appointmentSummary } from '../pregnancy/AppointmentsScreen';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    user,
    mode,
    cycle,
    pregnancy,
    pregnancyHistory,
    appointments,
    logs,
    teenPrefs,
    remindersEnabled,
    setRemindersEnabled,
    setMode,
    saveCycle,
    savePregnancy,
    finishPregnancy,
    changePassword,
    signOut,
  } = useApp();
  const today = toISODate(new Date());
  const teen = isTeenBirthDate(user?.birthDate);
  const visits = [...appointments].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const [openCycle, setOpenCycle] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySaved, setSecuritySaved] = useState(false);
  const [picker, setPicker] = useState<'period' | 'due' | 'lmp' | null>(null);
  const [babyName, setBabyName] = useState(pregnancy?.babyName ?? '');
  const [celebrate, setCelebrate] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);
  const [health, setHealth] = useState<HealthLink | null>(null);
  const [hydration, setHydration] = useState<HydrationLog | null>(null);
  const [healthBusy, setHealthBusy] = useState(false);
  const initials = (user?.name || 'Ov')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!user) return;
    loadHealthLink(user.id).then(setHealth);
    loadHydration(user.id).then(setHydration);
  }, [user]);

  const preview = healthSnapshot(cycle, logs, hydration);
  const healthSub = health?.connected
    ? `Apple Health · ${health.periodDays} period ${health.periodDays === 1 ? 'day' : 'days'} · ${health.waterMl} ml today`
    : 'Apple Health · not connected';

  const switchMode = async (next: AppMode) => {
    await Haptics.selectionAsync();
    await setMode(next);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView bounces={false}>
        <GradientWash style={{ paddingTop: insets.top }}>
          <View style={styles.nav}>
            <BrandMark height={27} />
          </View>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {mode === 'pregnancy' ? 'Pregnancy tracking active' : 'Cycle tracking active'}
                </Text>
              </View>
            </View>
            <Ionicons name="pencil-outline" size={18} color={colors.rose} />
          </View>
        </GradientWash>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          {teen ? (
            <Pressable onPress={() => navigation.navigate('TeenMode')} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.iconWell, { backgroundColor: '#F6E8EC' }]}>
                  <Ionicons name="sparkles-outline" size={17} color="#A35D7A" />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.rowTitle}>Teen Mode</Text>
                  <Text style={styles.rowSub}>Interests, reminders, and discreet wording</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={colors.muted} />
              </View>
            </Pressable>
          ) : null}
          <View style={styles.card}>
            <Pressable onPress={() => setOpenCycle((v) => !v)} style={styles.row}>
              <View style={[styles.iconWell, { backgroundColor: '#F3E8EC' }]}>
                <Ionicons name="calendar-outline" size={17} color={colors.rose} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>Cycle & pregnancy settings</Text>
                <Text style={styles.rowSub}>
                  {mode === 'pregnancy' && pregnancy
                    ? `Week ${pregnancyWeek(pregnancy)} · due ${prettyDate(resolvedDueDate(pregnancy))}`
                    : cycle
                      ? `${cycle.cycleLength}-day cycle · ${mode || 'period'} mode`
                      : 'Choose how Ovella supports you'}
                </Text>
              </View>
              <Ionicons name={openCycle ? 'chevron-down' : 'chevron-forward'} size={17} color={colors.muted} />
            </Pressable>
            {openCycle ? (
              <View style={styles.expand}>
                {teen && mode !== 'pregnancy' ? null : mode === 'pregnancy' ? (
                  <Text style={styles.cycleHint}>
                    Period tracking returns when the baby arrives or the pregnancy ends.
                  </Text>
                ) : (
                  <View style={styles.modeRow}>
                    <ModeChip label="Period" active={mode === 'period'} onPress={() => switchMode('period')} />
                    <ModeChip label="Pregnancy" active={false} onPress={() => switchMode('pregnancy')} />
                  </View>
                )}
                {mode === 'period' && cycle ? (
                  <>
                    <Pressable onPress={() => setPicker('period')} style={styles.inline}>
                      <Text style={styles.rowSub}>Last period start</Text>
                      <Text style={styles.rowTitle}>{prettyDate(cycle.lastPeriodStart)}</Text>
                    </Pressable>
                    <Stepper
                      label="Cycle length"
                      value={cycle.cycleLength}
                      min={15}
                      max={60}
                      suffix="days"
                      onChange={(cycleLength) => saveCycle({ ...cycle, cycleLength })}
                    />
                    <Text style={styles.cycleHint}>
                      Change this any time. When you log another period, Ovella updates the length from the gap between your recorded starts.
                    </Text>
                    <Stepper
                      label="Period length"
                      value={cycle.periodLength}
                      min={2}
                      max={10}
                      suffix="days"
                      onChange={(periodLength) => saveCycle({ ...cycle, periodLength })}
                    />
                  </>
                ) : null}
                {mode === 'pregnancy' && pregnancy ? (
                  <>
                    <Pressable onPress={() => setPicker('lmp')} style={styles.inline}>
                      <Text style={styles.rowSub}>Last period start</Text>
                      <Text style={styles.rowTitle}>{prettyDate(resolvedLastPeriod(pregnancy))}</Text>
                    </Pressable>
                    <Stepper
                      label="Pregnancy week"
                      value={pregnancyWeek(pregnancy)}
                      min={1}
                      max={42}
                      suffix={pregnancyWeek(pregnancy) === 1 ? 'week' : 'weeks'}
                      onChange={(week) => {
                        const lastPeriodStart = lastPeriodForWeek(week);
                        savePregnancy({
                          ...pregnancy,
                          lastPeriodStart,
                          dueDate: dueFromLastPeriod(lastPeriodStart),
                        });
                      }}
                    />
                    <Text style={styles.cycleHint}>
                      Weeks are counted from the first day of your last period. Changing the week updates that date and your due date.
                    </Text>
                    <Pressable onPress={() => setPicker('due')} style={styles.inline}>
                      <Text style={styles.rowSub}>Due date</Text>
                      <Text style={styles.rowTitle}>{prettyDate(resolvedDueDate(pregnancy))}</Text>
                    </Pressable>
                    <TextField
                      label="Baby’s name"
                      value={babyName}
                      onChangeText={setBabyName}
                      placeholder="Little one"
                      autoCapitalize="words"
                    />
                    <PrimaryButton label="Save baby name" onPress={() => savePregnancy({ ...pregnancy, babyName })} />
                    <View style={styles.outcomeRow}>
                      {pregnancyWeek(pregnancy) >= EARLIEST_ARRIVAL_WEEK ? (
                        <Pressable
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            setCelebrate(true);
                          }}
                          style={styles.arrivedBtn}
                          accessibilityRole="button"
                        >
                          <Ionicons name="heart" size={16} color={colors.white} />
                          <Text style={styles.arrivedText}>Baby arrived</Text>
                        </Pressable>
                      ) : null}
                      <Pressable
                        onPress={() => finishPregnancy('ended')}
                        style={styles.endedBtn}
                        accessibilityRole="button"
                      >
                        <Text style={styles.endedText}>Pregnancy ended</Text>
                      </Pressable>
                    </View>
                    <Text style={styles.cycleHint}>
                      {pregnancyWeek(pregnancy) >= EARLIEST_ARRIVAL_WEEK
                        ? 'Baby arrived opens a note, then returns to period tracking. Pregnancy ended keeps these days in your log and returns quietly.'
                        : `Baby arrived appears from week ${EARLIEST_ARRIVAL_WEEK}, when a very early birth is possible. Until then, Pregnancy ended keeps these days in your log and returns to period tracking.`}
                    </Text>
                    <View style={styles.visitStack}>
                      <Text style={styles.rowSub}>Appointments</Text>
                      {visits.length ? (
                        visits.map((item) => (
                          <Pressable
                            key={item.id}
                            onPress={() => navigation.navigate('Appointments')}
                            style={styles.visitCard}
                          >
                            <Text style={styles.visitTitle}>{item.title}</Text>
                            <Text style={styles.visitText}>{appointmentSummary(item, today)}</Text>
                          </Pressable>
                        ))
                      ) : (
                        <Pressable onPress={() => navigation.navigate('Appointments')} style={styles.visitCard}>
                          <Text style={styles.visitText}>Add an appointment</Text>
                        </Pressable>
                      )}
                    </View>
                  </>
                ) : null}
              </View>
            ) : null}
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={[styles.iconWell, { backgroundColor: '#F4E8D8' }]}>
                <Ionicons name="notifications-outline" size={17} color="#C4A574" />
              </View>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>Reminders</Text>
                <Text style={styles.rowSub}>Period, medication, and check-ins</Text>
              </View>
              <Switch
                value={teen ? teenPrefs.periodReminder : remindersEnabled}
                onValueChange={(value) => {
                  setRemindersEnabled(value);
                }}
                trackColor={{ false: colors.line, true: colors.plum }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {mode === 'period' && pregnancyHistory.length ? (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.iconWell, { backgroundColor: '#F3E8EC' }]}>
                  <Ionicons name="heart-outline" size={17} color={colors.rose} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.rowTitle}>Pregnancy log</Text>
                  <Text style={styles.rowSub}>Days you were pregnant stay here</Text>
                </View>
              </View>
              <View style={styles.logList}>
                {[...pregnancyHistory].reverse().map((record) => (
                  <View key={record.id} style={styles.visitCard}>
                    <Text style={styles.visitTitle}>
                      {record.outcome === 'arrived' ? 'Baby arrived' : 'Pregnancy ended'}
                      {record.babyName ? ` · ${record.babyName}` : ''}
                    </Text>
                    <Text style={styles.visitText}>
                      {prettyDate(record.lastPeriodStart)} – {prettyDate(record.endDate)} · {record.days}{' '}
                      {record.days === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.card}>
            <SettingRow
              icon="shield-checkmark-outline"
              well="#DCE8E3"
              title="Privacy & data"
              sub="Export, permissions, data controls"
              onPress={() => navigation.navigate('Privacy')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="heart-outline"
              well="#DCE8E3"
              title="Connected health data"
              sub={healthSub}
              onPress={() => setHealthOpen(true)}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="key-outline"
              well="#F3E8EC"
              title="Security"
              sub="Change password"
              onPress={() => {
                setCurrentPassword('');
                setNextPassword('');
                setConfirmPassword('');
                setSecurityError('');
                setSecuritySaved(false);
                setSecurityOpen(true);
              }}
            />
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => navigation.navigate('Help')} style={styles.help}>
              <Ionicons name="help-circle-outline" size={16} color="#6E676B" />
              <Text style={styles.helpText}>Help center</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                signOut();
              }}
              style={styles.signOut}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.periodText} />
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>
          <Text style={styles.foot}>Your health data is encrypted and never sold.</Text>
        </View>
      </ScrollView>
      <Modal visible={securityOpen} transparent animationType="fade" onRequestClose={() => setSecurityOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSecurityOpen(false)}>
          <Pressable style={[styles.modalCard, styles.healthCard]} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Change password</Text>
            <Text style={styles.modalBody}>
              {user?.authProvider === 'apple' || user?.authProvider === 'google'
                ? 'Set a password so this account can also sign in with email on this phone.'
                : 'Enter your current password, then choose a new one.'}
            </Text>
            {user?.authProvider === 'apple' || user?.authProvider === 'google' ? null : (
              <TextField label="Current password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry />
            )}
            <TextField label="New password" value={nextPassword} onChangeText={setNextPassword} placeholder="At least 6 characters" secureTextEntry />
            <TextField label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat the new password" secureTextEntry />
            {securityError ? <Text style={styles.securityError}>{securityError}</Text> : null}
            {securitySaved ? <Text style={styles.securitySaved}>Password updated.</Text> : null}
            <PrimaryButton
              label="Save password"
              onPress={async () => {
                if (nextPassword.length < 6) {
                  setSecurityError('Use at least 6 characters.');
                  setSecuritySaved(false);
                  return;
                }
                if (nextPassword !== confirmPassword) {
                  setSecurityError('Those passwords do not match.');
                  setSecuritySaved(false);
                  return;
                }
                const message = await changePassword(currentPassword, nextPassword);
                if (message) {
                  setSecurityError(message);
                  setSecuritySaved(false);
                  return;
                }
                setSecurityError('');
                setSecuritySaved(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
            <Pressable onPress={() => setSecurityOpen(false)} style={styles.modalLater}>
              <Text style={styles.modalLaterText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={healthOpen} transparent animationType="fade" onRequestClose={() => setHealthOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setHealthOpen(false)}>
          <Pressable style={[styles.modalCard, styles.healthCard]} onPress={() => undefined}>
            <Pressable
              onPress={() => setHealthOpen(false)}
              style={styles.healthClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={colors.ink} />
            </Pressable>
            <Text style={[styles.modalTitle, styles.healthTitle]}>Apple Health</Text>
            <Text style={styles.modalBody}>
              {health?.connected
                ? 'Connected. Period days, sleep, and water from your logs are included.'
                : 'Share period days, sleep, and water from the days you have logged.'}
            </Text>
            <View style={styles.healthList}>
              <HealthLine label="Period days" value={String(preview.periodDays)} />
              <HealthLine label="Nights of sleep" value={String(preview.sleepNights)} />
              <HealthLine label="Water today" value={`${preview.waterMl} ml`} />
            </View>
            {health?.lastSync ? (
              <Text style={styles.healthSync}>Last sync {format(parseISO(health.lastSync), 'd MMM, h:mm a')}</Text>
            ) : null}
            <PrimaryButton
              label={healthBusy ? 'Syncing…' : health?.connected ? 'Sync now' : 'Connect'}
              onPress={async () => {
                if (!user || healthBusy) return;
                setHealthBusy(true);
                const latest = hydration ?? (await loadHydration(user.id));
                setHydration(latest);
                const next = health?.connected
                  ? await syncHealth(user.id, cycle, logs, latest)
                  : await connectHealth(user.id, cycle, logs, latest);
                setHealth(next);
                setHealthBusy(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
            {health?.connected ? (
              <Pressable
                onPress={async () => {
                  if (!user) return;
                  setHealth(await disconnectHealth(user.id));
                  Haptics.selectionAsync();
                  setHealthOpen(false);
                }}
                style={styles.modalLater}
              >
                <Text style={styles.modalLaterText}>Disconnect</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => setHealthOpen(false)} style={styles.modalLater}>
              <Text style={styles.modalLaterText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={celebrate} transparent animationType="fade" onRequestClose={() => setCelebrate(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <BrandMark height={36} color={colors.brand} core="#ED5C7A" />
            <Text style={styles.modalTitle}>Congratulations</Text>
            <Text style={styles.modalBody}>
              {pregnancy?.babyName?.trim()
                ? `${pregnancy.babyName.trim()} is here.`
                : 'Your baby is here.'}{' '}
              You were pregnant for{' '}
              {pregnancy ? Math.max(0, daysBetween(resolvedLastPeriod(pregnancy), today)) : 0} days.
            </Text>
            <PrimaryButton
              label="Back to period tracking"
              onPress={() => {
                setCelebrate(false);
                finishPregnancy('arrived');
              }}
            />
            <Pressable onPress={() => setCelebrate(false)} style={styles.modalLater}>
              <Text style={styles.modalLaterText}>Not yet</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {cycle ? (
        <DatePickerModal
          visible={picker === 'period'}
          value={cycle.lastPeriodStart}
          title="Last period start"
          maxDate={today}
          onClose={() => setPicker(null)}
          onSelect={(lastPeriodStart) => {
            saveCycle({
              ...cycle,
              lastPeriodStart,
              loggedPeriodStarts: Array.from(new Set([...cycle.loggedPeriodStarts, lastPeriodStart])),
            });
          }}
        />
      ) : null}
      {pregnancy ? (
        <DatePickerModal
          visible={picker === 'due'}
          value={resolvedDueDate(pregnancy)}
          title="Due date"
          onClose={() => setPicker(null)}
          onSelect={(dueDate) => {
            if (dueDate === toISODate(new Date())) {
              const dates = pregnancyDatesFromSelection(
                dueDate,
                [pregnancy.lastPeriodStart ?? '', cycle?.lastPeriodStart ?? '', ...(cycle?.loggedPeriodStarts ?? [])],
                cycle?.loggedPeriodStarts ?? [],
              );
              savePregnancy({ ...pregnancy, ...dates });
              return;
            }
            savePregnancy({
              ...pregnancy,
              dueDate,
              lastPeriodStart: lastPeriodFromDue(dueDate),
            });
          }}
        />
      ) : null}
      {pregnancy ? (
        <DatePickerModal
          visible={picker === 'lmp'}
          value={resolvedLastPeriod(pregnancy)}
          title="Last period start"
          hint="Choosing today keeps your saved last period and counts the weeks from that day."
          maxDate={today}
          onClose={() => setPicker(null)}
          onSelect={(selected) => {
            const dates = pregnancyDatesFromSelection(
              selected,
              [pregnancy.lastPeriodStart ?? '', cycle?.lastPeriodStart ?? '', ...(cycle?.loggedPeriodStarts ?? [])],
              cycle?.loggedPeriodStarts ?? [],
            );
            savePregnancy({ ...pregnancy, ...dates });
          }}
        />
      ) : null}
    </View>
  );
}

function HealthLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.healthLine}>
      <Text style={styles.rowSub}>{label}</Text>
      <Text style={styles.rowTitle}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  well,
  title,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  well: string;
  title: string;
  sub: string;
  onPress?: () => void;
}) {
  const row = (
    <View style={styles.row}>
      <View style={[styles.iconWell, { backgroundColor: well }]}>
        <Ionicons name={icon} size={17} color={colors.rose} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
    </View>
  );
  if (!onPress) return row;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {row}
    </Pressable>
  );
}

function ModeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  nav: {
    paddingHorizontal: 24,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    marginHorizontal: 24,
    marginTop: 18,
    marginBottom: 28,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3E8EC',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: fonts.display, color: '#8E3E56', fontSize: 22 },
  name: { fontFamily: fonts.bodyBold, color: '#292629', fontSize: 16 },
  email: { fontFamily: fonts.body, color: '#6E676B', fontSize: 12 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: '#C7D9D1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { fontFamily: fonts.bodyBold, color: colors.fertileText, fontSize: 12 },
  sheet: {
    backgroundColor: colors.white,
    marginTop: -16,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  card: {
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWell: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 1 },
  rowTitle: { fontFamily: fonts.body, color: '#292629', fontSize: 12 },
  rowSub: { fontFamily: fonts.body, color: '#6E676B', fontSize: 11, lineHeight: 14 },
  divider: { height: 1, backgroundColor: colors.line },
  expand: { paddingBottom: 12, gap: 8 },
  modeRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.plum, borderColor: colors.plum },
  chipText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12 },
  chipTextOn: { color: colors.white },
  inline: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  visitStack: { alignSelf: 'stretch', gap: 10 },
  visitCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    ...shadows.soft,
  },
  visitTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  visitText: {
    fontFamily: fonts.body,
    color: '#6E676B',
    fontSize: 12,
    lineHeight: 17,
  },
  outcomeRow: { flexDirection: 'row', gap: 8 },
  arrivedBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
  },
  arrivedText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 13 },
  endedBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  endedText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 13, textAlign: 'center' },
  logList: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 21, 29, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, textAlign: 'center' },
  modalBody: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.inkSoft, textAlign: 'center' },
  healthCard: { alignItems: 'stretch', position: 'relative' },
  healthTitle: { paddingHorizontal: 28 },
  healthClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6E8EC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  healthList: { gap: 8, alignSelf: 'stretch' },
  healthLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  healthSync: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12, textAlign: 'center' },
  modalLater: { paddingVertical: 8, alignItems: 'center' },
  modalLaterText: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 15 },
  securityError: { fontFamily: fonts.bodySemi, color: colors.periodText, fontSize: 13, textAlign: 'center' },
  securitySaved: { fontFamily: fonts.bodySemi, color: colors.mintDeep, fontSize: 13, textAlign: 'center' },
  cycleHint: {
    fontFamily: fonts.body,
    color: '#6E676B',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  actions: { flexDirection: 'row', gap: 8 },
  help: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#F8F1ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helpText: { fontFamily: fonts.body, color: '#6E676B', fontSize: 12 },
  signOut: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.peach,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  signOutText: { fontFamily: fonts.bodyBold, color: colors.periodText, fontSize: 12 },
  foot: { textAlign: 'center', fontFamily: fonts.body, color: '#8E8589', fontSize: 10 },
});
