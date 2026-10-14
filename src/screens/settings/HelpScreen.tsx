import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientWash } from '../../components/chrome';
import { colors, fonts } from '../../theme';

const TOPICS = [
  {
    title: 'Log or remove a period',
    body: 'On Today, Log my period records the start. After it is logged, the button becomes Remove log. End period stops the current bleed early without changing your usual length.',
  },
  {
    title: 'If a period is late',
    body: 'Ovella keeps counting how many days late you are until you log the real start. Predictions do not roll into the next cycle on their own.',
  },
  {
    title: 'Pregnancy',
    body: 'Log pregnancy from Today using your last period date. Weeks and the due date come from that date. Baby arrived or Pregnancy ended, in You, returns you to period tracking.',
  },
  {
    title: 'Appointments and water',
    body: 'Add a visit with a time, a reminder, and a place. Hydration check-in counts cups toward your daily goal.',
  },
  {
    title: 'Privacy',
    body: 'Logs stay on this phone. You can export them, review permissions, or delete them from You → Privacy & data.',
  },
];

export function HelpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const names: string[] = navigation.getParent()?.getState()?.routeNames ?? [];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <GradientWash style={{ paddingTop: insets.top + 8 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
            <Ionicons name="chevron-back" size={18} color={colors.white} />
            <Text style={styles.backText}>You</Text>
          </Pressable>
          <Text style={styles.title}>Help center</Text>
          <Text style={styles.lead}>Short answers for the things you can do in Ovella.</Text>
        </GradientWash>
        <View style={styles.sheet}>
          {TOPICS.map((topic) => (
            <View key={topic.title} style={styles.card}>
              <Text style={styles.cardTitle}>{topic.title}</Text>
              <Text style={styles.cardCopy}>{topic.body}</Text>
            </View>
          ))}
          <Pressable onPress={() => navigation.navigate('Privacy')} style={styles.action}>
            <Text style={styles.actionText}>Open Privacy & data</Text>
          </Pressable>
          {names.includes('Appointments') ? (
            <Pressable onPress={() => navigation.navigate('Appointments')} style={styles.action}>
              <Text style={styles.actionText}>Open appointments</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginLeft: 20, marginBottom: 12 },
  backText: { fontFamily: fonts.bodySemi, color: colors.white, fontSize: 14 },
  title: { fontFamily: fonts.display, color: colors.white, fontSize: 32, paddingHorizontal: 24 },
  lead: {
    fontFamily: fonts.body,
    color: 'rgba(255,252,253,0.9)',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  sheet: {
    marginTop: -16,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 6,
  },
  cardTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  cardCopy: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, lineHeight: 19 },
  action: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontFamily: fonts.bodySemi, color: colors.plum, fontSize: 14 },
});
