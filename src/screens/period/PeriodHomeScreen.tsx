import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { addDays, format, startOfWeek } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { BrandMark } from '../../components/BrandMark';
import { SymptomCard } from '../../components/SymptomCard';
import { GradientButton } from '../../components/chrome';
import { DatePickerModal } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';
import { pregnancyDatesFromSelection } from '../../data/pregnancyWeeks';
import { cycleLengthNote, getCycleAnchor, getCycleSnapshot } from '../../utils/cycle';
import { addISODays, fromISODate, greeting, prettyDate, toISODate } from '../../utils/dates';

export function PeriodHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, cycle, logPeriodStart, unlogPeriodStart, endPeriod, beginPregnancy, selectedDate, setSelectedDate, remindersEnabled, setRemindersEnabled } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pregnancyOpen, setPregnancyOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  if (!cycle) return null;

  const selected = new Date(selectedDate + 'T12:00:00');
  const snapshot = getCycleSnapshot(cycle, selected);
  const todaySnap = getCycleSnapshot(cycle);
  const lateSnap = todaySnap.daysLate > 0 ? todaySnap : snapshot;
  const first = user?.name?.split(' ')[0] || 'there';
  const anchor = getCycleAnchor(cycle, snapshot.date);
  const fertileStart = addISODays(anchor, snapshot.fertileStart - 1);
  const fertileEnd = addISODays(anchor, snapshot.fertileEnd - 1);
  const today = toISODate(new Date());
  const weekStart = startOfWeek(selected, { weekStartsOn: 0 });
  const week = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const openAnchor = getCycleAnchor(cycle, today);
  const loggedThisCycle = cycle.loggedPeriodStarts.includes(openAnchor) && todaySnap.daysLate === 0;
  const usualEnd = addISODays(openAnchor, cycle.periodLength - 1);
  const endedOn = cycle.periodEnds?.[openAnchor];
  const canEndPeriod = loggedThisCycle && today >= openAnchor && today < usualEnd && !endedOn;
  const lateLabel =
    lateSnap.daysLate === 1 ? '1 day late' : lateSnap.daysLate > 1 ? `${lateSnap.daysLate} days late` : '';
  const fertileCopy = lateSnap.daysLate
    ? `Your period is ${lateLabel}`
    : snapshot.isFertile
      ? 'Your fertile window is open'
      : snapshot.daysUntilOvulation <= 5
        ? 'Your fertile window is near'
        : snapshot.phaseLabel;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 24, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <BrandMark height={24} color={colors.brand} core={colors.rose} />
            <Text style={styles.date}>{format(selected, 'EEEE, d MMMM')}</Text>
            <Text style={styles.hello}>
              {greeting()}, {first}
            </Text>
            <View style={styles.todayPill}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          </View>
          <Pressable
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel="Reminders"
            onPress={() => setRemindersOpen(true)}
          >
            <Ionicons name={remindersEnabled ? 'notifications' : 'notifications-outline'} size={19} color={colors.rose} />
          </Pressable>
        </View>

        <View style={styles.overview}>
          <CycleDial
            day={lateSnap.daysLate > 0 ? lateSnap.daysLate : snapshot.cycleDay}
            length={lateSnap.cycleLength}
            caption={lateSnap.daysLate > 0 ? 'Days late' : 'Cycle day'}
          />
          <View style={styles.summary}>
            <View style={[styles.fertileTag, lateSnap.daysLate > 0 && styles.lateTag]}>
              <Text style={[styles.fertileTagText, lateSnap.daysLate > 0 && styles.lateTagText]}>
                {lateSnap.daysLate > 0 ? 'Running late' : snapshot.isFertile ? 'Likely fertile' : snapshot.phaseLabel}
              </Text>
            </View>
            <Text style={styles.summaryTitle}>{fertileCopy}</Text>
            <Text style={styles.summaryCopy}>
              {lateSnap.daysLate > 0
                ? `Estimated start was ${prettyDate(lateSnap.nextPeriodDate)}. It stays late until you log the day it began.`
                : snapshot.daysUntilOvulation === 0
                  ? 'Ovulation is predicted today. Predictions get clearer as you log.'
                  : `Ovulation is predicted in ${snapshot.daysUntilOvulation} days. Predictions get clearer as you log.`}
            </Text>
          </View>
        </View>

        <View style={styles.forecasts}>
          <View style={[styles.forecast, { backgroundColor: colors.peach }]}>
            <View style={styles.forecastLabel}>
              <View style={[styles.marker, { backgroundColor: colors.periodText }]} />
              <Text style={[styles.forecastKicker, { color: colors.periodText }]}>Next period</Text>
            </View>
            <Text style={styles.forecastValue}>
              {lateSnap.daysLate > 0 ? lateLabel : snapshot.daysUntilPeriod === 0 ? 'Due today' : `In ${snapshot.daysUntilPeriod} days`}
            </Text>
            <Text style={styles.forecastMeta}>
              Expected {format(fromISODate(lateSnap.nextPeriodDate), 'd')}-{format(fromISODate(addISODays(lateSnap.nextPeriodDate, cycle.periodLength - 1)), 'd MMM')} · {cycle.cycleLength}-day cycle
            </Text>
          </View>
          <View style={[styles.forecast, { backgroundColor: colors.ovulationSoft }]}>
            <View style={styles.forecastLabel}>
              <View style={[styles.marker, { backgroundColor: colors.ovulationPeak }]} />
              <Text style={[styles.forecastKicker, { color: colors.ovulationPeak }]}>Ovulation window</Text>
            </View>
            <Text style={styles.forecastValue}>
              {format(fromISODate(fertileStart), 'd')}-{format(fromISODate(fertileEnd), 'd MMM')}
            </Text>
            <Text style={styles.forecastMeta}>Peak predicted {format(fromISODate(snapshot.ovulationDate), 'd MMM')}</Text>
          </View>
        </View>

        <View style={styles.calendar}>
          <View style={styles.calHead}>
            <Text style={styles.calMonth}>{format(selected, 'MMMM yyyy')}</Text>
            <Pressable onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.calLink}>Full calendar</Text>
            </Pressable>
          </View>
          <View style={styles.week}>
            {week.map((day) => {
              const iso = toISODate(day);
              const mark = getCycleSnapshot(cycle, day);
              const isToday = iso === today;
              const isSelected = iso === selectedDate;
              const fertile = Boolean(mark.isFertile && !mark.isPeriod && !mark.isPredictedPeriod);
              const peak = Boolean(mark.isOvulation && fertile);
              const estimated = Boolean(mark.isPredictedPeriod);
              const logged = Boolean(mark.isPeriod && !mark.isPredictedPeriod);
              return (
                <Pressable key={iso} onPress={() => setSelectedDate(iso)} style={styles.day}>
                  <Text style={styles.dayName}>{format(day, 'EEE')}</Text>
                  <View
                    style={[
                      styles.dateBubble,
                      fertile && styles.dateFertile,
                      peak && styles.datePeak,
                      estimated && styles.dateEstimated,
                      logged && styles.dateLogged,
                      isToday && !isSelected && !fertile && styles.dateToday,
                      isSelected && !fertile && styles.dateSelected,
                      isSelected && fertile && styles.dateSelectedFertile,
                    ]}
                  >
                    <Text style={[styles.dateNum, ((isSelected && !fertile) || peak) && styles.dateNumOn]}>
                      {format(day, 'd')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.indicator,
                      fertile && { backgroundColor: colors.ovulationBlue },
                      peak && { backgroundColor: colors.ovulationPeak },
                      estimated && { backgroundColor: colors.periodPinkSoft },
                      logged && { backgroundColor: colors.periodPink },
                      isSelected && { backgroundColor: colors.rose },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.legend}>
            <Legend color={colors.periodPinkSoft} label="Predicted" />
            <Legend color={colors.periodPink} label="Logged period" />
            <Legend color={colors.ovulationSoft} label="Ovulation window" />
            <Legend color={colors.ovulationPeak} label="High ovulation" />
          </View>
        </View>

        <SymptomCard date={selectedDate} />
        <GradientButton
          label={loggedThisCycle ? 'Remove log' : 'Log period'}
          icon={loggedThisCycle ? 'trash-outline' : 'water-outline'}
          onPress={async () => {
            if (!loggedThisCycle) {
              setPickerOpen(true);
              return;
            }
            await unlogPeriodStart(openAnchor);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
        />
        {canEndPeriod ? (
          <Pressable
            onPress={async () => {
              await endPeriod();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
            style={styles.endPeriod}
          >
            <Ionicons name="stop-circle-outline" size={16} color={colors.plum} />
            <Text style={styles.endPeriodText}>End period</Text>
          </Pressable>
        ) : null}
        {loggedThisCycle && endedOn ? (
          <Text style={styles.endedNote}>This period ended {prettyDate(endedOn)}.</Text>
        ) : null}
        <Pressable onPress={() => navigation.navigate('LogEntry', { date: selectedDate })} style={styles.quick}>
          <Ionicons name="add" size={14} color={colors.rose} />
          <Text style={styles.quickText}>Add symptoms, flow, mood or a note</Text>
        </Pressable>
        <Pressable onPress={() => setPregnancyOpen(true)} style={styles.pregnancy}>
          <Ionicons name="heart-outline" size={16} color={colors.plum} />
          <Text style={styles.pregnancyText}>Log pregnancy</Text>
        </Pressable>
      </ScrollView>

      <DatePickerModal
        visible={pickerOpen}
        value=""
        highlight={lateSnap.nextPeriodDate}
        title="When did your period start?"
        hint={
          lateSnap.daysLate > 0
            ? `Estimated start ${prettyDate(lateSnap.nextPeriodDate)}. Your period is ${lateLabel}. Pick the day it actually began.`
            : `Estimated start ${prettyDate(lateSnap.nextPeriodDate)} is highlighted. Pick the day it actually began.`
        }
        confirmLabel="Log this start day"
        maxDate={toISODate(new Date())}
        onClose={() => setPickerOpen(false)}
        onSelect={async (iso) => {
          const logged = await logPeriodStart(iso);
          setSelectedDate(iso);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const note = cycleLengthNote(logged?.cycleDays ?? null, cycle.cycleLength);
          if (note) Alert.alert('Period logged', note);
        }}
      />
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
      <Modal visible={remindersOpen} transparent animationType="fade" onRequestClose={() => setRemindersOpen(false)}>
        <Pressable style={styles.reminderBackdrop} onPress={() => setRemindersOpen(false)}>
          <Pressable style={styles.reminderCard} onPress={() => undefined}>
            <Text style={styles.reminderTitle}>Reminders</Text>
            <Text style={styles.reminderCopy}>
              {remindersEnabled
                ? `A check-in at 7:00 pm, and a period heads-up two days before ${prettyDate(addISODays(getCycleAnchor(cycle, today), cycle.cycleLength))}.`
                : 'Period and check-in reminders are off.'}
            </Text>
            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>Period and check-ins</Text>
              <Switch
                value={remindersEnabled}
                onValueChange={(value) => {
                  setRemindersEnabled(value);
                }}
                trackColor={{ false: colors.line, true: colors.plum }}
                thumbColor={colors.white}
              />
            </View>
            <Pressable onPress={() => setRemindersOpen(false)} style={styles.reminderClose}>
              <Text style={styles.reminderCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function CycleDial({ day, length, caption }: { day: number; length: number; caption: string }) {
  const size = 122;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.min(1, Math.max(0, day / length));
  return (
    <View style={styles.dial}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#F3E4E9" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.rose}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.dialLabel}>
        <Text style={styles.dialDay}>{day}</Text>
        <Text style={styles.dialCaption}>{caption}</Text>
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.marker, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleGroup: { gap: 3, flex: 1 },
  date: { fontFamily: fonts.bodySemi, color: colors.inkSoft, fontSize: 12, marginTop: 4 },
  hello: { fontFamily: fonts.display, color: colors.ink, fontSize: 22 },
  todayPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.petal,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  todayText: { fontFamily: fonts.bodyBold, color: '#8F5B73', fontSize: 10, letterSpacing: 0.6 },
  reminderBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 21, 29, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  reminderCard: { backgroundColor: colors.white, borderRadius: 24, padding: 22, gap: 12 },
  reminderTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 28 },
  reminderCopy: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 14, lineHeight: 20 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  reminderLabel: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 15 },
  reminderClose: { alignItems: 'center', paddingVertical: 8 },
  reminderCloseText: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 15 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overview: {
    marginTop: 14,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#6E3654',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
  },
  dial: { width: 122, height: 122, alignItems: 'center', justifyContent: 'center' },
  dialLabel: { position: 'absolute', alignItems: 'center' },
  dialDay: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  dialCaption: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.7, color: colors.inkSoft },
  summary: { flex: 1, gap: 8 },
  fertileTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  fertileTagText: { fontFamily: fonts.bodyBold, color: colors.fertileText, fontSize: 12 },
  lateTag: { backgroundColor: colors.peach },
  lateTagText: { color: colors.periodText },
  summaryTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 20, lineHeight: 24 },
  summaryCopy: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12, lineHeight: 17 },
  forecasts: { flexDirection: 'row', gap: 10, marginTop: 14 },
  forecast: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  forecastLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marker: { width: 7, height: 7, borderRadius: 4 },
  forecastKicker: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14 },
  forecastValue: { fontFamily: fonts.body, color: colors.ink, fontSize: 15, lineHeight: 20 },
  forecastMeta: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 11, lineHeight: 15 },
  calendar: {
    marginTop: 14,
    marginBottom: 14,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    gap: 13,
  },
  calHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calMonth: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  calLink: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 38, alignItems: 'center', gap: 7 },
  dayName: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 10 },
  dateBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateFertile: { backgroundColor: colors.ovulationSoft, borderColor: colors.ovulationBlue },
  datePeak: { backgroundColor: colors.ovulationPeak, borderColor: colors.ovulationPeak },
  dateToday: { borderWidth: 2, borderColor: colors.rose },
  dateSelected: { backgroundColor: colors.rose, borderColor: colors.rose },
  dateSelectedFertile: { borderWidth: 2, borderColor: colors.ink },
  dateEstimated: { backgroundColor: colors.periodPinkSoft, borderColor: colors.periodPink },
  dateLogged: { backgroundColor: colors.periodPink, borderColor: colors.periodPink },
  dateNum: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 13 },
  dateNumOn: { color: colors.white, fontFamily: fonts.bodyBold },
  indicator: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 10 },
  endPeriod: {
    marginTop: 10,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  endPeriodText: { fontFamily: fonts.bodyBold, color: colors.plum, fontSize: 15 },
  endedNote: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 13,
  },
  quick: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 10 },
  quickText: { fontFamily: fonts.body, color: colors.rose, fontSize: 12 },
  pregnancy: {
    marginTop: 14,
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
