import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { Eyebrow, GradientButton, GradientWash, IconField } from '../../components/chrome';
import { DatePickerModal } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';
import { ageFromBirthDate, isTeenBirthDate } from '../../utils/age';
import { prettyDate, toISODate } from '../../utils/dates';

export function CreateAccountScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [dobOpen, setDobOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (name.trim().length < 2) {
      setError('Please tell us your name.');
      return;
    }
    if (!dob) {
      setError('Please add your date of birth.');
      return;
    }
    if (dob > toISODate(new Date())) {
      setError('Date of birth can’t be in the future.');
      return;
    }
    if (!email.includes('@')) {
      setError('Use a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Use a password of at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    if (!consent) {
      setError('Please agree to the Terms of Use and Privacy Policy.');
      return;
    }
    setBusy(true);
    const message = await signUp(name, email, password, dob);
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
        <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
          <GradientWash style={{ paddingTop: insets.top }}>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.backRow}>
                <View style={styles.backBtn}>
                  <Ionicons name="chevron-back" size={18} color={colors.white} />
                </View>
                <Text style={styles.backLabel}>Sign in</Text>
              </Pressable>
              <BrandMark height={27} />
            </View>
            <View style={styles.promise}>
              <Text style={styles.promiseTitle}>Your health. Your terms.</Text>
              <Text style={styles.promiseCopy}>A private space that adapts to your age and care journey.</Text>
            </View>
          </GradientWash>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <Eyebrow>Get started</Eyebrow>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.lead}>Tell us the essentials. You can adjust health settings anytime.</Text>
            <View style={styles.split}>
              <View style={styles.splitItem}>
                <IconField
                  label="Full name"
                  icon="person-outline"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.splitItem}>
                <Text style={styles.dobLabel}>Date of birth</Text>
                <Pressable onPress={() => setDobOpen(true)} style={styles.dob}>
                  <Ionicons name="calendar-outline" size={16} color={colors.rose} />
                  <Text style={[styles.dobText, !dob && styles.dobPlaceholder]}>
                    {dob ? prettyDate(dob) : 'Add your age'}
                  </Text>
                </Pressable>
              </View>
            </View>
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
              placeholder="At least 8 characters"
              secureTextEntry
            />
            <IconField
              label="Confirm password"
              icon="shield-checkmark-outline"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat your password"
              secureTextEntry
            />
            <View style={styles.teen}>
              <Text style={styles.teenCopy}>
                {dob && isTeenBirthDate(dob)
                  ? `You’re ${ageFromBirthDate(dob)}. Teen Mode opens automatically and stays on. Period tracking works the same, and you can’t switch to another mode.`
                  : dob
                    ? `You’re ${ageFromBirthDate(dob)}. Next you’ll choose period or pregnancy tracking.`
                    : 'Everyone adds a date of birth. Under 18 opens Teen Mode and stays there.'}
              </Text>
            </View>
            <View style={styles.consent}>
              <Pressable onPress={() => setConsent((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: consent }}>
                <View style={[styles.box, consent && styles.boxOn]}>
                  {consent ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
                </View>
              </Pressable>
              <Text style={styles.consentText}>
                I agree to Ovella’s{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Legal', { kind: 'terms' })}>
                  Terms of Use
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Legal', { kind: 'privacy' })}>
                  Privacy Policy
                </Text>
                , including secure processing of my health information.
              </Text>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <GradientButton
              label={busy ? 'Creating account…' : 'Create account'}
              icon="arrow-forward"
              onPress={onSubmit}
              disabled={busy}
            />
            <View style={styles.switchRow}>
              <Text style={styles.switchPrompt}>Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.switchLink}>Sign in</Text>
              </Pressable>
            </View>
            <View style={styles.assure}>
              <Ionicons name="lock-closed" size={12} color={colors.mintDeep} />
              <Text style={styles.assureText}>Encrypted health data • Never sold</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DatePickerModal
        visible={dobOpen}
        value={dob || toISODate(new Date(new Date().getFullYear() - 16, new Date().getMonth(), new Date().getDate()))}
        title="Date of birth"
        maxDate={toISODate(new Date())}
        onClose={() => setDobOpen(false)}
        onSelect={(date) => {
          setDob(date);
          setDobOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FBF7F8' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 26,
    paddingTop: 6,
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
    backgroundColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: { fontFamily: fonts.bodySemi, color: '#F7EAF0', fontSize: 13 },
  promise: { paddingHorizontal: 26, paddingTop: 28, paddingBottom: 26, gap: 5 },
  promiseTitle: { fontFamily: fonts.display, color: colors.white, fontSize: 25 },
  promiseCopy: { fontFamily: fonts.body, color: '#F7EAF0', fontSize: 12, lineHeight: 17 },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -16,
    paddingHorizontal: 26,
    paddingTop: 22,
    gap: 11,
  },
  title: { fontFamily: fonts.display, color: '#5B3A4A', fontSize: 28, letterSpacing: -0.4, marginTop: -4 },
  lead: { fontFamily: fonts.body, color: '#8A6F7A', fontSize: 12, lineHeight: 17, marginTop: -6, marginBottom: 4 },
  split: { flexDirection: 'row', gap: 10 },
  splitItem: { flex: 1 },
  dobLabel: { fontFamily: fonts.bodySemi, color: colors.inkSoft, fontSize: 12, marginBottom: 6 },
  dob: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dobText: { flex: 1, fontFamily: fonts.body, color: colors.ink, fontSize: 13 },
  dobPlaceholder: { color: colors.muted },
  teen: {
    backgroundColor: '#FFF6F8',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 13,
  },
  teenCopy: { fontFamily: fonts.body, color: '#8A6F7A', fontSize: 12, lineHeight: 17 },
  consent: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.rose, borderColor: colors.rose },
  consentText: { flex: 1, fontFamily: fonts.body, color: '#8A6F7A', fontSize: 10, lineHeight: 15 },
  link: { fontFamily: fonts.bodyBold, color: colors.rose },
  error: { fontFamily: fonts.bodySemi, color: colors.periodText, fontSize: 13 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  switchPrompt: { fontFamily: fonts.body, color: '#8A6F7A', fontSize: 12 },
  switchLink: { fontFamily: fonts.body, color: colors.rose, fontSize: 12 },
  assure: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  assureText: { fontFamily: fonts.body, color: '#9A8290', fontSize: 10 },
});
