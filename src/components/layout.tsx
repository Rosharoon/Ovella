import { addDays, eachDayOfInterval, format } from 'date-fns';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandMark } from './BrandMark';
import { colors, fonts, radii, shadows } from '../theme';
import { CycleProfile } from '../types';
import { getCycleSnapshot } from '../utils/cycle';
import { toISODate } from '../utils/dates';

const STRIP_ITEM = 50;

export function LogoMark({ size = 44 }: { size?: number }) {
  return <BrandMark height={Math.max(22, Math.round(size * 0.62))} color={colors.brand} core="#ED5C7A" />;
}

export function WeekStrip({
  selected,
  onSelect,
  cycle,
}: {
  selected: string;
  onSelect: (iso: string) => void;
  cycle?: CycleProfile | null;
}) {
  const today = toISODate(new Date());
  const scrollRef = useRef<ScrollView>(null);
  const days = useMemo(() => {
    const now = new Date();
    return eachDayOfInterval({ start: addDays(now, -45), end: addDays(now, 45) });
  }, []);

  useEffect(() => {
    const index = days.findIndex((day) => toISODate(day) === selected);
    if (index < 0) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: Math.max(0, index * STRIP_ITEM - 72), animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [days, selected]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
    >
      {days.map((day) => {
        const iso = toISODate(day);
        const isToday = iso === today;
        const isOn = iso === selected;
        const mark = cycle ? getCycleSnapshot(cycle, day) : null;
        return (
          <Pressable key={iso} onPress={() => onSelect(iso)} style={styles.stripItem}>
            <View
              style={[
                styles.stripDot,
                mark?.isPredictedPeriod && styles.stripPredicted,
                mark?.isPeriod && !mark.isPredictedPeriod && styles.stripPeriod,
                mark?.isFertile && !mark?.isPeriod && styles.stripFertile,
                isToday && !isOn && styles.stripToday,
                isOn && styles.stripDotOn,
              ]}
            >
              <Text style={[styles.stripNum, isOn && { color: colors.white }]}>{format(day, 'd')}</Text>
            </View>
            <Text style={styles.stripLbl}>{isToday ? 'TODAY' : format(day, 'EEEEE')}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function InsightCard({
  label,
  tint,
  icon,
  onPress,
  children,
}: {
  label: string;
  tint: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.insight, { backgroundColor: tint }]}>
      {icon ? (
        <View style={styles.insightIcon}>
          <Ionicons name={icon} size={22} color={colors.rose} />
        </View>
      ) : null}
      {children}
      <Text style={styles.insightLabel}>{label}</Text>
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <View style={styles.head}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
      ) : null}
      <Text style={styles.headTitle}>{title}</Text>
      {onBack ? <View style={{ width: 40 }} /> : null}
      {subtitle ? <Text style={styles.headSub}>{subtitle}</Text> : null}
    </View>
  );
}

export function InsightRail({ children }: { children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.railTitle}>My Daily insights</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { paddingVertical: 12, paddingRight: 12 },
  stripItem: { width: STRIP_ITEM, alignItems: 'center' },
  stripDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.blushDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripPredicted: { backgroundColor: colors.periodPinkSoft, borderColor: colors.periodPink },
  stripPeriod: { backgroundColor: colors.periodPink, borderColor: colors.periodPink },
  stripFertile: { borderColor: colors.lilac },
  stripDotOn: { backgroundColor: colors.rose, borderColor: colors.rose },
  stripToday: { borderWidth: 2, borderColor: colors.rose, backgroundColor: colors.white },
  stripNum: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  stripLbl: { fontFamily: fonts.bodySemi, color: colors.muted, fontSize: 9, marginTop: 4 },
  insight: {
    width: 118,
    height: 132,
    borderRadius: radii.lg,
    padding: 12,
    marginRight: 10,
    justifyContent: 'space-between',
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 13, lineHeight: 18 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  headTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink },
  headSub: { display: 'none' },
  railTitle: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink, marginBottom: 12, marginTop: 8 },
  rail: { paddingRight: 20, paddingBottom: 8 },
});
