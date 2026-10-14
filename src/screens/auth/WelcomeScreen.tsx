import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandMark } from '../../components/BrandMark';
import { GradientButton, GradientWash, OutlineButton } from '../../components/chrome';
import { colors, fonts } from '../../theme';

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GradientWash style={styles.hero}>
        <View style={[styles.heroInner, { paddingTop: insets.top + 74, paddingBottom: 54 }]}>
          <View style={styles.brandBlock}>
            <BrandMark height={33} />
            <Text style={styles.kicker}>Reproductive health, in your hands</Text>
          </View>
          <View style={styles.promise}>
            <Text style={styles.headline}>Understand your body with confidence.</Text>
            <Text style={styles.support}>
              Thoughtful reproductive health guidance, built around your privacy.
            </Text>
          </View>
        </View>
      </GradientWash>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={14} color="#8F5B73" />
          <Text style={styles.badgeText}>Private by design</Text>
        </View>
        <Text style={styles.title}>Welcome to Ovella</Text>
        <Text style={styles.lead}>Track, learn, and make informed choices at every stage.</Text>
        <View style={styles.actions}>
          <GradientButton label="Sign in" icon="arrow-forward" onPress={() => navigation.navigate('SignIn')} />
          <OutlineButton label="Create an account" onPress={() => navigation.navigate('CreateAccount')} />
        </View>
        <View style={styles.trust}>
          <View style={styles.trustDot} />
          <Text style={styles.trustText}>Clinically informed • Secure • Inclusive</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#C7A1B8' },
  hero: { flex: 1 },
  heroInner: { flex: 1, paddingHorizontal: 30, justifyContent: 'space-between', alignItems: 'center' },
  brandBlock: { alignItems: 'center', gap: 8 },
  kicker: {
    fontFamily: fonts.body,
    color: '#FCE8F2',
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  promise: { alignItems: 'center', gap: 12 },
  headline: {
    fontFamily: fonts.display,
    color: '#FFFAFC',
    fontSize: 36,
    lineHeight: 39,
    letterSpacing: -1,
    textAlign: 'center',
  },
  support: {
    fontFamily: fonts.body,
    color: '#FCE8F2',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -28,
    paddingTop: 30,
    paddingHorizontal: 28,
    gap: 18,
    shadowColor: '#C7A1B8',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.petal,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    color: '#8F5B73',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  title: { fontFamily: fonts.display, color: '#4F2B3D', fontSize: 30, textAlign: 'center' },
  lead: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: -10,
  },
  actions: { gap: 12 },
  trust: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  trustDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mintDeep },
  trustText: { fontFamily: fonts.body, color: colors.muted, fontSize: 10 },
});
