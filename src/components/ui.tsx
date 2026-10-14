import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';
import { colors, fonts, gradient, radii, shadows, spacing } from '../theme';
import { toISODate } from '../utils/dates';

export function Screen({
  children,
  padded = true,
}: {
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <LinearGradient colors={[colors.canvas, colors.blush]} style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.flex, padded && styles.padded]}>{children}</View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <LinearGradient
        colors={disabled ? ['#E7C4CB', '#E7C4CB'] : [...gradient.colors]}
        locations={[...gradient.locations]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ghostBtn}>
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export function Stepper({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          style={styles.stepBtn}
        >
          <Ionicons name="remove" size={18} color={colors.rose} />
        </Pressable>
        <Text style={styles.stepValue}>
          {value} {suffix}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          style={styles.stepBtn}
        >
          <Ionicons name="add" size={18} color={colors.rose} />
        </Pressable>
      </View>
    </View>
  );
}

export function DatePickerModal({
  visible,
  value,
  title,
  hint,
  confirmLabel = 'Use this date',
  highlight,
  maxDate,
  embedded,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: string;
  title: string;
  hint?: string;
  confirmLabel?: string;
  highlight?: string;
  maxDate?: string;
  embedded?: boolean;
  onClose: () => void;
  onSelect: (iso: string) => void;
}) {
  const initial = value ? new Date(value + 'T00:00:00') : highlight ? new Date(highlight + 'T00:00:00') : new Date();
  const [cursor, setCursor] = useState(initial);
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (!visible) return;
    const focus = value || highlight;
    const next = focus ? new Date(focus + 'T00:00:00') : new Date();
    setCursor(next);
    setSelected(value);
  }, [visible, value, highlight]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfMonth(cursor);
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const card = (
        <Pressable style={styles.modalCard} onPress={() => undefined}>
          <Text style={styles.modalTitle}>{title}</Text>
          {hint ? <Text style={styles.modalHint}>{hint}</Text> : null}
          <View style={styles.monthNav}>
            <Pressable onPress={() => setCursor((d) => addMonths(d, -1))}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <Text style={styles.monthLabel}>{format(cursor, 'MMMM yyyy')}</Text>
            <Pressable onPress={() => setCursor((d) => addMonths(d, 1))}>
              <Ionicons name="chevron-forward" size={22} color={colors.ink} />
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={`${d}-${i}`} style={styles.weekDay}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {days.map((day) => {
              const iso = toISODate(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const isSelected = Boolean(selected) && iso === selected;
              const isEstimate = Boolean(highlight) && iso === highlight && !isSelected;
              const blocked = maxDate != null && iso > maxDate;
              return (
                <Pressable
                  key={iso}
                  disabled={blocked}
                  onPress={() => setSelected(iso)}
                  style={[
                    styles.gridDay,
                    isEstimate && styles.gridDayEstimate,
                    isSelected && styles.gridDayOn,
                    blocked && styles.gridDayBlocked,
                    !inMonth && { opacity: 0.25 },
                  ]}
                >
                  <Text style={[styles.gridDayText, isSelected && { color: colors.white }]}>
                    {format(day, 'd')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton
            label={selected ? confirmLabel : 'Choose a start day'}
            disabled={!selected || Boolean(maxDate && selected > maxDate)}
            onPress={() => {
              if (!selected || (maxDate && selected > maxDate)) return;
              onSelect(selected);
              onClose();
            }}
          />
        </Pressable>
  );

  if (embedded) return card;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        {card}
      </Pressable>
    </Modal>
  );
}

export function Pill({
  label,
  tone = 'rose',
}: {
  label: string;
  tone?: 'rose' | 'lilac' | 'peach' | 'gold';
}) {
  const bg = {
    rose: colors.petal,
    lilac: colors.lilacSoft,
    peach: '#F8E0CC',
    gold: '#F8E7B8',
  }[tone];
  const fg = {
    rose: colors.rose,
    lilac: '#7A4CA0',
    peach: '#B86A3D',
    gold: '#8A6A1E',
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ScrollScreen({ children }: { children: React.ReactNode }) {
  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.inkSoft,
    lineHeight: 22,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  primaryBtn: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6E3654',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 4,
  },
  primaryBtnText: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  ghostBtn: { alignItems: 'center', paddingVertical: 12 },
  ghostBtnText: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 15 },
  field: { marginBottom: spacing.md },
  fieldLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.inkSoft,
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.blush,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: fonts.body,
    color: colors.ink,
    fontSize: 16,
  },
  stepper: { marginBottom: spacing.md },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.blush,
    borderRadius: radii.md,
    padding: 8,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  stepValue: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: 20,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 8,
  },
  modalHint: {
    fontFamily: fonts.body,
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  monthLabel: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  gridDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  gridDayOn: { backgroundColor: colors.rose },
  gridDayBlocked: { opacity: 0.28 },
  gridDayEstimate: { backgroundColor: colors.periodPink, borderWidth: 1, borderColor: colors.periodPink },
  gridDayText: { fontFamily: fonts.bodySemi, color: colors.ink },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  pillText: { fontFamily: fonts.bodySemi, fontSize: 12 },
});
