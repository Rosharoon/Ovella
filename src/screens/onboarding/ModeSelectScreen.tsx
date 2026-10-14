import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogoMark } from '../../components/layout';
import { WelcomeScene } from '../../components/scenes';
import { Screen } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, radii, shadows, spacing } from '../../theme';
import { AppMode } from '../../types';

export function ModeSelectScreen() {
  const insets = useSafeAreaInsets();
  const { user, setMode } = useApp();

  const choose = async (mode: AppMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setMode(mode);
  };

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 12 }}>
        <View style={styles.brand}>
          <LogoMark size={52} />
        </View>
        <WelcomeScene />
        <Text style={styles.hello}>Welcome, {user?.name?.split(' ')[0] || 'love'}!</Text>
        <Text style={styles.lead}>
          Choose period cycles or pregnancy. Pregnancy returns to period tracking when the baby arrives or the pregnancy ends.
        </Text>

        <Pressable onPress={() => choose('period')} style={styles.card}>
          <Text style={styles.cardTitle}>Period cycles</Text>
          <Text style={styles.cardCopy}>Predict periods, ovulation, follicular days, and lunar phase.</Text>
        </Pressable>

        <Pressable onPress={() => choose('pregnancy')} style={styles.card}>
          <Text style={styles.cardTitle}>Pregnancy</Text>
          <Text style={styles.cardCopy}>Follow each week, see baby’s size, and get gentle updates.</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: 4 },
  hello: { fontFamily: fonts.bodyBold, fontSize: 26, color: colors.ink, marginTop: 8 },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 6, lineHeight: 22 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.soft,
  },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 20, color: colors.ink },
  cardCopy: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 6, lineHeight: 21 },
});
