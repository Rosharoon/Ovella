import { addDays, addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymptomCard } from '../../components/SymptomCard';
import { useApp } from '../../context/AppContext';
import { resolvedDueDate, resolvedLastPeriod } from '../../data/pregnancyWeeks';
import { colors, fonts, spacing } from '../../theme';
import { CalendarDayMark, pregnancyCalendarMarks } from '../../utils/pregnancyCalendar';
import { daysBetween, prettyWeekday, toISODate } from '../../utils/dates';

type ViewMode = 'month' | 'year';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

function describeDay(iso: string, mark: CalendarDayMark | undefined, lastPeriodStart: string) {
  const parts = [prettyWeekday(iso)];
  if (mark?.due) parts.push('Due date');
  else if (mark?.pregnancy && iso >= lastPeriodStart) {
    parts.push(`Week ${Math.floor(daysBetween(lastPeriodStart, iso) / 7) + 1}`);
  }
  if (mark?.period) parts.push('Period');
  else if (mark?.predictedPeriod) parts.push('Predicted period');
  if (mark?.ovulation) parts.push('High ovulation');
  else if (mark?.fertile) parts.push('Ovulation window');
  return parts.join(' · ');
}

export function PregnancyCalendarScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { pregnancy, cycle } = useApp();
  const [mode, setMode] = useState<ViewMode>('month');
  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const monthList = useRef<FlatList<Date>>(null);
  const yearList = useRef<FlatList<number>>(null);

  const today = toISODate(new Date());
  const lastPeriodStart = pregnancy ? resolvedLastPeriod(pregnancy) : today;
  const dueDate = pregnancy ? resolvedDueDate(pregnancy) : today;

  const layout = useMemo(() => {
    const contentWidth = width - spacing.lg * 2;
    const monthCell = Math.floor(contentWidth / 7);
    const monthHeight = 32 + 18 + monthCell * 6 + 12;
    const gap = 8;
    const miniWidth = Math.floor((contentWidth - gap * 2) / 3);
    const miniCell = Math.floor(miniWidth / 7);
    const miniHeight = 18 + 14 + miniCell * 6;
    const yearHeight = 36 + miniHeight * 4 + gap * 3;
    return { contentWidth, monthCell, monthHeight, gap, miniWidth, miniCell, miniHeight, yearHeight };
  }, [width]);

  const months = useMemo(() => {
    const now = startOfMonth(new Date());
    const earliestLogged = [...(cycle?.loggedPeriodStarts ?? [])].sort()[0];
    const candidates = [addMonths(now, -18), startOfMonth(new Date(lastPeriodStart + 'T12:00:00'))];
    if (earliestLogged) candidates.push(startOfMonth(new Date(earliestLogged + 'T12:00:00')));
    if (cycle?.lastPeriodStart) candidates.push(startOfMonth(new Date(cycle.lastPeriodStart + 'T12:00:00')));
    const first = candidates.reduce((soonest, date) => (date < soonest ? date : soonest));
    const dueMonth = startOfMonth(new Date(dueDate + 'T12:00:00'));
    const last = dueMonth > addMonths(now, 6) ? addMonths(dueMonth, 1) : addMonths(now, 6);
    const list: Date[] = [];
    for (let cursor = addMonths(first, -1); cursor <= last; cursor = addMonths(cursor, 1)) {
      list.push(cursor);
    }
    return list;
  }, [cycle?.lastPeriodStart, cycle?.loggedPeriodStarts, dueDate, lastPeriodStart]);

  const years = useMemo(
    () => Array.from(new Set(months.map((month) => month.getFullYear()))),
    [months],
  );

  const marks = useMemo(() => {
    if (!pregnancy || !months.length) return {};
    const first = months[0];
    const last = months[months.length - 1];
    return pregnancyCalendarMarks({
      lastPeriodStart,
      dueDate,
      periodLength: cycle?.periodLength ?? 5,
      cycleLength: cycle?.cycleLength ?? 28,
      loggedPeriodStarts: cycle?.loggedPeriodStarts ?? [],
      rangeStart: toISODate(addDays(startOfWeek(startOfMonth(first), { weekStartsOn: 0 }), -1)),
      rangeEnd: toISODate(addDays(endOfMonth(last), 7)),
    });
  }, [cycle?.cycleLength, cycle?.loggedPeriodStarts, cycle?.periodLength, dueDate, lastPeriodStart, months, pregnancy]);

  const monthIndex = Math.max(0, months.findIndex((month) => monthKey(month) === today.slice(0, 7)));
  const yearIndex = Math.max(0, years.findIndex((year) => year === new Date().getFullYear()));
  const selectedMark = marks[selected];

  if (!pregnancy) return null;

  return (
    <LinearGradient colors={[colors.canvas, colors.blush]} style={styles.flex}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: spacing.lg }}>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.toggle}>
          <Pressable
            onPress={() => setMode('month')}
            style={[styles.toggleBtn, mode === 'month' && styles.toggleOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, mode === 'month' && styles.toggleTextOn]}>Month</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('year')}
            style={[styles.toggleBtn, mode === 'year' && styles.toggleOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.toggleText, mode === 'year' && styles.toggleTextOn]}>Year</Text>
          </Pressable>
        </View>
        <Text style={styles.selectedText}>{describeDay(selected, selectedMark, lastPeriodStart)}</Text>
        <View style={styles.legend}>
          <Legend color={colors.pregnancyOrangeSoft} label="Pregnancy" />
          <Legend color={colors.dueOrange} label="Due date" />
          <Legend color={colors.periodPink} label="Period" />
          <Legend color={colors.periodPinkSoft} label="Predicted period" />
          <Legend color={colors.ovulationSoft} label="Ovulation" />
          <Legend color={colors.ovulationPeak} label="High ovulation" />
        </View>
        <SymptomCard date={selected} />
      </View>
      {mode === 'month' ? (
        <FlatList
          ref={monthList}
          key="month"
          data={months}
          keyExtractor={(month) => monthKey(month)}
          style={styles.flex}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 24 }}
          initialScrollIndex={monthIndex}
          getItemLayout={(_, index) => ({
            length: layout.monthHeight,
            offset: layout.monthHeight * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            monthList.current?.scrollToOffset({ offset: layout.monthHeight * info.index, animated: false });
          }}
          renderItem={({ item }) => (
            <MonthGrid
              month={item}
              height={layout.monthHeight}
              cell={layout.monthCell}
              marks={marks}
              selected={selected}
              today={today}
              onSelect={setSelected}
            />
          )}
        />
      ) : (
        <FlatList
          ref={yearList}
          key="year"
          data={years}
          keyExtractor={(year) => String(year)}
          style={styles.flex}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 24 }}
          initialScrollIndex={yearIndex}
          getItemLayout={(_, index) => ({
            length: layout.yearHeight,
            offset: layout.yearHeight * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            yearList.current?.scrollToOffset({ offset: layout.yearHeight * info.index, animated: false });
          }}
          renderItem={({ item: year }) => (
            <YearGrid
              year={year}
              height={layout.yearHeight}
              width={layout.miniWidth}
              cell={layout.miniCell}
              monthHeight={layout.miniHeight}
              gap={layout.gap}
              marks={marks}
              selected={selected}
              today={today}
              onSelect={setSelected}
            />
          )}
        />
      )}
    </LinearGradient>
  );
}

function MonthGrid({
  month,
  height,
  cell,
  marks,
  selected,
  today,
  onSelect,
  compact = false,
}: {
  month: Date;
  height: number;
  cell: number;
  marks: Record<string, CalendarDayMark>;
  selected: string;
  today: string;
  onSelect: (iso: string) => void;
  compact?: boolean;
}) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end: addDays(start, 41) });
  return (
    <View style={{ height }}>
      <Text style={[styles.monthTitle, compact && styles.miniTitle]}>{format(month, compact ? 'MMM' : 'MMMM yyyy')}</Text>
      <View style={[styles.weekRow, { height: compact ? 14 : 18 }]}>
        {WEEKDAYS.map((day, index) => (
          <Text key={`${day}-${index}`} style={[styles.weekDay, { width: cell }, compact && styles.miniWeek]}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((day) => {
          const iso = toISODate(day);
          const inMonth = day.getMonth() === month.getMonth();
          return (
            <DayCell
              key={iso}
              iso={iso}
              label={format(day, 'd')}
              cell={cell}
              mark={marks[iso]}
              inMonth={inMonth}
              selected={iso === selected}
              today={iso === today}
              compact={compact}
              onPress={() => onSelect(iso)}
            />
          );
        })}
      </View>
    </View>
  );
}

function YearGrid({
  year,
  height,
  width,
  cell,
  monthHeight,
  gap,
  marks,
  selected,
  today,
  onSelect,
}: {
  year: number;
  height: number;
  width: number;
  cell: number;
  monthHeight: number;
  gap: number;
  marks: Record<string, CalendarDayMark>;
  selected: string;
  today: string;
  onSelect: (iso: string) => void;
}) {
  const months = Array.from({ length: 12 }, (_, index) => new Date(year, index, 1));
  return (
    <View style={{ height }}>
      <Text style={styles.yearTitle}>{year}</Text>
      <View style={[styles.yearGrid, { gap }]}>
        {months.map((month) => (
          <View key={monthKey(month)} style={{ width, height: monthHeight }}>
            <MonthGrid
              month={month}
              height={monthHeight}
              cell={cell}
              marks={marks}
              selected={selected}
              today={today}
              onSelect={onSelect}
              compact
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function DayCell({
  iso,
  label,
  cell,
  mark,
  inMonth,
  selected,
  today,
  compact,
  onPress,
}: {
  iso: string;
  label: string;
  cell: number;
  mark?: CalendarDayMark;
  inMonth: boolean;
  selected: boolean;
  today: boolean;
  compact: boolean;
  onPress: () => void;
}) {
  const other = Boolean(mark?.period || mark?.predictedPeriod || mark?.fertile || mark?.ovulation);
  const dot = Math.max(compact ? 12 : 32, Math.min(cell - (compact ? 1 : 6), compact ? 16 : 36));
  return (
    <Pressable
      onPress={onPress}
      style={[styles.cell, { width: cell, height: cell }]}
      accessibilityRole="button"
      accessibilityLabel={iso}
    >
      <View
        style={[
          styles.dot,
          { width: dot, height: dot, borderRadius: dot / 2 },
          inMonth && !mark?.pregnancy && !other && styles.outline,
          mark?.predictedPeriod && styles.predicted,
          mark?.period && styles.period,
          mark?.fertile && styles.fertile,
          mark?.ovulation && styles.peak,
          mark?.pregnancy && !other && styles.pregnancy,
          mark?.due && !other && styles.due,
          mark?.pregnancy && other && styles.pregnancyRing,
          !inMonth && styles.outside,
          today && styles.today,
          selected && styles.selectedDay,
        ]}
      >
        <Text
          style={[
            styles.dayText,
            compact && styles.miniDay,
            (mark?.ovulation || (mark?.due && !other)) && styles.dayTextLight,
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
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
  flex: { flex: 1 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  toggle: {
    marginTop: 12,
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
  selectedText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 13, marginTop: 12, lineHeight: 18 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 11 },
  monthTitle: { height: 32, lineHeight: 32, fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  miniTitle: { height: 18, lineHeight: 18, fontSize: 11 },
  yearTitle: { height: 36, lineHeight: 36, fontFamily: fonts.display, color: colors.ink, fontSize: 22 },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekRow: { flexDirection: 'row' },
  weekDay: { textAlign: 'center', fontFamily: fonts.bodySemi, color: colors.muted, fontSize: 11 },
  miniWeek: { fontSize: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  dot: { alignItems: 'center', justifyContent: 'center' },
  outline: { borderWidth: 1, borderColor: colors.blushDeep },
  outside: { opacity: 0.35 },
  pregnancy: { backgroundColor: colors.pregnancyOrangeSoft },
  due: { backgroundColor: colors.dueOrange },
  period: { backgroundColor: colors.periodPink },
  predicted: { backgroundColor: colors.periodPinkSoft, borderWidth: 1, borderColor: colors.periodPink },
  fertile: { backgroundColor: colors.ovulationSoft, borderWidth: 1, borderColor: colors.ovulationBlue },
  peak: { backgroundColor: colors.ovulationPeak },
  pregnancyRing: { borderWidth: 2, borderColor: colors.pregnancyOrange },
  today: { borderWidth: 2, borderColor: colors.rose },
  selectedDay: { borderWidth: 2, borderColor: colors.ink },
  dayText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 13 },
  miniDay: { fontSize: 8 },
  dayTextLight: { color: colors.white },
});
