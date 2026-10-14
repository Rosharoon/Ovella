import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../components/layout';
import { DatePickerModal, PrimaryButton, Screen, Title } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';
import { ageFromBirthDate, isTeenBirthDate } from '../../utils/age';
import { prettyDate, toISODate } from '../../utils/dates';

export function BirthDateScreen() {
  const insets = useSafeAreaInsets();
  const { saveBirthDate } = useApp();
  const today = toISODate(new Date());
  const [birthDate, setBirthDate] = useState('');
  const [open, setOpen] = useState(false);
  const teen = Boolean(birthDate) && isTeenBirthDate(birthDate);

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 24, flex: 1 }}>
        <LogoMark size={72} />
        <Title>When were you born?</Title>
        <Text style={styles.lead}>
          Ovella uses your age to open the right mode. Under 18 stays in Teen Mode, with the same period tracking and none of the pregnancy tools.
        </Text>
        <Text style={styles.label}>Date of birth</Text>
        <Pressable onPress={() => setOpen(true)} style={styles.dateBtn}>
          <Text style={styles.dateText}>{birthDate ? prettyDate(birthDate) : 'Choose a date'}</Text>
        </Pressable>
        {birthDate ? (
          <Text style={styles.note}>
            {teen
              ? `You’re ${ageFromBirthDate(birthDate)}. Teen Mode opens next and keeps period tracking.`
              : `You’re ${ageFromBirthDate(birthDate)}. You can use period or pregnancy tracking.`}
          </Text>
        ) : null}
        <View style={{ marginTop: 'auto', paddingBottom: insets.bottom + 12 }}>
          <PrimaryButton label="Continue" disabled={!birthDate} onPress={() => saveBirthDate(birthDate)} />
        </View>
      </View>
      <DatePickerModal
        visible={open}
        value={birthDate || toISODate(new Date(new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate()))}
        title="Date of birth"
        maxDate={today}
        onClose={() => setOpen(false)}
        onSelect={(date) => {
          setBirthDate(date);
          setOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 8, lineHeight: 22 },
  label: { fontFamily: fonts.bodySemi, color: colors.ink, marginTop: 22 },
  dateBtn: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 16 },
  note: { fontFamily: fonts.body, color: colors.plum, marginTop: 14, lineHeight: 20 },
});
