import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { colors } from '../theme';

export function WelcomeScene() {
  return (
    <View style={styles.wrap}>
      <Svg width={280} height={180} viewBox="0 0 280 180">
        <Ellipse cx="78" cy="110" rx="70" ry="52" fill={colors.peachSoft} />
        <Ellipse cx="200" cy="92" rx="62" ry="48" fill={colors.petal} />
        <Ellipse cx="150" cy="140" rx="40" ry="22" fill={colors.mint} opacity={0.8} />
        <Circle cx="142" cy="58" r="22" fill="#F3C4B0" />
        <Path d="M124 58 C124 40 160 38 160 58" fill="#5A3A32" />
        <Path d="M122 92 C122 78 162 78 162 96 C162 122 122 122 122 96 Z" fill={colors.roseSoft} />
        <Path d="M108 128 C120 108 164 108 176 130" stroke={colors.rose} strokeWidth="3" fill="none" />
        <Path d="M86 150 C70 128 58 150 72 158 C86 150 96 162 86 150" fill={colors.mintDeep} />
        <Path d="M210 58 C218 40 236 48 228 64 C220 58 210 66 210 58" fill={colors.rose} />
        <Circle cx="214" cy="118" r="10" fill={colors.lilacSoft} />
        <Circle cx="232" cy="132" r="7" fill={colors.peach} />
      </Svg>
    </View>
  );
}

export function ProfileScene() {
  return (
    <View style={styles.avatar}>
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Circle cx="36" cy="36" r="36" fill={colors.petal} />
        <Circle cx="36" cy="28" r="12" fill="#F3C4B0" />
        <Path d="M24 28 C24 16 48 16 48 28" fill="#5A3A32" />
        <Path d="M22 58 C22 44 50 44 50 58" fill={colors.roseSoft} />
        <Path d="M50 22 C56 14 64 22 58 28" fill={colors.mintDeep} />
      </Svg>
    </View>
  );
}

export function FoodScene() {
  return (
    <Svg width={54} height={40} viewBox="0 0 54 40">
      <Ellipse cx="18" cy="24" rx="14" ry="12" fill="#E8A85A" />
      <Path d="M18 12 C20 8 24 10 22 14" stroke={colors.mintDeep} strokeWidth="2" fill="none" />
      <Ellipse cx="40" cy="24" rx="10" ry="13" fill="#7BAF6A" />
      <Path d="M40 12 C38 8 44 8 42 13" stroke="#5C8A50" strokeWidth="2" fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden' },
});
