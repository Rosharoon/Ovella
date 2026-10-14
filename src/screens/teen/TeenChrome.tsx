import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandMark } from '../../components/BrandMark';
import { colors, fonts } from '../../theme';

export function TeenBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>TEEN MODE</Text>
    </View>
  );
}

export function TeenBrandBar({ onBack, backLabel }: { onBack?: () => void; backLabel?: string }) {
  return (
    <View style={styles.bar}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Ionicons name="chevron-back" size={16} color={colors.brand} />
          {backLabel ? <Text style={styles.backText}>{backLabel}</Text> : null}
        </Pressable>
      ) : (
        <BrandMark height={27} color={colors.brand} core="#ED5C7A" />
      )}
      {onBack ? <BrandMark height={27} color={colors.brand} core="#ED5C7A" /> : <TeenBadge />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 46,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#FCE7F3',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F2D7E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 10, letterSpacing: 0.4 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: fonts.bodySemi, color: colors.brand, fontSize: 12 },
});
