import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../components/layout';
import { DatePickerModal, PrimaryButton, Screen, Stepper, Title } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, radii, spacing } from '../../theme';
import { prettyDate, toISODate } from '../../utils/dates';

export function CycleSetupScreen() {
  const insets = useSafeAreaInsets();
  const { saveCycle } = useApp();
  const [lastPeriodStart, setLastPeriodStart] = useState(toISODate(new Date()));
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [open, setOpen] = useState(false);

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 24, flex: 1 }}>
        <LogoMark size={72} />
        <Title>How long is your cycle?</Title>
        <Text style={styles.lead}>
          Count from the first day of one period to the day before the next. Ovella starts with this length, then updates it when the periods you log are longer or shorter.
        </Text>

        <Text style={styles.label}>First day of last period</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.dateBtn}>
          <Text style={styles.dateText}>{prettyDate(lastPeriodStart)}</Text>
        </Pressable>

        <Stepper
          label="Your usual cycle length"
          value={cycleLength}
          min={15}
          max={60}
          suffix="days"
          onChange={setCycleLength}
        />
        <Stepper
          label="Period length"
          value={periodLength}
          min={2}
          max={10}
          suffix="days"
          onChange={setPeriodLength}
        />

        <View style={{ marginTop: 'auto', paddingBottom: insets.bottom + 12 }}>
          <PrimaryButton
            label="Open my cycle"
            onPress={() =>
              saveCycle({
                lastPeriodStart,
                cycleLength,
                periodLength,
                loggedPeriodStarts: [lastPeriodStart],
              })
            }
          />
        </View>
      </View>
      <DatePickerModal
        visible={open}
        value={lastPeriodStart}
        title="Last period started"
        maxDate={toISODate(new Date())}
        onClose={() => setOpen(false)}
        onSelect={setLastPeriodStart}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
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
    marginBottom: spacing.lg,
  },
  dateText: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
});
