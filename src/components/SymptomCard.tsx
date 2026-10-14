import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { logForMode, symptomLabel } from '../data/symptoms';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../theme';
import { prettyWeekday, toISODate } from '../utils/dates';

export function SymptomCard({ date }: { date: string }) {
  const { logs, mode } = useApp();
  const log = logForMode(logs[date], mode);
  const names = (log?.symptoms ?? []).map((id) => ({ id, label: symptomLabel(id, mode) }));
  const when = date === toISODate(new Date()) ? 'Today' : prettyWeekday(date);
  const intensity = log?.intensity ? log.intensity[0].toUpperCase() + log.intensity.slice(1) : '';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Symptoms</Text>
        <Text style={styles.when}>{when}</Text>
      </View>
      {names.length ? (
        <View style={styles.pills}>
          {names.map((item) => (
            <View key={item.id} style={styles.pill}>
              <Text style={styles.pillText}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>No symptoms logged.</Text>
      )}
      {names.length && intensity ? <Text style={styles.meta}>{intensity}</Text> : null}
      {log?.note?.trim() ? <Text style={styles.note}>{log.note.trim()}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: colors.field,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  when: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { backgroundColor: colors.petal, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 12 },
  empty: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 13, lineHeight: 18 },
  meta: { fontFamily: fonts.bodySemi, color: colors.plum, fontSize: 12 },
  note: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, lineHeight: 18 },
});
