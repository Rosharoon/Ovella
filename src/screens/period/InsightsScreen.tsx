import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HormoneChart, LunarPhaseWheel, MoonGraphic } from '../../components/graphics';
import { ScreenHeader } from '../../components/layout';
import { Card, Pill, ScrollScreen } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';
import { getCycleSnapshot } from '../../utils/cycle';
import { prettyDate } from '../../utils/dates';
import { getLunarPhase } from '../../utils/lunar';

const PHASES = [
  {
    title: 'Menstrual',
    tone: 'rose' as const,
    body: 'The uterine lining sheds. Day 1 is the first day of bleeding. Rest, warmth, and iron-rich foods support this reset.',
  },
  {
    title: 'Follicular',
    tone: 'peach' as const,
    body: 'From after your period until ovulation, follicles ripen and estrogen rises. Many people feel clearer, more social, and stronger.',
  },
  {
    title: 'Ovulation',
    tone: 'lilac' as const,
    body: 'An ovary releases an egg, usually about 14 days before the next period. This is the peak of your fertile window.',
  },
  {
    title: 'Luteal',
    tone: 'gold' as const,
    body: 'The empty follicle becomes the corpus luteum and makes progesterone. PMS, cravings, and a need for earlier nights are common.',
  },
];

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { cycle } = useApp();
  if (!cycle) return null;
  const snap = getCycleSnapshot(cycle);
  const lunar = getLunarPhase();

  return (
    <ScrollScreen>
      <View style={{ paddingTop: insets.top + 8 }}>
        <ScreenHeader title="Insights" />
        <Text style={styles.lead}>How Ovella reads your cycle and the moon.</Text>

        <Card style={{ marginTop: 16 }}>
          <Pill label="This cycle" />
          <Text style={styles.stat}>
            {cycle.cycleLength}-day cycle · {cycle.periodLength}-day period
          </Text>
          <Text style={styles.copy}>
            Ovulation is estimated on day {snap.ovulationDay}. Your fertile window is days{' '}
            {snap.fertileStart}–{snap.fertileEnd}. Next period is predicted for {prettyDate(snap.nextPeriodDate)}.
          </Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Pill label="Hormone rhythm" tone="peach" />
          <Text style={styles.copy}>
            A gentle sketch of how estrogen and progesterone typically rise and fall across a cycle like yours.
          </Text>
          <View style={{ marginTop: 12 }}>
            <HormoneChart snapshot={snap} />
          </View>
        </Card>

        {PHASES.map((phase) => (
          <Card key={phase.title} style={{ marginTop: 12 }}>
            <Pill label={phase.title} tone={phase.tone} />
            <Text style={styles.copy}>{phase.body}</Text>
          </Card>
        ))}

        <Card style={{ marginTop: 12, alignItems: 'center' }}>
          <Pill label="Lunar rhythm" tone="lilac" />
          <MoonGraphic lunar={lunar} size={100} clipId="insights-moon" />
          <Text style={styles.stat}>
            {lunar.name}
          </Text>
          <Text style={[styles.copy, { textAlign: 'center' }]}>
            The moon takes about 29.5 days to cycle — close to many menstrual cycles. Some people notice
            period start near a new or full moon. Today is a good day to notice, not to force a pattern.
          </Text>
          <LunarPhaseWheel current={lunar.name} idPrefix="insights-wheel" />
        </Card>
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 4 },
  stat: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 10 },
  copy: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 8, lineHeight: 22 },
});
