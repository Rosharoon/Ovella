import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { logForMode, PERIOD_SYMPTOMS, PREGNANCY_SYMPTOMS } from '../../data/symptoms';
import { colors, fonts } from '../../theme';
import { prettyWeekday, toISODate } from '../../utils/dates';
import { CUP_ML, HydrationLog, loadHydration, saveHydration } from '../../utils/hydration';
import { TeenBrandBar } from './TeenChrome';

const MOODS = ['Calm', 'Okay', 'Worried', 'Low', 'Mixed'] as const;
const LEVELS = ['mild', 'moderate', 'strong'] as const;

export function TeenCheckInScreen() {
  const insets = useSafeAreaInsets();
  const { user, mode, logs, saveLog, selectedDate } = useApp();
  const pregnant = mode === 'pregnancy';
  const symptoms = pregnant ? PREGNANCY_SYMPTOMS : PERIOD_SYMPTOMS;
  const date = selectedDate || toISODate(new Date());
  const existing = logForMode(logs[date], pregnant ? 'pregnancy' : 'period');
  const [mood, setMood] = useState(existing?.mood ?? '');
  const [picked, setPicked] = useState<string[]>(existing?.symptoms ?? []);
  const [intensity, setIntensity] = useState<(typeof LEVELS)[number]>(existing?.intensity ?? 'mild');
  const [note, setNote] = useState(existing?.note ?? '');
  const [sleep, setSleep] = useState(existing?.sleepHours ?? 7);
  const [cups, setCups] = useState(0);
  const [hydration, setHydration] = useState<HydrationLog | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const log = logForMode(logs[date], pregnant ? 'pregnancy' : 'period');
    setMood(log?.mood ?? '');
    setPicked(log?.symptoms ?? []);
    setIntensity(log?.intensity ?? 'mild');
    setNote(log?.note ?? '');
    setSleep(log?.sleepHours ?? 7);
    setSaved(false);
  }, [date, logs, pregnant]);

  useEffect(() => {
    if (!user) return;
    loadHydration(user.id).then((log) => {
      setHydration(log);
      setCups(log.sips.filter((sip) => sip.date === date).reduce((sum, sip) => sum + sip.ml, 0) / CUP_ML);
    });
  }, [user, date]);

  const toggle = (id: string) => {
    setPicked((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  };

  const changeCups = async (next: number) => {
    if (!user || !hydration) return;
    const count = Math.max(0, Math.min(16, next));
    const others = hydration.sips.filter((sip) => sip.date !== date);
    const today = Array.from({ length: count }, (_, index) => ({
      id: `${date}-${index}`,
      date,
      time: '12:00',
      ml: CUP_ML,
    }));
    const updated = { ...hydration, sips: [...today, ...others] };
    setCups(count);
    setHydration(updated);
    await saveHydration(user.id, updated);
  };

  const save = async () => {
    await saveLog({
      date,
      symptoms: picked,
      foods: existing?.foods ?? [],
      flow: existing?.flow,
      mucus: existing?.mucus,
      note,
      intensity: picked.length ? intensity : undefined,
      mood: mood || undefined,
      sleepHours: sleep,
      loggedMode: pregnant ? 'pregnancy' : 'period',
    });
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }}>
        <TeenBrandBar />
        <View style={styles.page}>
          <View style={styles.heading}>
            <Text style={styles.title}>Daily Health Check-in</Text>
            <Text style={styles.lead}>A little space to notice how you feel. Skip anything you don’t want to record.</Text>
          </View>
          <View style={styles.when}>
            <Text style={styles.whenText}>{prettyWeekday(date)}</Text>
            <Text style={styles.whenHint}>{saved ? 'Saved' : 'Optional'}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>How’s your mood?</Text>
              <Text style={styles.hint}>Choose what fits</Text>
            </View>
            <View style={styles.wrap}>
              {MOODS.map((item) => {
                const on = mood === item;
                return (
                  <Pressable key={item} onPress={() => setMood(on ? '' : item)} style={[styles.choice, on && styles.choiceOn]}>
                    <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.help}>Mixed feelings are okay. You don’t have to explain them.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>What are you noticing?</Text>
              <Text style={styles.hint}>Select any</Text>
            </View>
            <View style={styles.wrap}>
              {symptoms.map((item) => {
                const on = picked.includes(item.id);
                return (
                  <Pressable key={item.id} onPress={() => toggle(item.id)} style={[styles.choice, on && styles.choiceOn]}>
                    <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {picked.length ? (
              <View style={styles.intensity}>
                <Text style={styles.intensityTitle}>How intense does it feel?</Text>
                <View style={styles.levels}>
                  {LEVELS.map((level) => {
                    const on = intensity === level;
                    return (
                      <Pressable key={level} onPress={() => setIntensity(level)} style={[styles.level, on && styles.choiceOn]}>
                        <Text style={[styles.choiceText, on && styles.choiceTextOn]}>
                          {level[0].toUpperCase() + level.slice(1)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <Text style={styles.help}>
              These are your observations, not a diagnosis. Discuss symptoms that worry you with a healthcare professional.
            </Text>
          </View>

          <View style={styles.warn}>
            <Ionicons name="alert-circle-outline" size={18} color="#5E2B44" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.warnTitle}>Severe pain, heavy bleeding or fainting?</Text>
              <Text style={styles.warnCopy}>Seek urgent medical care now. Don’t wait for a check-in.</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Water & rest</Text>
              <Text style={styles.hint}>Optional</Text>
            </View>
            <View style={styles.split}>
              <View style={styles.well}>
                <Ionicons name="water-outline" size={18} color="#B86A8F" />
                <Text style={styles.wellTitle}>Water so far</Text>
                <View style={styles.counter}>
                  <Pressable onPress={() => changeCups(cups - 1)} style={styles.step}>
                    <Ionicons name="remove" size={14} color="#B86A8F" />
                  </Pressable>
                  <Text style={styles.count}>{cups} cups</Text>
                  <Pressable onPress={() => changeCups(cups + 1)} style={styles.step}>
                    <Ionicons name="add" size={14} color="#B86A8F" />
                  </Pressable>
                </View>
              </View>
              <View style={styles.well}>
                <Ionicons name="moon-outline" size={18} color="#B86A8F" />
                <Text style={styles.wellTitle}>Sleep last night</Text>
                <View style={styles.counter}>
                  <Pressable onPress={() => setSleep((value) => Math.max(0, value - 1))} style={styles.step}>
                    <Ionicons name="remove" size={14} color="#B86A8F" />
                  </Pressable>
                  <Text style={styles.count}>{sleep}h</Text>
                  <Pressable onPress={() => setSleep((value) => Math.min(16, value + 1))} style={styles.step}>
                    <Ionicons name="add" size={14} color="#B86A8F" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Private note</Text>
              <Text style={styles.hint}>Optional</Text>
            </View>
            <TextInput
              value={note}
              onChangeText={(value) => setNote(value.slice(0, 500))}
              placeholder="Only write what feels safe to store."
              placeholderTextColor="#8A6B7F"
              multiline
              style={styles.input}
            />
            <Text style={styles.countRight}>{note.length} / 500</Text>
          </View>

          <Pressable onPress={save}>
            <LinearGradient colors={['#F6C6D8', '#E7A3B8', '#B86A8F']} locations={[0, 0.56, 1]} style={styles.save}>
              <Ionicons name="checkmark" size={16} color={colors.white} />
              <Text style={styles.saveText}>{saved ? 'Saved' : 'Save check-in'}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.footer}>
            Ovella helps you track, not diagnose. Ask a qualified healthcare professional for personal care advice.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8FC' },
  page: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  heading: { backgroundColor: '#FFF1F8', borderRadius: 20, borderWidth: 1, borderColor: '#F0D6E1', padding: 16, gap: 8 },
  title: { fontFamily: fonts.display, color: '#5E2B44', fontSize: 26 },
  lead: { fontFamily: fonts.body, color: '#8A6B7F', fontSize: 13, lineHeight: 19 },
  when: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FCE7F3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  whenText: { fontFamily: fonts.bodySemi, color: '#B86A8F', fontSize: 11 },
  whenHint: { fontFamily: fonts.body, color: '#8A6B7F', fontSize: 10 },
  card: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: '#F0D6E1', padding: 16, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: fonts.bodyBold, color: '#5E2B44', fontSize: 15 },
  hint: { fontFamily: fonts.bodySemi, color: '#B86A8F', fontSize: 11 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderRadius: 999, borderWidth: 1, borderColor: '#F0D6E1', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.white },
  choiceOn: { backgroundColor: '#FCE7F3', borderColor: '#B86A8F' },
  choiceText: { fontFamily: fonts.body, color: '#8A6B7F', fontSize: 12 },
  choiceTextOn: { fontFamily: fonts.bodySemi, color: '#B86A8F' },
  help: { fontFamily: fonts.body, color: '#8A6B7F', fontSize: 11, lineHeight: 16 },
  intensity: { backgroundColor: '#FFF8FC', borderRadius: 16, borderWidth: 1, borderColor: '#F0D6E1', padding: 12, gap: 8 },
  intensityTitle: { fontFamily: fonts.bodyBold, color: '#5E2B44', fontSize: 13 },
  levels: { flexDirection: 'row', gap: 6 },
  level: { flex: 1, height: 34, borderRadius: 999, borderWidth: 1, borderColor: '#F0D6E1', alignItems: 'center', justifyContent: 'center' },
  warn: { flexDirection: 'row', gap: 9, backgroundColor: '#FFF8FC', borderRadius: 16, borderWidth: 1, borderColor: '#F0D6E1', padding: 12 },
  warnTitle: { fontFamily: fonts.bodyBold, color: '#5E2B44', fontSize: 12 },
  warnCopy: { fontFamily: fonts.body, color: '#5E2B44', fontSize: 11, lineHeight: 16 },
  split: { flexDirection: 'row', gap: 10 },
  well: { flex: 1, backgroundColor: '#FFF8FC', borderRadius: 16, borderWidth: 1, borderColor: '#F0D6E1', padding: 13, gap: 8 },
  wellTitle: { fontFamily: fonts.bodyBold, color: '#5E2B44', fontSize: 12 },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#F0D6E1', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  count: { fontFamily: fonts.bodySemi, color: '#5E2B44', fontSize: 15 },
  input: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0D6E1',
    backgroundColor: '#FFF8FC',
    padding: 13,
    fontFamily: fonts.body,
    color: '#5E2B44',
    fontSize: 13,
    textAlignVertical: 'top',
  },
  countRight: { fontFamily: fonts.body, color: '#8A6B7F', fontSize: 10, textAlign: 'right' },
  save: { height: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 15 },
  footer: { fontFamily: fonts.body, color: '#8A6B7F', fontSize: 10, lineHeight: 14, textAlign: 'center' },
});
