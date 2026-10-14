import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../components/layout';
import { DatePickerModal, PrimaryButton, Screen, TextField, Title } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, radii, spacing } from '../../theme';
import { dueFromLastPeriod, lastPeriodFromDue } from '../../data/pregnancyWeeks';
import { addISODays, prettyDate, toISODate } from '../../utils/dates';

export function PregnancySetupScreen() {
  const insets = useSafeAreaInsets();
  const { savePregnancy } = useApp();
  const [babyName, setBabyName] = useState('');
  const [useDueDate, setUseDueDate] = useState(true);
  const [dueDate, setDueDate] = useState(addISODays(toISODate(new Date()), 200));
  const [lmp, setLmp] = useState(toISODate(new Date()));
  const [open, setOpen] = useState(false);

  const resolvedDue = useDueDate ? dueDate : dueFromLastPeriod(lmp);
  const resolvedLastPeriod = useDueDate ? lastPeriodFromDue(dueDate) : lmp;

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 24, flex: 1 }}>
        <LogoMark size={72} />
        <Title>Let’s set your due date</Title>
        <Text style={styles.lead}>
          Use the date from your clinician, or we will estimate from the first day of your last period.
        </Text>

        <View style={styles.toggle}>
          <Pressable
            onPress={() => setUseDueDate(true)}
            style={[styles.toggleBtn, useDueDate && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, useDueDate && styles.toggleTextOn]}>Due date</Text>
          </Pressable>
          <Pressable
            onPress={() => setUseDueDate(false)}
            style={[styles.toggleBtn, !useDueDate && styles.toggleOn]}
          >
            <Text style={[styles.toggleText, !useDueDate && styles.toggleTextOn]}>Last period</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>{useDueDate ? 'Due date' : 'First day of last period'}</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.dateBtn}>
          <Text style={styles.dateText}>{prettyDate(useDueDate ? dueDate : lmp)}</Text>
        </Pressable>
        <Text style={styles.hint}>Estimated due date: {prettyDate(resolvedDue)}</Text>

        <TextField
          label="Baby’s name or nickname (optional)"
          value={babyName}
          onChangeText={setBabyName}
          placeholder="Little one"
          autoCapitalize="words"
        />

        <View style={{ marginTop: 'auto', paddingBottom: insets.bottom + 12 }}>
          <PrimaryButton
            label="Open pregnancy"
            onPress={() =>
              savePregnancy({
                dueDate: resolvedDue,
                lastPeriodStart: resolvedLastPeriod,
                babyName: babyName.trim(),
              })
            }
          />
        </View>
      </View>
      <DatePickerModal
        visible={open}
        value={useDueDate ? dueDate : lmp}
        title={useDueDate ? 'Due date' : 'Last period'}
        maxDate={useDueDate ? undefined : toISODate(new Date())}
        onClose={() => setOpen(false)}
        onSelect={(iso) => (useDueDate ? setDueDate(iso) : setLmp(iso))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 22,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, alignItems: 'center' },
  toggleOn: { backgroundColor: colors.rose },
  toggleText: { fontFamily: fonts.bodySemi, color: colors.inkSoft },
  toggleTextOn: { color: colors.white },
  label: {
    fontFamily: fonts.bodySemi,
    color: colors.inkSoft,
    marginBottom: 8,
    fontSize: 13,
  },
  dateBtn: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 16,
  },
  dateText: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  hint: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginTop: 8,
    marginBottom: 18,
  },
});
