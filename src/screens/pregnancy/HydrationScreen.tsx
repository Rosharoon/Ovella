import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { HydrationAmbient, WaterGlassIcon, WaterGlassIllustration } from '../../components/HydrationArt';
import { PrimaryButton } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, gradient, shadows } from '../../theme';
import { prettyTime, toISODate } from '../../utils/dates';
import {
  CUP_ML,
  HydrationLog,
  HydrationSip,
  defaultHydration,
  loadHydration,
  saveHydration,
} from '../../utils/hydration';

function cupsLabel(ml: number) {
  const cups = ml / CUP_ML;
  const shown = Number.isInteger(cups) ? String(cups) : cups.toFixed(1);
  return cups === 1 ? '1 cup' : `${shown} cups`;
}

function mlLabel(ml: number) {
  return `${ml.toLocaleString('en-US')} ml`;
}

function clockLabel(clock: string) {
  return prettyTime(clock).replace(':00', '');
}

function stamp(date = new Date()) {
  return {
    date: toISODate(date),
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
  };
}

export function HydrationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useApp();
  const [log, setLog] = useState<HydrationLog>(defaultHydration);
  const logRef = useRef(log);
  const [ready, setReady] = useState(false);
  logRef.current = log;
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    loadHydration(user.id).then((saved) => {
      if (!active) return;
      setLog(saved);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user) return null;

  const today = toISODate(new Date());
  const todaySips = log.sips.filter((sip) => sip.date === today).sort((a, b) => b.time.localeCompare(a.time) || b.id.localeCompare(a.id));
  const ml = todaySips.reduce((total, sip) => total + sip.ml, 0);
  const cups = ml / CUP_ML;
  const cupsShown = Number.isInteger(cups) ? String(cups) : cups.toFixed(1);
  const remaining = Math.max(0, log.goalCups - cups);
  const remainingLabel =
    remaining === 0 ? 'Goal reached' : remaining === 1 ? '1 cup to your goal' : `${Number.isInteger(remaining) ? remaining : remaining.toFixed(1)} cups to your goal`;
  const filled = Math.min(log.goalCups, Math.floor(cups));

  const commit = async (next: HydrationLog) => {
    logRef.current = next;
    setLog(next);
    const result = await saveHydration(user.id, next);
    if (result === 'denied') {
      const cleared = { ...next, reminders: false };
      logRef.current = cleared;
      setLog(cleared);
      await saveHydration(user.id, cleared);
      Alert.alert('Notifications are off', 'Turn notifications on for Ovella to get sip reminders.');
    }
  };

  const addCups = async (count: number) => {
    if (!ready || count <= 0) return;
    const when = stamp();
    const current = logRef.current;
    const sip: HydrationSip = { id: Date.now().toString(), ...when, ml: count * CUP_ML };
    await commit({ ...current, sips: [sip, ...current.sips] });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nav}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to Today">
            <View style={styles.backWell}>
              <Ionicons name="chevron-back" size={16} color={colors.ink} />
            </View>
            <Text style={styles.backText}>Today</Text>
          </Pressable>
          <BrandMark height={28} color={colors.brand} core={colors.rose} />
        </View>

        <Text style={styles.title}>Hydration check-in</Text>
        <Text style={styles.date}>Today · {format(new Date(), 'EEEE, d MMMM')}</Text>

        <LinearGradient
          colors={[...gradient.colors]}
          locations={[...gradient.locations]}
          style={styles.progress}
        >
          <View style={styles.ambient}>
            <HydrationAmbient />
          </View>
          <View style={styles.summary}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.kicker}>Every sip counts</Text>
              <Text style={styles.cups}>
                <Text style={styles.cupsCount}>{cupsShown} </Text>
                <Text style={styles.cupsOf}>of {log.goalCups} cups</Text>
              </Text>
              <Text style={styles.progressMeta}>
                {mlLabel(ml)} logged · {remainingLabel}
              </Text>
            </View>
            <WaterGlassIllustration />
          </View>
          <View style={styles.segments}>
            {Array.from({ length: log.goalCups }, (_, index) => (
              <View key={index} style={[styles.segment, index < filled ? styles.segmentOn : styles.segmentOff]} />
            ))}
          </View>
        </LinearGradient>

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Add water</Text>
          <Text style={styles.sectionMeta}>1 cup = {CUP_ML} ml</Text>
        </View>
        <View style={styles.amounts}>
          <Pressable onPress={() => addCups(1)} style={styles.amountGrow} accessibilityRole="button" accessibilityLabel="Add 1 cup">
            <LinearGradient colors={[...gradient.colors]} locations={[...gradient.locations]} style={styles.amountPrimary}>
              <Text style={styles.amountPrimaryLabel}>+ 1 cup</Text>
              <Text style={styles.amountPrimaryMeta}>{CUP_ML} ml</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => addCups(2)} style={styles.amountSecondary} accessibilityRole="button" accessibilityLabel="Add 2 cups">
            <Text style={styles.amountLabel}>+ 2 cups</Text>
            <Text style={styles.amountMeta}>{CUP_ML * 2} ml</Text>
          </Pressable>
          <Pressable onPress={() => setCustom(true)} style={styles.amountSecondary} accessibilityRole="button" accessibilityLabel="Choose a custom amount">
            <Text style={styles.amountLabel}>Custom</Text>
            <Text style={styles.amountMeta}>Choose amount</Text>
          </Pressable>
        </View>

        <View style={[styles.sectionHead, { marginTop: 22 }]}>
          <Text style={styles.section}>Today's intake</Text>
          <Pressable onPress={() => setEditing((value) => !value)} accessibilityRole="button">
            <Text style={styles.edit}>{editing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>
        <View style={styles.list}>
          {todaySips.length ? (
            todaySips.map((sip, index) => (
              <View key={sip.id} style={[styles.entry, index < todaySips.length - 1 && styles.entryLine]}>
                <View style={styles.iconWell}>
                  <WaterGlassIcon />
                </View>
                <Text style={styles.entryTime}>{prettyTime(sip.time)}</Text>
                <Text style={styles.entryCups}>{cupsLabel(sip.ml)}</Text>
                <Text style={styles.entryMl}>{mlLabel(sip.ml)}</Text>
                {editing ? (
                  <Pressable
                    onPress={() => commit({ ...logRef.current, sips: logRef.current.sips.filter((item) => item.id !== sip.id) })}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${cupsLabel(sip.ml)}`}
                  >
                    <Ionicons name="close" size={16} color={colors.muted} />
                  </Pressable>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Nothing logged yet. Add a cup when you take a sip.</Text>
          )}
        </View>

        <Text style={[styles.section, { marginTop: 22 }]}>Make it yours</Text>
        <View style={styles.list}>
          <Pressable onPress={() => setGoalOpen(true)} style={[styles.setting, styles.entryLine]} accessibilityRole="button">
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.settingTitle}>Daily goal</Text>
              <Text style={styles.settingMeta}>
                {log.goalCups} cups · {mlLabel(log.goalCups * CUP_ML)}
              </Text>
            </View>
            <Text style={styles.adjust}>Adjust</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.rose} />
          </Pressable>
          <View style={styles.setting}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.settingTitle}>Gentle reminders</Text>
              <Text style={styles.settingMeta}>
                Every {log.reminderEveryHours} {log.reminderEveryHours === 1 ? 'hour' : 'hours'} · {clockLabel(log.reminderStart)}–{clockLabel(log.reminderEnd)}
              </Text>
            </View>
            <Pressable onPress={() => setReminderOpen(true)} accessibilityRole="button">
              <Text style={styles.adjust}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => commit({ ...logRef.current, reminders: !logRef.current.reminders })}
              style={[styles.switch, log.reminders && styles.switchOn]}
              accessibilityRole="switch"
              accessibilityState={{ checked: log.reminders }}
              accessibilityLabel="Gentle reminders"
            >
              <View style={[styles.knob, log.reminders && styles.knobOn]} />
            </Pressable>
          </View>
        </View>
        <Text style={styles.note}>Your goal is personal. Adjust it to your needs and your care team's guidance.</Text>
      </ScrollView>

      <StepperModal
        visible={custom}
        title="Custom amount"
        value={1}
        min={1}
        max={12}
        suffix="cup"
        detail={(value) => mlLabel(value * CUP_ML)}
        confirm="Add water"
        onClose={() => setCustom(false)}
        onSave={(value) => {
          setCustom(false);
          void addCups(value);
        }}
      />
      <StepperModal
        visible={goalOpen}
        title="Daily goal"
        value={log.goalCups}
        min={4}
        max={16}
        suffix="cup"
        detail={(value) => mlLabel(value * CUP_ML)}
        confirm="Save goal"
        onClose={() => setGoalOpen(false)}
          onSave={(value) => {
          setGoalOpen(false);
          void commit({ ...logRef.current, goalCups: value });
        }}
      />
      <ReminderModal
        visible={reminderOpen}
        start={log.reminderStart}
        end={log.reminderEnd}
        every={log.reminderEveryHours}
        onClose={() => setReminderOpen(false)}
        onSave={(next) => {
          setReminderOpen(false);
          void commit({ ...logRef.current, ...next });
        }}
      />
    </View>
  );
}

function StepperModal({
  visible,
  title,
  value,
  min,
  max,
  suffix,
  detail,
  confirm,
  onClose,
  onSave,
}: {
  visible: boolean;
  title: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  detail: (value: number) => string;
  confirm: string;
  onClose: () => void;
  onSave: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setDraft((item) => Math.max(min, item - 1))} style={styles.stepBtn} accessibilityLabel="Decrease">
              <Ionicons name="remove" size={18} color={colors.rose} />
            </Pressable>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.stepValue}>
                {draft} {draft === 1 ? suffix : `${suffix}s`}
              </Text>
              <Text style={styles.settingMeta}>{detail(draft)}</Text>
            </View>
            <Pressable onPress={() => setDraft((item) => Math.min(max, item + 1))} style={styles.stepBtn} accessibilityLabel="Increase">
              <Ionicons name="add" size={18} color={colors.rose} />
            </Pressable>
          </View>
          <PrimaryButton label={confirm} onPress={() => onSave(draft)} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ReminderModal({
  visible,
  start,
  end,
  every,
  onClose,
  onSave,
}: {
  visible: boolean;
  start: string;
  end: string;
  every: number;
  onClose: () => void;
  onSave: (next: { reminderStart: string; reminderEnd: string; reminderEveryHours: number }) => void;
}) {
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [draftEvery, setDraftEvery] = useState(every);
  const [picking, setPicking] = useState<'start' | 'end' | null>(null);
  useEffect(() => {
    if (!visible) return;
    setDraftStart(start);
    setDraftEnd(end);
    setDraftEvery(every);
  }, [visible, start, end, every]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.sheetTitle}>Gentle reminders</Text>
          <View style={styles.stepper}>
            <Pressable onPress={() => setDraftEvery((item) => Math.max(1, item - 1))} style={styles.stepBtn}>
              <Ionicons name="remove" size={18} color={colors.rose} />
            </Pressable>
            <Text style={styles.stepValue}>Every {draftEvery} {draftEvery === 1 ? 'hour' : 'hours'}</Text>
            <Pressable onPress={() => setDraftEvery((item) => Math.min(4, item + 1))} style={styles.stepBtn}>
              <Ionicons name="add" size={18} color={colors.rose} />
            </Pressable>
          </View>
          <Pressable onPress={() => setPicking('start')} style={styles.timeRow}>
            <Text style={styles.settingTitle}>From</Text>
            <Text style={styles.adjust}>{prettyTime(draftStart)}</Text>
          </Pressable>
          <Pressable onPress={() => setPicking('end')} style={styles.timeRow}>
            <Text style={styles.settingTitle}>Until</Text>
            <Text style={styles.adjust}>{prettyTime(draftEnd)}</Text>
          </Pressable>
          <PrimaryButton
            label="Save reminders"
            onPress={() => onSave({ reminderStart: draftStart, reminderEnd: draftEnd, reminderEveryHours: draftEvery })}
          />
          {picking && Platform.OS === 'android' ? (
            <DateTimePicker
              value={clockDate(picking === 'start' ? draftStart : draftEnd)}
              mode="time"
              onChange={(event, next) => {
                if (event.type === 'set' && next) {
                  const clock = dateClock(next);
                  if (picking === 'start') setDraftStart(clock);
                  else setDraftEnd(clock);
                }
                setPicking(null);
              }}
            />
          ) : null}
          {picking && Platform.OS === 'ios' ? (
            <DateTimePicker
              value={clockDate(picking === 'start' ? draftStart : draftEnd)}
              mode="time"
              display="spinner"
              onChange={(_, next) => {
                if (!next) return;
                const clock = dateClock(next);
                if (picking === 'start') setDraftStart(clock);
                else setDraftEnd(clock);
              }}
            />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function clockDate(clock: string) {
  const [hour, minute] = clock.split(':').map(Number);
  const next = new Date();
  next.setHours(Number.isFinite(hour) ? hour : 8, Number.isFinite(minute) ? minute : 0, 0, 0);
  return next;
}

function dateClock(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  backWell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontFamily: fonts.bodySemi, color: '#8A6F7B', fontSize: 12 },
  title: { fontFamily: fonts.display, fontSize: 25, color: colors.plum },
  date: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12, marginTop: 4 },
  progress: { marginTop: 12, borderRadius: 22, padding: 16, overflow: 'hidden', ...shadows.card },
  ambient: { position: 'absolute', right: -24, top: -44 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  kicker: { fontFamily: fonts.bodySemi, color: '#FCE8F2', fontSize: 11 },
  cups: { marginTop: 4 },
  cupsCount: { fontFamily: fonts.display, color: colors.white, fontSize: 30 },
  cupsOf: { fontFamily: fonts.display, color: colors.white, fontSize: 18 },
  progressMeta: { fontFamily: fonts.body, color: '#FCE8F2', fontSize: 11, marginTop: 4 },
  segments: { flexDirection: 'row', gap: 5, marginTop: 12 },
  segment: { flex: 1, height: 7, borderRadius: 999 },
  segmentOn: { backgroundColor: colors.peach },
  segmentOff: { backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionHead: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  sectionMeta: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 10 },
  amounts: { flexDirection: 'row', gap: 8, marginTop: 8 },
  amountGrow: { flex: 1 },
  amountPrimary: { height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', gap: 3 },
  amountPrimaryLabel: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 13 },
  amountPrimaryMeta: { fontFamily: fonts.body, color: '#FCE8F2', fontSize: 10 },
  amountSecondary: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  amountLabel: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 13 },
  amountMeta: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 10 },
  edit: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  list: {
    marginTop: 8,
    backgroundColor: colors.field,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  entry: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 10 },
  entryLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  iconWell: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.petal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTime: { flex: 1, fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12 },
  entryCups: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12 },
  entryMl: { width: 52, textAlign: 'right', fontFamily: fonts.body, color: '#8A6F7B', fontSize: 10 },
  empty: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12, paddingVertical: 14 },
  setting: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingTitle: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12 },
  settingMeta: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 11 },
  adjust: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  switch: {
    width: 38,
    height: 23,
    borderRadius: 999,
    backgroundColor: colors.line,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchOn: { backgroundColor: colors.rose },
  knob: { width: 19, height: 19, borderRadius: 10, backgroundColor: colors.white },
  knobOn: { marginLeft: 'auto' },
  note: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 10, lineHeight: 14, marginTop: 8 },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 22 },
  sheet: { backgroundColor: colors.white, borderRadius: 24, padding: 20, gap: 14 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  timeRow: {
    backgroundColor: colors.field,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
