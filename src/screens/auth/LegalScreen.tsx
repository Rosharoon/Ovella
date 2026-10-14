import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';

const TERMS = [
  {
    title: 'What Ovella is',
    body: 'Ovella helps you track periods, pregnancy, symptoms, appointments, and water on this phone. It does not diagnose or provide medical care.',
  },
  {
    title: 'Your account',
    body: 'Email accounts are stored on this phone. Apple and Gmail buttons create a local sign-in here. They do not contact Apple or Google. You can change or reset an email password from this phone.',
  },
  {
    title: 'Your responsibility',
    body: 'You choose what to log. Seek urgent care for severe pain, heavy bleeding, or fainting. Pregnancy dates are estimates from the last period you enter.',
  },
];

const PRIVACY = [
  {
    title: 'Where data lives',
    body: 'Cycle logs, symptoms, appointments, water, and your password stay in storage on this phone. They are not sold, and they are not uploaded to an Ovella server.',
  },
  {
    title: 'What you can do',
    body: 'After you sign in, You → Privacy & data can export a copy, open phone permissions, clear check-ins, delete tracking data, or delete the account on this phone.',
  },
  {
    title: 'Reminders and health',
    body: 'Notifications are scheduled on this device when you turn them on. Apple Health shares only the period days, sleep, and water you have already logged, and only after you connect it.',
  },
];

export function LegalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const kind = route.params?.kind === 'privacy' ? 'privacy' : 'terms';
  const sections = kind === 'privacy' ? PRIVACY : TERMS;
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Use';

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28, paddingHorizontal: 24 }}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
          <Ionicons name="chevron-back" size={18} color={colors.plum} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.lead}>
          This describes how Ovella works on this phone. It is not a substitute for advice from your own clinician or lawyer.
        </Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { fontFamily: fonts.bodySemi, color: colors.plum, fontSize: 14 },
  title: { fontFamily: fonts.display, color: colors.ink, fontSize: 32 },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 6,
    marginBottom: 12,
  },
  cardTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  body: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 14, lineHeight: 20 },
});
