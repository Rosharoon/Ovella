import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';
import { toISODate } from '../../utils/dates';

function defaultBirthDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 16);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function DobPrompt() {
  const { user, saveBirthDate } = useApp();
  const needsDob = user?.authProvider === 'apple' || user?.authProvider === 'google';
  const visible = Boolean(needsDob && user && !user.birthDate);
  const [birthDate, setBirthDate] = useState(defaultBirthDate);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Add your date of birth</Text>
          <Text style={styles.copy}>
            {user?.authProvider === 'apple' ? 'Apple' : 'Gmail'} sign-in needs a date of birth before Ovella can open.
          </Text>
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            themeVariant="light"
            onChange={(_, next) => {
              if (next) setBirthDate(next);
            }}
            style={Platform.OS === 'ios' ? styles.spinner : undefined}
          />
          <PrimaryButton label="Continue" onPress={() => saveBirthDate(toISODate(birthDate))} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  title: { fontFamily: fonts.display, color: colors.ink, fontSize: 26 },
  copy: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 14, lineHeight: 20 },
  spinner: { height: 180, alignSelf: 'stretch' },
});
