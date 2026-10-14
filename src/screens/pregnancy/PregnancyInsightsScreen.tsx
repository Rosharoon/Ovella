import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/layout';
import { Card, Pill, ScrollScreen } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { logForMode, symptomLabel } from '../../data/symptoms';
import { daysUntilDue, pregnancyWeek, resolvedDueDate } from '../../data/pregnancyWeeks';
import { colors, fonts } from '../../theme';
import { prettyDate, toISODate } from '../../utils/dates';
import { appointmentSummary, upcomingAppointment } from './AppointmentsScreen';

const TRIMESTERS = [
  { id: 1, label: 'First', weeks: 'Weeks 1–13', body: 'Early growth. Energy may dip while the basics of baby’s body form.' },
  { id: 2, label: 'Second', weeks: 'Weeks 14–27', body: 'Often a steadier stretch. Movement gets easier to notice.' },
  { id: 3, label: 'Third', weeks: 'Weeks 28–40', body: 'Baby gains weight. Visits usually come closer together.' },
] as const;

export function PregnancyInsightsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { pregnancy, logs, mode, appointments } = useApp();
  if (!pregnancy) return null;

  const week = Math.min(40, Math.max(1, pregnancyWeek(pregnancy)));
  const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
  const due = resolvedDueDate(pregnancy);
  const days = Math.max(0, daysUntilDue(due));
  const weeksLeft = Math.max(0, Math.round(days / 7));
  const progress = Math.min(1, week / 40);
  const nextVisit = upcomingAppointment(appointments);
  const recent = recentSymptoms(logs, mode);

  return (
    <ScrollScreen>
      <View style={{ paddingTop: insets.top + 8 }}>
        <ScreenHeader title="Insights" />
        <Text style={styles.lead}>How this pregnancy is moving. The week-by-week story stays in the guide.</Text>

        <Card style={{ marginTop: 16 }}>
          <Pill label="Where you are" />
          <Text style={styles.stat}>Week {week} of 40</Text>
          <Text style={styles.copy}>
            {TRIMESTERS[trimester - 1].label} trimester · Due {prettyDate(due)}
          </Text>
          <Text style={styles.copy}>{weeksLeft === 1 ? '1 week to go' : `${weeksLeft} weeks to go`}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Pressable onPress={() => navigation.navigate('Guide', { week })} accessibilityRole="button">
            <Text style={styles.link}>Open the week {week} guide</Text>
          </Pressable>
        </Card>

        <Text style={styles.section}>Trimesters</Text>
        {TRIMESTERS.map((item) => {
          const active = item.id === trimester;
          return (
            <Card
              key={item.id}
              style={{
                marginTop: 10,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colors.rose : colors.line,
                backgroundColor: active ? colors.petal : colors.white,
              }}
            >
              <View style={styles.row}>
                <Pill label={item.label} tone={item.id === 1 ? 'rose' : item.id === 2 ? 'peach' : 'lilac'} />
                {active ? <Pill label="Now" tone="gold" /> : null}
              </View>
              <Text style={styles.weeks}>{item.weeks}</Text>
              <Text style={styles.copy}>{item.body}</Text>
            </Card>
          );
        })}

        <Card style={{ marginTop: 16 }}>
          <Pill label="Logged lately" tone="peach" />
          <Text style={styles.copy}>Symptoms saved over the last 14 days.</Text>
          {recent.length ? (
            <View style={styles.pills}>
              {recent.map((item) => (
                <View key={item.id} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {item.label} · {item.count}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.copy}>Nothing logged in the last two weeks.</Text>
          )}
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Pill label="Next visit" tone="lilac" />
          <Pressable onPress={() => navigation.navigate('Appointments')} accessibilityRole="button">
            <Text style={styles.stat}>{nextVisit ? nextVisit.title : 'No visit yet'}</Text>
            <Text style={styles.copy}>
              {nextVisit ? appointmentSummary(nextVisit, toISODate(new Date())) : 'Add a date when you have one.'}
            </Text>
          </Pressable>
        </Card>
      </View>
    </ScrollScreen>
  );
}

function recentSymptoms(logs: Record<string, { date: string; symptoms: string[]; loggedMode?: 'period' | 'pregnancy' }>, mode: 'period' | 'pregnancy' | null) {
  const today = toISODate(new Date());
  const counts = new Map<string, number>();
  Object.values(logs).forEach((log) => {
    const visible = logForMode(log, mode);
    if (!visible?.date || visible.date > today) return;
    const age = daysBefore(visible.date, today);
    if (age > 14) return;
    visible.symptoms.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  });
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count, label: symptomLabel(id, mode) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function daysBefore(from: string, to: string) {
  const start = new Date(`${from}T12:00:00`).getTime();
  const end = new Date(`${to}T12:00:00`).getTime();
  return Math.round((end - start) / 86400000);
}

const styles = StyleSheet.create({
  lead: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 4, lineHeight: 21 },
  stat: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginTop: 10 },
  copy: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 8, lineHeight: 22 },
  weeks: { fontFamily: fonts.bodySemi, color: colors.plum, marginTop: 8, fontSize: 13 },
  section: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15, marginTop: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.blushDeep, marginTop: 14, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: colors.rose },
  link: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 14, marginTop: 14 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: colors.petal, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 12 },
});
