import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, gradient, radii } from '../theme';

export function GradientWash({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <LinearGradient
      colors={[...gradient.colors]}
      locations={[...gradient.locations]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.wash, style]}
    >
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />
      <View style={styles.dot} />
      {children}
    </LinearGradient>
  );
}

export function GradientButton({
  label,
  onPress,
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => pressed && { opacity: 0.92 }}>
      <LinearGradient
        colors={disabled ? ['#D7C3CC', '#D7C3CC'] : [...gradient.colors]}
        locations={[...gradient.locations]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBtn}
      >
        <Text style={styles.gradientBtnText}>{label}</Text>
        {icon ? <Ionicons name={icon} size={17} color={colors.white} /> : null}
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.outlineBtn}>
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

export function IconField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={colors.rose} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B19AA3"
          secureTextEntry={secureTextEntry ? hidden : false}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

const styles = StyleSheet.create({
  wash: { overflow: 'hidden' },
  orbLarge: {
    position: 'absolute',
    right: -46,
    top: 78,
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orbSmall: {
    position: 'absolute',
    left: -58,
    top: 168,
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  dot: {
    position: 'absolute',
    right: 46,
    top: 62,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,252,253,0.55)',
  },
  gradientBtn: {
    height: 54,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#6E3654',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 22,
    elevation: 4,
  },
  gradientBtnText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 15 },
  outlineBtn: {
    height: 54,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.roseMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlineText: { color: '#8F5B73', fontFamily: fonts.bodyBold, fontSize: 15 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.body, color: colors.ink, fontSize: 13 },
  inputRow: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.ink, paddingVertical: 0 },
  eyebrow: {
    fontFamily: fonts.body,
    color: colors.rose,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
