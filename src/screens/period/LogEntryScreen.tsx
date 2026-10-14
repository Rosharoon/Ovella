import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { Eyebrow, GradientButton, GradientWash } from '../../components/chrome';
import { DatePickerModal } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, gradient } from '../../theme';
import { pregnancyDatesFromSelection } from '../../data/pregnancyWeeks';
import { logForMode, PERIOD_SYMPTOMS, PREGNANCY_SYMPTOMS } from '../../data/symptoms';
import { fromISODate, toISODate } from '../../utils/dates';
import { LinearGradient } from 'expo-linear-gradient';

const INTENSITY = ['mild', 'moderate', 'strong'] as const;

export function LogEntryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mode, logs, saveLog, cycle, beginPregnancy, selectedDate, setSelectedDate } = useApp();
  const pregnant = mode === 'pregnancy';
  const symptoms = pregnant ? PREGNANCY_SYMPTOMS : PERIOD_SYMPTOMS;
  const initial = route.params?.date ?? selectedDate;
  const existing = logForMode(logs[initial], mode);
  const [date, setDate] = useState(initial);
  const [picked, setPicked] = useState<string[]>(existing?.symptoms ?? []);
  const [intensity, setIntensity] = useState<(typeof INTENSITY)[number]>(existing?.intensity ?? 'moderate');
  const [note, setNote] = useState(existing?.note ?? '');
  const [picker, setPicker] = useState(false);
  const [pregnancyOpen, setPregnancyOpen] = useState(false);

  const current = logForMode(logs[date], mode);

  const toggle = (id: string) => {
    setPicked((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  };

  const loadDate = (iso: string) => {
    setDate(iso);
    setSelectedDate(iso);
    const next = logForMode(logs[iso], mode);
    setPicked(next?.symptoms ?? []);
    setIntensity(next?.intensity ?? 'moderate');
    setNote(next?.note ?? '');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
        <GradientWash style={{ paddingTop: insets.top }}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
              <View style={styles.backBtn}>
                <Ionicons name="chevron-back" size={18} color={colors.white} />
              </View>
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
            <BrandMark height={27} />
          </View>
          <View style={styles.secure}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.onGradient} />
            <Text style={styles.secureText}>Secure access to your health space</Text>
          </View>
        </GradientWash>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <Eyebrow>{pregnant ? 'Pregnancy check-in' : 'Daily check-in'}</Eyebrow>
          <Text style={styles.title}>{pregnant ? 'Pregnancy symptoms' : 'Add symptoms'}</Text>
          <Text style={styles.lead}>
            {pregnant
              ? 'Record how this pregnancy feels today. It stays in your private log.'
              : "Track how you're feeling today and save it to your private record."}
          </Text>
          <Pressable onPress={() => setPicker(true)} style={styles.dateRow}>
            <View style={styles.dateCopy}>
              <Ionicons name="calendar-outline" size={17} color={colors.rose} />
              <View>
                <Text style={styles.dateKicker}>Logging for</Text>
                <Text style={styles.dateValue}>
                  {date === toISODate(new Date())
                    ? `Today, ${format(fromISODate(date), 'd MMMM')}`
                    : format(fromISODate(date), 'EEEE, d MMMM')}
                </Text>
              </View>
            </View>
            <Text style={styles.change}>Change</Text>
          </Pressable>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>What are you noticing?</Text>
            <Text style={styles.count}>{picked.length} selected</Text>
          </View>
          <View style={styles.grid}>
            {symptoms.map((item) => {
              const on = picked.includes(item.id);
              return (
                <Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.option, on && styles.optionOn]}>
                  <View style={[styles.iconWell, on && styles.iconWellOn]}>
                    <Ionicons name={item.icon} size={15} color={on ? colors.white : colors.inkSoft} />
                  </View>
                  <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{item.label}</Text>
                  {on ? <Ionicons name="checkmark" size={14} color={colors.plum} /> : null}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Overall intensity</Text>
            <Text style={styles.hint}>For selected symptoms</Text>
          </View>
          <View style={styles.intensity}>
            {INTENSITY.map((level) => {
              const on = intensity === level;
              const label = level[0].toUpperCase() + level.slice(1);
              if (on) {
                return (
                  <Pressable key={level} onPress={() => setIntensity(level)} style={styles.intensitySlot}>
                    <LinearGradient
                      colors={[...gradient.colors]}
                      locations={[...gradient.locations]}
                      style={styles.intensityOn}
                    >
                      <Text style={styles.intensityOnText}>{label}</Text>
                    </LinearGradient>
                  </Pressable>
                );
              }
              return (
                <Pressable key={level} onPress={() => setIntensity(level)} style={styles.intensityOff}>
                  <Text style={styles.intensityOffText}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Notes</Text>
            <Text style={styles.hint}>Optional</Text>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add a private note"
            placeholderTextColor={colors.muted}
            multiline
            style={styles.notes}
          />
          {mode === 'period' && cycle ? (
            <Pressable onPress={() => setPregnancyOpen(true)} style={styles.pregnancy}>
              <Ionicons name="heart-outline" size={16} color={colors.plum} />
              <Text style={styles.pregnancyText}>Log pregnancy</Text>
            </Pressable>
          ) : null}
          <GradientButton
            label="Save symptoms"
            icon="checkmark"
            onPress={async () => {
              await saveLog({
                date,
                flow: current?.flow,
                mucus: current?.mucus,
                foods: current?.foods ?? [],
                symptoms: picked,
                note,
                intensity,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            }}
          />
          <View style={styles.note}>
            <Ionicons name="lock-closed-outline" size={19} color={colors.inkSoft} />
            <Text style={styles.noteText}>Your health data is encrypted, private, and never sold.</Text>
          </View>
        </View>
      </ScrollView>
      <DatePickerModal
        visible={picker}
        value={date}
        title="Logging for"
        onClose={() => setPicker(false)}
        onSelect={loadDate}
      />
      {mode === 'period' && cycle ? (
        <DatePickerModal
          visible={pregnancyOpen}
          value={cycle.lastPeriodStart}
          title="When did your last period start?"
          hint="Choosing today keeps the last period already saved and counts your weeks from that day."
          confirmLabel="Show baby updates"
          maxDate={toISODate(new Date())}
          onClose={() => setPregnancyOpen(false)}
          onSelect={async (selected) => {
            const { lastPeriodStart, dueDate } = pregnancyDatesFromSelection(
              selected,
              [cycle.lastPeriodStart, ...cycle.loggedPeriodStarts],
              cycle.loggedPeriodStarts,
            );
            await beginPregnancy({
              lastPeriodStart,
              dueDate,
              babyName: '',
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingHorizontal: 26,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: { fontFamily: fonts.bodySemi, color: colors.onGradient, fontSize: 13 },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 26,
    paddingTop: 70,
    paddingBottom: 34,
  },
  secureText: { fontFamily: fonts.body, color: colors.onGradient, fontSize: 12 },
  sheet: {
    backgroundColor: colors.white,
    marginTop: -18,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 26,
    gap: 12,
  },
  title: { fontFamily: fonts.display, color: colors.plum, fontSize: 30, letterSpacing: -0.5, marginTop: -6 },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, lineHeight: 18, marginTop: -6 },
  dateRow: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateCopy: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  dateKicker: { fontFamily: fonts.bodyBold, color: colors.inkSoft, fontSize: 10, letterSpacing: 0.6 },
  dateValue: { fontFamily: fonts.body, color: colors.ink, fontSize: 13 },
  change: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  count: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  hint: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  option: {
    width: '48%',
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  optionOn: { backgroundColor: colors.petal, borderColor: colors.roseMuted },
  iconWell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8F1ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellOn: { backgroundColor: colors.rose },
  optionLabel: { flex: 1, fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12 },
  optionLabelOn: { fontFamily: fonts.bodyBold, color: colors.plum },
  intensity: {
    flexDirection: 'row',
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 4,
    height: 44,
    gap: 4,
  },
  intensitySlot: { flex: 1 },
  intensityOn: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  intensityOnText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 12 },
  intensityOff: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  intensityOffText: { fontFamily: fonts.bodySemi, color: colors.inkSoft, fontSize: 12 },
  notes: {
    minHeight: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    padding: 12,
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  note: {
    backgroundColor: '#F7EEF1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  noteText: { flex: 1, fontFamily: fonts.body, color: colors.inkSoft, fontSize: 11, lineHeight: 16 },
  pregnancy: {
    height: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.roseMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pregnancyText: { fontFamily: fonts.bodyBold, color: colors.plum, fontSize: 15 },
});
