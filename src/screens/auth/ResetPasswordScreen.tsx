import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientButton, GradientWash } from '../../components/chrome';
import { TextField } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts } from '../../theme';

export function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { resetPassword } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.includes('@')) {
      setError('Enter the email on the account.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    setBusy(true);
    const message = await resetPassword(email, password);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
          <GradientWash style={{ paddingTop: insets.top }}>
            <Pressable onPress={() => navigation.goBack()} style={styles.back}>
              <Ionicons name="chevron-back" size={18} color={colors.white} />
              <Text style={styles.backText}>Sign in</Text>
            </Pressable>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.lead}>Accounts are stored on this phone, so the new password is saved here.</Text>
          </GradientWash>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            {done ? (
              <>
                <Text style={styles.done}>Password updated. Sign in with the new one.</Text>
                <GradientButton label="Back to sign in" icon="arrow-forward" onPress={() => navigation.navigate('SignIn')} />
              </>
            ) : (
              <>
                <TextField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
                <TextField label="New password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
                <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Repeat the new password" secureTextEntry />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <GradientButton label={busy ? 'Saving…' : 'Save new password'} icon="arrow-forward" onPress={onSubmit} disabled={busy} />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 20, marginBottom: 12 },
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
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 14,
  },
  error: { fontFamily: fonts.bodySemi, color: colors.periodText, fontSize: 13 },
  done: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 22 },
});
