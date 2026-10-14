import { Ionicons } from '@expo/vector-icons';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoonGraphic } from '../../components/graphics';
import { SymptomCard } from '../../components/SymptomCard';
import { Card, Pill, PrimaryButton, ScrollScreen } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, spacing } from '../../theme';
import { CycleSnapshot } from '../../types';
import { cycleLengthNote, getCycleSnapshot, rangeMarks } from '../../utils/cycle';
import { prettyDate, prettyWeekday, toISODate } from '../../utils/dates';
import { getLunarPhase } from '../../utils/lunar';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
type CalendarMode = 'month' | 'year';

export function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cycle, logPeriodStart, unlogPeriodStart, selectedDate, setSelectedDate } = useApp();
  const [mode, setMode] = useState<CalendarMode>('month');
  const [cursor, setCursor] = useState(() => new Date(selectedDate + 'T12:00:00'));
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setCursor(new Date(selectedDate + 'T12:00:00'));
  }, [selectedDate]);

  const mini = useMemo(() => {
    const content = width - spacing.lg * 4;
    const gap = 8;
    const monthWidth = Math.floor((content - gap * 2) / 3);
    return { gap, monthWidth, cell: Math.floor(monthWidth / 7) };
  }, [width]);

  const marks = useMemo(() => {
    if (!cycle) return {};
    if (mode === 'year') return rangeMarks(cycle, `${year - 1}-12-15`, `${year + 1}-01-20`);
    const start = toISODate(startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 }));
    return rangeMarks(cycle, start, toISODate(endOfMonth(cursor)));
  }, [cycle, cursor, mode, year]);
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end: endOfMonth(cursor) });
  }, [cursor]);

  if (!cycle) return null;
  const snap = marks[selectedDate] ?? getCycleSnapshot(cycle, new Date(selectedDate + 'T00:00:00'));
  const todaySnap = getCycleSnapshot(cycle);
  const lunar = getLunarPhase(new Date(selectedDate + 'T00:00:00'));
  const isLoggedStart = cycle.loggedPeriodStarts.includes(selectedDate);
  const predictedStart = snap.nextPeriodDate;

  return (
    <ScrollScreen>
      <View style={{ paddingTop: insets.top + 8 }}>
        <Text style={styles.title}>Log Period</Text>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => setMode('month')}
            style={[styles.toggleBtn, mode === 'month' && styles.toggleOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, mode === 'month' && styles.toggleTextOn]}>Month</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setYear(cursor.getFullYear());
              setMode('year');
            }}
            style={[styles.toggleBtn, mode === 'year' && styles.toggleOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, mode === 'year' && styles.toggleTextOn]}>Year</Text>
          </Pressable>
        </View>

        <Card style={{ marginTop: 16 }}>
          <View style={styles.nav}>
            <Pressable
              onPress={() => (mode === 'year' ? setYear((value) => value - 1) : setCursor((d) => addMonths(d, -1)))}
              accessibilityLabel={mode === 'year' ? 'Previous year' : 'Previous month'}
            >
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <Text style={styles.month}>{mode === 'year' ? String(year) : format(cursor, 'MMMM yyyy')}</Text>
            <Pressable
              onPress={() => (mode === 'year' ? setYear((value) => value + 1) : setCursor((d) => addMonths(d, 1)))}
              accessibilityLabel={mode === 'year' ? 'Next year' : 'Next month'}
            >
              <Ionicons name="chevron-forward" size={22} color={colors.ink} />
            </Pressable>
          </View>
          {mode === 'month' ? (
            <>
              <View style={styles.weekRow}>
                {WEEKDAYS.map((d, i) => (
                  <Text key={`${d}-${i}`} style={styles.weekDay}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.grid}>
                {days.map((day) => {
                  const iso = toISODate(day);
                  const mark = marks[iso];
                  const inMonth = day.getMonth() === cursor.getMonth();
                  const isSelected = iso === selectedDate;
                  const isToday = iso === toISODate(new Date());
                  const fertile = Boolean(mark?.isFertile && !mark.isPeriod && !mark.isPredictedPeriod);
                  const peak = Boolean(mark?.isOvulation && fertile);
                  return (
                    <Pressable key={iso} onPress={() => setSelectedDate(iso)} style={styles.cell}>
                      <View
                        style={[
                          styles.dot,
                          inMonth && styles.dotOutline,
                          fertile && inMonth && styles.dotFertile,
                          peak && inMonth && styles.dotPeak,
                          mark?.isPredictedPeriod && inMonth && { backgroundColor: colors.periodPinkSoft, borderColor: colors.periodPink },
                          mark?.isPeriod && !mark.isPredictedPeriod && inMonth && { backgroundColor: colors.periodPink, borderColor: colors.periodPink },
                          cycle.loggedPeriodStarts.includes(iso) && inMonth && styles.dotStart,
                          isSelected && !fertile && styles.dotOn,
                          isSelected && fertile && styles.dotSelected,
                          isToday && !isSelected && !fertile && styles.dotToday,
                          !inMonth && { opacity: 0.25 },
                        ]}
                      >
                        {cycle.loggedPeriodStarts.includes(iso) && inMonth ? (
                          <Ionicons name="checkmark" size={14} color={isSelected ? colors.white : colors.plum} />
                        ) : (
                          <Text style={[styles.cellText, (isSelected && !fertile) || peak ? { color: colors.white } : null]}>
                            {format(day, 'd')}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <YearGrid
              year={year}
              marks={marks}
              selected={selectedDate}
              today={toISODate(new Date())}
              cell={mini.cell}
              monthWidth={mini.monthWidth}
              gap={mini.gap}
              onSelect={setSelectedDate}
            />
          )}
          <View style={styles.legend}>
            <Legend color={colors.periodPinkSoft} label="Predicted" />
            <Legend color={colors.periodPink} label="Logged period" />
            <Legend color={colors.ovulationSoft} label="Ovulation window" />
            <Legend color={colors.ovulationPeak} label="High ovulation" />
          </View>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label={
                !isLoggedStart && selectedDate > toISODate(new Date())
                  ? 'Future dates can’t be logged'
                  : isLoggedStart
                    ? 'Remove this logged start'
                    : `Log period start · ${prettyDate(selectedDate)}`
              }
              disabled={!isLoggedStart && selectedDate > toISODate(new Date())}
              onPress={async () => {
                if (!isLoggedStart && selectedDate > toISODate(new Date())) return;
                if (isLoggedStart) {
                  await unlogPeriodStart(selectedDate);
                } else {
                  const logged = await logPeriodStart(selectedDate);
                  const note = cycleLengthNote(logged?.cycleDays ?? null, cycle.cycleLength);
                  if (note) Alert.alert('Period logged', note);
                }
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <View style={styles.detailHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailDate}>{prettyWeekday(selectedDate)}</Text>
              <View style={styles.chips}>
                <Pill label={`Day ${snap.cycleDay}`} />
                <Pill label={snap.phaseLabel} tone="peach" />
                {snap.isOvulation ? <Pill label="High ovulation" tone="lilac" /> : snap.isFertile ? <Pill label="Ovulation window" tone="lilac" /> : null}
              </View>
            </View>
            <MoonGraphic lunar={lunar} size={72} clipId="cal-moon" />
          </View>
          <Text style={styles.detailCopy}>
            {snap.isPeriod
              ? 'Menstrual days are for rest and warmth. Iron-rich meals help.'
              : snap.isOvulation
                ? 'Ovulation day — peak fertility and often a lift in energy.'
                : snap.isFertile
                  ? 'Predicted ovulation window. Fertility is higher across these days.'
                  : snap.phase === 'follicular'
                    ? 'Follicular phase: follicles are ripening and estrogen is rising.'
                    : 'Luteal phase: progesterone is higher. Keep evenings softer.'}
          </Text>
          <Text style={styles.moon}>
            {lunar.name} · {lunar.illumination}% lit
          </Text>
          <SymptomCard date={selectedDate} />
          <Text style={styles.predictNote}>
            {todaySnap.daysLate > 0
              ? `Your period is ${todaySnap.daysLate} ${todaySnap.daysLate === 1 ? 'day' : 'days'} late. Estimated start ${prettyDate(todaySnap.nextPeriodDate)} stays highlighted until you log it.`
              : `Next period is predicted for ${prettyDate(predictedStart)}. Estimated days are highlighted until you log the real start.`}
          </Text>
        </Card>
      </View>
    </ScrollScreen>
  );
}

function YearGrid({
  year,
  marks,
  selected,
  today,
  cell,
  monthWidth,
  gap,
  onSelect,
}: {
  year: number;
  marks: Record<string, CycleSnapshot>;
  selected: string;
  today: string;
  cell: number;
  monthWidth: number;
  gap: number;
  onSelect: (iso: string) => void;
}) {
  const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1));
  return (
    <View style={[styles.yearGrid, { gap }]}>
      {months.map((month) => {
        const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start, end: addDays(start, 41) });
        return (
          <View key={format(month, 'yyyy-MM')} style={{ width: monthWidth }}>
            <Text style={styles.miniTitle}>{format(month, 'MMM')}</Text>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((day, index) => (
                <Text key={`${day}-${index}`} style={[styles.miniWeek, { width: cell }]}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.grid}>
              {days.map((day) => {
                const iso = toISODate(day);
                const mark = marks[iso];
                const inMonth = day.getMonth() === month.getMonth();
                const fertile = Boolean(mark?.isFertile && !mark.isPeriod && !mark.isPredictedPeriod && inMonth);
                const peak = Boolean(mark?.isOvulation && fertile);
                const dot = Math.max(10, cell - 1);
                return (
                  <Pressable key={iso} onPress={() => onSelect(iso)} style={[styles.miniCell, { width: cell, height: cell }]}>
                    <View
                      style={[
                        styles.miniDot,
                        { width: dot, height: dot, borderRadius: dot / 2 },
                        mark?.isPredictedPeriod && inMonth && styles.miniPredicted,
                        mark?.isPeriod && !mark.isPredictedPeriod && inMonth && styles.miniPeriod,
                        fertile && styles.dotFertile,
                        peak && styles.dotPeak,
                        iso === today && styles.miniToday,
                        iso === selected && styles.miniSelected,
                        !inMonth && styles.miniOutside,
                      ]}
                    >
                      <Text style={[styles.miniDay, peak && styles.miniDayLight]}>{format(day, 'd')}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.ink, marginBottom: 8 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.field,
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  toggleBtn: { flex: 1, borderRadius: 999, paddingVertical: 8, alignItems: 'center' },
  toggleOn: { backgroundColor: colors.white },
  toggleText: { fontFamily: fonts.bodySemi, color: colors.inkSoft, fontSize: 14 },
  toggleTextOn: { color: colors.ink },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  miniTitle: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 12, marginBottom: 2 },
  miniWeek: { textAlign: 'center', fontFamily: fonts.bodySemi, color: colors.muted, fontSize: 8 },
  miniCell: { alignItems: 'center', justifyContent: 'center' },
  miniDot: { alignItems: 'center', justifyContent: 'center' },
  miniDay: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 8 },
  miniDayLight: { color: colors.white },
  miniPeriod: { backgroundColor: colors.periodPink },
  miniPredicted: { backgroundColor: colors.periodPinkSoft },
  miniToday: { borderWidth: 1, borderColor: colors.rose },
  miniSelected: { borderWidth: 1, borderColor: colors.ink },
  miniOutside: { opacity: 0.28 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  month: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  weekRow: { flexDirection: 'row' },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOutline: { borderWidth: 1.5, borderColor: colors.blushDeep },
  dotToday: { borderWidth: 2, borderColor: colors.rose },
  dotOn: { backgroundColor: colors.rose, borderColor: colors.rose },
  cellText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 13 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12 },
  detailDate: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 },
  detailCopy: { fontFamily: fonts.body, color: colors.inkSoft, lineHeight: 22 },
  moon: { fontFamily: fonts.bodySemi, color: colors.moon, marginTop: 12 },
  predictNote: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 10, lineHeight: 20, fontSize: 13 },
  dotStart: { borderWidth: 2, borderColor: colors.rose },
  dotFertile: { backgroundColor: colors.ovulationSoft, borderColor: colors.ovulationBlue },
  dotPeak: { backgroundColor: colors.ovulationPeak, borderColor: colors.ovulationPeak },
  dotSelected: { borderWidth: 2, borderColor: colors.ink },
});
