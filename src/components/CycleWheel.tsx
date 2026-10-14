import { format } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CycleProfile, CycleSnapshot } from '../types';
import { colors, fonts } from '../theme';
import { datesForCycle } from '../utils/cycle';
import { fromISODate, toISODate } from '../utils/dates';

const SIZE = 300;
const RING = 126;

export function CycleWheel({
  snapshot,
  cycle,
  selectedDate,
  onSelectDate,
}: {
  snapshot: CycleSnapshot;
  cycle: CycleProfile;
  selectedDate: string;
  onSelectDate?: (iso: string) => void;
}) {
  const today = toISODate(new Date());
  const days = datesForCycle(cycle, selectedDate);
  const cycleStart = days[0]?.iso;
  const periodIsPredicted = Boolean(cycleStart && !cycle.loggedPeriodStarts.includes(cycleStart));
  const chance = snapshot.isFertile ? 'High chance of getting pregnant' : 'Low chance of getting pregnant';
  const headline = snapshot.isPeriod
    ? snapshot.isPredictedPeriod
      ? 'Predicted period'
      : 'Period day'
    : 'Period in';
  const value = snapshot.isPeriod
    ? `${snapshot.cycleDay}`
    : snapshot.daysUntilPeriod === 0
      ? 'Today'
      : `${snapshot.daysUntilPeriod} Days`;

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        {days.map(({ day, iso }) => {
          const angle = ((day - 1) / snapshot.cycleLength) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * RING;
          const y = Math.sin(angle) * RING;
          const isSelected = iso === selectedDate;
          const isToday = iso === today;
          const isPeriod = day <= snapshot.periodLength;
          const isPredicted = isPeriod && periodIsPredicted;
          const isLogged = isPeriod && !periodIsPredicted;
          const isFertile = day >= snapshot.fertileStart && day <= snapshot.fertileEnd;
          const isStart = cycle.loggedPeriodStarts.includes(iso);
          const label = format(fromISODate(iso), 'd');
          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDate?.(iso)}
              style={[
                styles.dayWrap,
                { transform: [{ translateX: x }, { translateY: y }] },
              ]}
            >
              {isPredicted ? <View style={[styles.periodDot, { backgroundColor: colors.peachSoft }]} /> : null}
              {isLogged ? <View style={styles.periodDot} /> : null}
              {isFertile && !isPeriod ? (
                <Ionicons name="heart" size={9} color={colors.lilac} style={styles.heart} />
              ) : null}
              <View style={[styles.day, isStart && styles.dayStart, isToday && !isSelected && styles.dayToday, isSelected && styles.dayOn]}>
                <Text style={[styles.dayText, isSelected && { color: colors.white }]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.kicker}>{headline}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.chance}>{chance}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 8 },
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E2A8B4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  dayWrap: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: colors.rose },
  dayToday: { borderWidth: 1.5, borderColor: colors.rose },
  dayStart: { borderWidth: 1.5, borderColor: colors.rose },
  dayText: { fontFamily: fonts.bodySemi, fontSize: 10, color: colors.inkSoft },
  periodDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.peach,
    opacity: 0.7,
  },
  heart: { position: 'absolute', top: -6 },
  center: { alignItems: 'center', paddingHorizontal: 24, maxWidth: 180 },
  kicker: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  value: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 34, marginTop: 2 },
  chance: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
