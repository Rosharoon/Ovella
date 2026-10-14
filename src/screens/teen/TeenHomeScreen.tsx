import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { format, startOfWeek, addDays } from 'date-fns';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DatePickerModal } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { pregnancyDatesFromSelection } from '../../data/pregnancyWeeks';
import { colors, fonts } from '../../theme';
import { cycleLengthNote, getCycleAnchor, getCycleSnapshot } from '../../utils/cycle';
import { addISODays, prettyDate, toISODate } from '../../utils/dates';
import { TeenBrandBar } from './TeenChrome';
import { TeenPregnancyHome } from './TeenPregnancyHome';

export function TeenHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, mode, pregnancy, cycle, logs, logPeriodStart, unlogPeriodStart, endPeriod, beginPregnancy, selectedDate, setSelectedDate } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pregnancyOpen, setPregnancyOpen] = useState(false);
  if (mode === 'pregnancy' && pregnancy) return <TeenPregnancyHome />;
  if (!cycle) return null;

  const today = toISODate(new Date());
  const snapshot = getCycleSnapshot(cycle);
  const first = user?.name?.split(' ')[0] || 'there';
  const openAnchor = getCycleAnchor(cycle, today);
  const loggedThisCycle = cycle.loggedPeriodStarts.includes(openAnchor) && snapshot.daysLate === 0;
  const usualEnd = addISODays(openAnchor, cycle.periodLength - 1);
  const endedOn = cycle.periodEnds?.[openAnchor];
  const canEndPeriod = loggedThisCycle && today >= openAnchor && today < usualEnd && !endedOn;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const week = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const progress = Math.min(1, snapshot.cycleDay / cycle.cycleLength);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const estimate = snapshot.daysLate
    ? snapshot.daysLate === 1
      ? '1 day late'
      : `${snapshot.daysLate} days late`
    : `Around ${prettyDate(snapshot.nextPeriodDate)}`;

  return (
    <LinearGradient colors={['#F7D7E0', '#EFC4D4', '#FFF8FB']} locations={[0, 0.45, 1]} style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28 }}>
        <TeenBrandBar />
        <View style={styles.page}>
          <View style={styles.greeting}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>{format(new Date(), 'EEEE, d MMMM')}</Text>
              <Text style={styles.hello}>Hey {first}! 🌸 How are you?</Text>
            </View>
            <View style={styles.bell}>
              <Ionicons name="notifications-outline" size={18} color={colors.rose} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.eyebrow}>YOUR CYCLE RIGHT NOW ✨</Text>
            <View style={styles.summary}>
              <View style={styles.dial}>
                <Svg width={110} height={110}>
                  <Circle cx={55} cy={55} r={radius} stroke="#F6D5E4" strokeWidth={10} fill="none" />
                  <Circle
                    cx={55}
                    cy={55}
                    r={radius}
                    stroke="#D46B96"
                    strokeWidth={10}
                    fill="none"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="55, 55"
                  />
                </Svg>
                <View style={styles.dialLabel}>
                  <Text style={styles.dayValue}>{snapshot.cycleDay}</Text>
                  <Text style={styles.dayCaption}>CYCLE DAY</Text>
                </View>
              </View>
              <View style={styles.estimate}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>NEXT PERIOD 🌺</Text>
                </View>
                <Text style={styles.estimateTitle}>{estimate}</Text>
                <Text style={styles.estimateSub}>
                  {snapshot.daysLate ? 'Log it when it starts.' : 'Based on your recent logs.'}
                </Text>
              </View>
            </View>
            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={15} color="#C57AA5" />
              <Text style={styles.noteText}>
                An estimate, not a deadline. Cycles can vary, especially in the first few years. 💕
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.calHead}>
              <Text style={styles.calTitle}>{format(new Date(), 'MMMM yyyy')}</Text>
              <Pressable onPress={() => navigation.navigate('Calendar')}>
                <Text style={styles.calLink}>Full calendar</Text>
              </Pressable>
            </View>
            <View style={styles.week}>
              {week.map((day) => {
                const iso = toISODate(day);
                const mark = getCycleSnapshot(cycle, day);
                const selected = iso === selectedDate;
                const logged = mark.isPeriod && !mark.isPredictedPeriod;
                const estimated = mark.isPredictedPeriod;
                const peak = mark.isOvulation;
                const fertile = mark.isFertile && !peak;
                return (
                  <Pressable key={iso} onPress={() => setSelectedDate(iso)} style={styles.day}>
                    <Text style={styles.weekday}>{format(day, 'EEE')}</Text>
                    <View
                      style={[
                        styles.date,
                        estimated && { backgroundColor: colors.periodPinkSoft },
                        logged && { backgroundColor: colors.periodPink },
                        fertile && { backgroundColor: colors.ovulationSoft },
                        peak && { backgroundColor: colors.ovulationPeak },
                        selected && styles.dateOn,
                      ]}
                    >
                      <Text style={[styles.dateNum, (selected || peak || logged) && styles.dateNumOn]}>
                        {format(day, 'd')}
                      </Text>
                    </View>
                    <View style={[styles.dot, logs[iso]?.symptoms?.length || logs[iso]?.mood ? styles.dotOn : null]} />
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.legend}>
              <View style={[styles.dot, styles.dotOn]} />
              <Text style={styles.legendText}>Check-in logged</Text>
            </View>
          </View>

          <Pressable
            onPress={async () => {
              if (loggedThisCycle) {
                await unlogPeriodStart(openAnchor);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                return;
              }
              setPickerOpen(true);
            }}
          >
            <LinearGradient colors={['#F7D7E0', '#E9B9C7', '#C78AAE']} locations={[0, 0.56, 1]} style={styles.logBtn}>
              <Ionicons name={loggedThisCycle ? 'trash-outline' : 'water-outline'} size={18} color="#66294A" />
              <Text style={styles.logText}>{loggedThisCycle ? 'Remove log' : 'Log my period 🌺'}</Text>
            </LinearGradient>
          </Pressable>
          {canEndPeriod ? (
            <Pressable
              onPress={async () => {
                await endPeriod();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              style={styles.endBtn}
            >
              <Text style={styles.endText}>End period</Text>
            </Pressable>
          ) : null}
          {loggedThisCycle && endedOn ? (
            <Text style={styles.ended}>This period ended {prettyDate(endedOn)}.</Text>
          ) : null}
          <Pressable onPress={() => setPregnancyOpen(true)} style={styles.endBtn}>
            <Text style={styles.endText}>Log pregnancy</Text>
          </Pressable>

          <View style={styles.checkHead}>
            <Text style={styles.section}>A moment for you 💫</Text>
            <Text style={styles.optional}>Always optional</Text>
          </View>
          <View style={styles.checkRow}>
            <Pressable onPress={() => navigation.navigate('Log')} style={styles.checkCard}>
              <Ionicons name="happy-outline" size={20} color={colors.rose} />
              <Text style={styles.checkTitle}>Mood ✨</Text>
              <Text style={styles.checkPrompt}>How are you feeling?</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Log')} style={styles.checkCard}>
              <Ionicons name="heart-outline" size={20} color={colors.rose} />
              <Text style={styles.checkTitle}>Symptoms 💗</Text>
              <Text style={styles.checkPrompt}>Cramps, energy & more</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => navigation.navigate('Article', { id: 'pace' })} style={styles.article}>
            <Image source={require('../../../assets/teen/pace.jpg')} style={styles.articleArt} />
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.articleEyebrow}>A LITTLE REASSURANCE 🌸</Text>
              <Text style={styles.articleTitle}>Your cycle doesn't have to be clockwork.</Text>
              <Text style={styles.articleLink}>Learn what can change it →</Text>
            </View>
          </Pressable>
          <Text style={styles.footer}>
            Cycle estimates aren't birth control. Ovella helps you track and learn, not diagnose.
          </Text>
        </View>
      </ScrollView>
      <DatePickerModal
        visible={pickerOpen}
        value={today}
        title="When did this period start?"
        maxDate={today}
        onClose={() => setPickerOpen(false)}
        onSelect={async (date) => {
          setPickerOpen(false);
          const result = await logPeriodStart(date);
          const cycleDays = result && 'cycleDays' in result ? result.cycleDays : null;
          const note = cycleLengthNote(cycleDays, cycle.cycleLength);
          Alert.alert('Period logged', note || `Saved for ${prettyDate(date)}.`);
        }}
      />
      <DatePickerModal
        visible={pregnancyOpen}
        value={cycle.lastPeriodStart}
        title="When did your last period start?"
        hint="Choosing today keeps the last period already saved and counts your weeks from that day."
        confirmLabel="Start pregnancy tracking"
        maxDate={today}
        onClose={() => setPregnancyOpen(false)}
        onSelect={async (selected) => {
          setPregnancyOpen(false);
          const dates = pregnancyDatesFromSelection(
            selected,
            [cycle.lastPeriodStart, ...cycle.loggedPeriodStarts],
            cycle.loggedPeriodStarts,
          );
          await beginPregnancy({ ...dates, babyName: '' });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  page: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateLabel: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 11 },
  hello: { fontFamily: fonts.display, color: colors.ink, fontSize: 24, marginTop: 4 },
  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F2D7E1',
    padding: 16,
    gap: 14,
  },
  eyebrow: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 9, letterSpacing: 0.4 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dial: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  dialLabel: { position: 'absolute', alignItems: 'center' },
  dayValue: { fontFamily: fonts.display, color: colors.ink, fontSize: 32 },
  dayCaption: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 9 },
  estimate: { flex: 1, gap: 5 },
  pill: { alignSelf: 'flex-start', backgroundColor: '#FCE7F3', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 9 },
  estimateTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 22 },
  estimateSub: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  note: { flexDirection: 'row', gap: 7, backgroundColor: '#FEF0F5', borderRadius: 12, padding: 10 },
  noteText: { flex: 1, fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  calHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  calLink: { fontFamily: fonts.bodySemi, color: '#C57AA5', fontSize: 11 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 36, alignItems: 'center', gap: 7 },
  weekday: { fontFamily: fonts.body, color: colors.rose, fontSize: 10 },
  date: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#F2D7E1',
    backgroundColor: '#FFF4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateOn: { backgroundColor: '#ED5C7A', borderColor: colors.rose },
  dateNum: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12 },
  dateNumOn: { color: colors.white },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: '#ED5C7A' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: fonts.body, color: '#786370', fontSize: 10 },
  logBtn: {
    height: 56,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  logText: { fontFamily: fonts.bodyBold, color: '#66294A', fontSize: 15 },
  endBtn: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F2D7E1',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endText: { fontFamily: fonts.bodyBold, color: colors.plum, fontSize: 15 },
  ended: { textAlign: 'center', fontFamily: fonts.body, color: '#786370', fontSize: 13 },
  checkHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  optional: { fontFamily: fonts.body, color: colors.rose, fontSize: 11 },
  checkRow: { flexDirection: 'row', gap: 10 },
  checkCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2D7E1',
    padding: 13,
    gap: 7,
  },
  checkTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 13 },
  checkPrompt: { fontFamily: fonts.body, color: '#786370', fontSize: 11 },
  article: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#FEF0F8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2D7E1',
    padding: 14,
  },
  articleArt: { width: 74, height: 88, borderRadius: 16 },
  articleEyebrow: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 9 },
  articleTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 17, lineHeight: 22 },
  articleLink: { fontFamily: fonts.bodySemi, color: '#C57AA5', fontSize: 11 },
  footer: { fontFamily: fonts.body, color: '#A89BB0', fontSize: 10, lineHeight: 14, textAlign: 'center' },
});
