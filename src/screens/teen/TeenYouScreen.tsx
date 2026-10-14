import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { BrandMark } from '../../components/BrandMark';
import { PrimaryButton } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { fonts } from '../../theme';
import { TeenPrefs } from '../../types';
import { prettyTime } from '../../utils/dates';

const SPARK = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.0005 1.50086V4.50075M16.5006 3.00081H13.5004M8.26269 2.11167C8.29483 1.93963 8.38613 1.78425 8.52078 1.67243C8.65544 1.56061 8.82496 1.4994 9 1.4994C9.17504 1.4994 9.34456 1.56061 9.47922 1.67243C9.61387 1.78425 9.70517 1.93963 9.73731 2.11167L10.5256 6.28001C10.5816 6.57636 10.7256 6.84895 10.9389 7.0622C11.1522 7.27546 11.4248 7.41948 11.7212 7.47546L15.8901 8.26368C16.0621 8.29581 16.2175 8.38711 16.3293 8.52174C16.4412 8.65638 16.5024 8.82588 16.5024 9.0009C16.5024 9.17592 16.4412 9.34542 16.3293 9.48006C16.2175 9.6147 16.0621 9.70599 15.8901 9.73812L11.7212 10.5263C11.4248 10.5823 11.1522 10.7263 10.9389 10.9396C10.7256 11.1529 10.5816 11.4254 10.5256 11.7218L9.73731 15.8901C9.70517 16.0622 9.61387 16.2176 9.47922 16.3294C9.34456 16.4412 9.17504 16.5024 9 16.5024C8.82496 16.5024 8.65544 16.4412 8.52078 16.3294C8.38613 16.2176 8.29483 16.0622 8.26269 15.8901L7.47438 11.7218C7.41839 11.4254 7.27435 11.1529 7.06107 10.9396C6.84779 10.7263 6.57517 10.5823 6.27878 10.5263L2.10994 9.73812C1.93788 9.70599 1.78248 9.6147 1.67065 9.48006C1.55882 9.34542 1.4976 9.17592 1.4976 9.0009C1.4976 8.82588 1.55882 8.65638 1.67065 8.52174C1.78248 8.38711 1.93788 8.29581 2.10994 8.26368L6.27878 7.47546C6.57517 7.41948 6.84779 7.27546 7.06107 7.0622C7.27435 6.84895 7.41839 6.57636 7.47438 6.28001L8.26269 2.11167ZM4.49967 15.0003C4.49967 15.8287 3.82805 16.5003 2.99955 16.5003C2.17106 16.5003 1.49943 15.8287 1.49943 15.0003C1.49943 14.1719 2.17106 13.5004 2.99955 13.5004C3.82805 13.5004 4.49967 14.1719 4.49967 15.0003Z" stroke="#A35D7A" stroke-width="2" stroke-linecap="round"/></svg>`;
const CHECK = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.8329 3.25L4.87516 9.2079L2.1671 6.49976" stroke="#A35D7A" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const TOPICS = [
  { id: 'basics', label: 'Period basics' },
  { id: 'body', label: 'My changing body' },
  { id: 'symptoms', label: 'Managing symptoms' },
  { id: 'help', label: 'When to ask for help' },
  { id: 'pregnancy', label: 'Pregnancy & support' },
];

const WASH = ['#F7D7E0', '#E9B9C7', '#C78AAE'] as const;

function clockToDate(clock: string) {
  const [hour, minute] = clock.split(':').map(Number);
  const date = new Date();
  date.setHours(Number.isFinite(hour) ? hour : 19, Number.isFinite(minute) ? minute : 0, 0, 0);
  return date;
}

function dateToClock(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function TeenYouScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { teenPrefs, saveTeenPrefs } = useApp();
  const [prefs, setPrefs] = useState<TeenPrefs>(teenPrefs);
  const [timeOpen, setTimeOpen] = useState(false);
  const [draftTime, setDraftTime] = useState(() => clockToDate(teenPrefs.reminderTime));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(teenPrefs);
  }, [teenPrefs]);

  const toggleInterest = (id: string) => {
    setSaved(false);
    setPrefs((current) => ({
      ...current,
      interests: current.interests.includes(id)
        ? current.interests.filter((item) => item !== id)
        : [...current.interests, id],
    }));
  };

  const save = async () => {
    await saveTeenPrefs(prefs);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const preview = prefs.discreet
    ? 'Time for a quick check-in.'
    : prefs.periodReminder
      ? 'Your period may start in a couple of days.'
      : 'How are you feeling today?';

  return (
    <View style={styles.root}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <LinearGradient colors={WASH} locations={[0, 0.56, 1]} style={{ paddingTop: insets.top + 6 }}>
          <View style={styles.nav}>
            <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
              <View style={styles.backWell}>
                <Ionicons name="chevron-back" size={18} color="#66294A" />
              </View>
              <Text style={styles.backText}>Settings</Text>
            </Pressable>
            <BrandMark height={27} color="#66294A" core="#ED5C7A" />
          </View>
          <View style={styles.welcome}>
            <Text style={styles.welcomeTitle}>Your body. Your vibe.</Text>
            <Text style={styles.welcomeCopy}>Let’s make this feel more like you.</Text>
          </View>
        </LinearGradient>

        <View style={styles.sheet}>
          <View style={styles.overview}>
            <View style={styles.overviewHead}>
              <Text style={styles.overviewTitle}>Make it you</Text>
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>AGES 13–17</Text>
              </View>
            </View>
            <Text style={styles.overviewCopy}>
              Periods, feelings and body changes—at your pace. Pregnancy guidance is available if you need it.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.learnHead}>
              <View style={styles.sparkWell}>
                <SvgXml xml={SPARK} width={18} height={18} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.cardTitle}>What do you want to learn first?</Text>
                <Text style={styles.cardCopy}>Choose the stuff that feels most useful right now.</Text>
              </View>
            </View>
            <View style={styles.pills}>
              {TOPICS.map((topic) => {
                const on = prefs.interests.includes(topic.id);
                return (
                  <Pressable
                    key={topic.id}
                    onPress={() => toggleInterest(topic.id)}
                    style={[styles.pill, on && styles.pillOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    {on ? <SvgXml xml={CHECK} width={13} height={13} /> : null}
                    <Text style={[styles.pillText, on && styles.pillTextOn]}>{topic.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              You can still read every topic—these just help us show you the most useful stuff first.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reminders that feel friendly</Text>
            <View style={styles.pref}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.prefTitle}>Period heads-up</Text>
                <Text style={styles.prefCopy}>A friendly heads-up before your estimated period.</Text>
              </View>
              <PrefSwitch on={prefs.periodReminder} onPress={() => { setSaved(false); setPrefs({ ...prefs, periodReminder: !prefs.periodReminder }); }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.pref}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.prefTitle}>Daily mood check-ins</Text>
                <Text style={styles.prefCopy}>Quick nudges to share how you’re feeling today.</Text>
              </View>
              <PrefSwitch on={prefs.moodReminder} onPress={() => { setSaved(false); setPrefs({ ...prefs, moodReminder: !prefs.moodReminder }); }} />
            </View>
            <Pressable onPress={() => setTimeOpen(true)} style={styles.timeRow}>
              <Text style={styles.timeLabel}>Reminder time</Text>
              <View style={styles.timeValue}>
                <Text style={styles.timeText}>{prettyTime(prefs.reminderTime).toLowerCase()}</Text>
                <Ionicons name="chevron-down" size={12} color="#A35D7A" />
              </View>
            </Pressable>
            <View style={styles.lowKey}>
              <View style={styles.pref}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.prefTitle}>Keep it low-key</Text>
                  <Text style={styles.prefCopy}>Keep reminders simple so they don’t give away what’s inside.</Text>
                </View>
                <PrefSwitch on={prefs.discreet} onPress={() => { setSaved(false); setPrefs({ ...prefs, discreet: !prefs.discreet }); }} />
              </View>
              <View style={styles.preview}>
                <Text style={styles.previewKicker}>OVELLA · PREVIEW</Text>
                <Text style={styles.previewText}>{preview}</Text>
              </View>
            </View>
          </View>

          <View style={styles.privacy}>
            <Text style={styles.privacyTitle}>Privacy quick tip</Text>
            <Text style={styles.privacyCopy}>
              Discreet wording keeps reminders simple, but it won’t hide the app or your entries from someone using your phone. You can also control lock-screen previews in your phone settings.
            </Text>
            <Pressable onPress={() => navigation.navigate('Privacy')}>
              <Text style={styles.privacyLink}>Read Privacy & data →</Text>
            </Pressable>
          </View>

          <Pressable onPress={save}>
            <LinearGradient colors={WASH} locations={[0, 0.56, 1]} style={styles.save}>
              <Text style={styles.saveText}>{saved ? 'Saved' : 'Save my picks'}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.footer}>You can change these anytime in You → Teen Mode.</Text>
        </View>
      </ScrollView>

      <TimeModal
        visible={timeOpen}
        value={prefs.reminderTime}
        draft={draftTime}
        setDraft={setDraftTime}
        onClose={() => setTimeOpen(false)}
        onSelect={(clock) => {
          setSaved(false);
          setPrefs({ ...prefs, reminderTime: clock });
          setTimeOpen(false);
        }}
      />
    </View>
  );
}

function PrefSwitch({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.switch, on && styles.switchOn]} accessibilityRole="switch" accessibilityState={{ checked: on }}>
      <View style={[styles.knob, on && styles.knobOn]} />
    </Pressable>
  );
}

function TimeModal({
  visible,
  value,
  draft,
  setDraft,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: string;
  draft: Date;
  setDraft: (date: Date) => void;
  onClose: () => void;
  onSelect: (clock: string) => void;
}) {
  useEffect(() => {
    if (visible) setDraft(clockToDate(value));
  }, [visible, value, setDraft]);

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={clockToDate(value)}
        mode="time"
        onChange={(event, next) => {
          if (event.type === 'set' && next) onSelect(dateToClock(next));
          else onClose();
        }}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.timeCard} onPress={() => undefined}>
          <Text style={styles.timeTitle}>Reminder time</Text>
          <DateTimePicker value={draft} mode="time" display="spinner" onChange={(_, next) => next && setDraft(next)} />
          <PrimaryButton label="Use this time" onPress={() => onSelect(dateToClock(draft))} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8FB' },
  nav: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontFamily: fonts.bodySemi, color: '#66294A', fontSize: 12 },
  welcome: { paddingHorizontal: 24, paddingTop: 23, paddingBottom: 26, gap: 5 },
  welcomeTitle: { fontFamily: fonts.display, color: '#66294A', fontSize: 26 },
  welcomeCopy: { fontFamily: fonts.body, color: '#66294A', fontSize: 12, lineHeight: 17 },
  sheet: {
    backgroundColor: '#FFF8FB',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -18,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    gap: 18,
  },
  overview: {
    backgroundColor: '#F7D7E0',
    borderWidth: 1,
    borderColor: '#F2D7E1',
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  overviewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  overviewTitle: { fontFamily: fonts.display, color: '#24151D', fontSize: 25 },
  ageBadge: { backgroundColor: '#F6E8EC', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  ageText: { fontFamily: fonts.bodyBold, color: '#A35D7A', fontSize: 10 },
  overviewCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: '#F2D7E1',
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  learnHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sparkWell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6E8EC',
    borderWidth: 1,
    borderColor: '#F2D7E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 14 },
  cardCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 15 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F2D7E1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pillOn: {
    backgroundColor: '#F6E8EC',
    borderColor: '#A35D7A',
  },
  pillText: { fontFamily: fonts.bodySemi, color: '#786370', fontSize: 11 },
  pillTextOn: { color: '#A35D7A' },
  hint: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  pref: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefTitle: { fontFamily: fonts.bodySemi, color: '#24151D', fontSize: 13 },
  prefCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 15 },
  divider: { height: 1, backgroundColor: '#E8DDE2' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeLabel: { fontFamily: fonts.body, color: '#786370', fontSize: 12 },
  timeValue: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontFamily: fonts.bodySemi, color: '#A35D7A', fontSize: 12 },
  lowKey: {
    backgroundColor: '#F6E8EC',
    borderWidth: 1,
    borderColor: '#F2D7E1',
    borderRadius: 16,
    padding: 12,
    gap: 9,
  },
  preview: { backgroundColor: '#FFFCFD', borderRadius: 10, padding: 10, gap: 4 },
  previewKicker: { fontFamily: fonts.bodyBold, color: '#A35D7A', fontSize: 10 },
  previewText: { fontFamily: fonts.body, color: '#24151D', fontSize: 12 },
  switch: {
    width: 44,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#E4D5DC',
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchOn: { backgroundColor: '#A35D7A' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFCFD' },
  knobOn: { marginLeft: 'auto' },
  privacy: {
    backgroundColor: '#FFF8FB',
    borderWidth: 1,
    borderColor: '#F2D7E1',
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  privacyTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 13 },
  privacyCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  privacyLink: { fontFamily: fonts.bodySemi, color: '#A35D7A', fontSize: 12 },
  save: { height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: fonts.bodyBold, color: '#66294A', fontSize: 15 },
  footer: { fontFamily: fonts.body, color: '#786370', fontSize: 11, textAlign: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(36, 21, 29, 0.45)', justifyContent: 'center', padding: 24 },
  timeCard: { backgroundColor: '#FFFCFD', borderRadius: 24, padding: 20, gap: 12 },
  timeTitle: { fontFamily: fonts.display, color: '#24151D', fontSize: 24 },
});
