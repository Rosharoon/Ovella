import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { Eyebrow, GradientButton, GradientWash, IconField } from '../../components/chrome';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';

export function SignInScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { signIn, signInWithProvider } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.includes('@') || password.length < 6) {
      setError('Use a valid email and your password.');
      return;
    }
    setBusy(true);
    const message = await signIn(email, password, remember);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView bounces={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <GradientWash style={{ paddingTop: insets.top }}>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
                <View style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={18} color={colors.white} />
                </View>
                <Text style={styles.backLabel}>Welcome</Text>
              </Pressable>
              <BrandMark height={27} />
            </View>
            <View style={styles.secure}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.onGradient} />
              <Text style={styles.secureText}>Secure access to your health space</Text>
            </View>
          </GradientWash>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <Eyebrow>Good to see you</Eyebrow>
            <Text style={styles.title}>Sign in to Ovella</Text>
            <Text style={styles.lead}>Continue to your private, personalized health record.</Text>
            <IconField
              label="Email address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <IconField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
            <View style={styles.options}>
              <Pressable onPress={() => setRemember((v) => !v)} style={styles.remember}>
                <View style={[styles.check, remember && styles.checkOn]}>
                  {remember ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('ResetPassword')}>
                <Text style={styles.forgot}>Forgot password?</Text>
              </Pressable>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GradientButton
              label={busy ? 'Signing in…' : 'Sign in securely'}
              icon="arrow-forward"
              onPress={onSubmit}
              disabled={busy}
            />
            <Pressable
              style={styles.apple}
              onPress={() => {
                Haptics.selectionAsync();
                signInWithProvider('apple');
              }}
            >
              <Ionicons name="logo-apple" size={17} color={colors.ink} />
              <Text style={styles.appleText}>Continue with Apple</Text>
            </Pressable>
            <Pressable
              style={styles.apple}
              onPress={() => {
                Haptics.selectionAsync();
                signInWithProvider('google');
              }}
            >
              <Ionicons name="logo-google" size={17} color={colors.ink} />
              <Text style={styles.appleText}>Continue with Gmail</Text>
            </Pressable>
            <View style={styles.switchRow}>
              <Text style={styles.switchPrompt}>New to Ovella?</Text>
              <Pressable onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={styles.switchLink}>Create an account</Text>
              </Pressable>
            </View>
            <Text style={styles.seed}>Demo account · alex@ovella.app · ovella123</Text>
            <View style={styles.note}>
              <Ionicons name="shield-checkmark-outline" size={19} color={colors.mintDeep} />
              <Text style={styles.noteText}>Your health data is encrypted, private, and never sold.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    paddingHorizontal: 26,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: { fontFamily: fonts.bodySemi, color: colors.onGradient, fontSize: 13 },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 26,
    paddingTop: 70,
    paddingBottom: 34,
  },
  secureText: { fontFamily: fonts.body, color: colors.onGradient, fontSize: 12 },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -18,
    paddingHorizontal: 28,
    paddingTop: 26,
    gap: 14,
  },
  title: { fontFamily: fonts.display, color: colors.plum, fontSize: 30, letterSpacing: -0.5, marginTop: -8 },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 13, lineHeight: 18, marginTop: -8 },
  options: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  check: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.rose, borderColor: colors.rose },
  rememberText: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12 },
  forgot: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  error: { fontFamily: fonts.bodySemi, color: colors.periodText, fontSize: 13 },
  seed: { fontFamily: fonts.body, color: colors.muted, fontSize: 11, textAlign: 'center' },
  apple: {
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  appleText: { fontFamily: fonts.body, color: colors.ink, fontSize: 13 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  switchPrompt: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12 },
  switchLink: { fontFamily: fonts.body, color: colors.rose, fontSize: 12 },
  note: {
    backgroundColor: '#F7EEF1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteText: { flex: 1, fontFamily: fonts.body, color: colors.inkSoft, fontSize: 11, lineHeight: 16 },
});
