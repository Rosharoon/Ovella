import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import { fonts } from '../theme';

export function FloralMark({
  height = 27,
  color = '#FFFFFF',
  core = '#ED5C7A',
}: {
  height?: number;
  color?: string;
  core?: string;
}) {
  const width = (75.5788 / 33.4286) * height;
  return (
    <Svg width={width} height={height} viewBox="0 0 75.5788 33.4286">
      <G>
        <Ellipse cx="4.34571" cy="16.7143" rx="4.34571" ry="6.35143" fill={color} />
        <Ellipse
          cx="16.0749"
          cy="16.7143"
          rx="4.34572"
          ry="6.35143"
          fill={color}
          transform="rotate(-72 16.0749 16.7143)"
        />
        <Ellipse
          cx="30.7074"
          cy="16.7143"
          rx="4.34571"
          ry="6.35143"
          fill={color}
          transform="rotate(-144 30.7074 16.7143)"
        />
        <Ellipse
          cx="45.2056"
          cy="16.7143"
          rx="4.34571"
          ry="6.35143"
          fill={color}
          transform="rotate(144 45.2056 16.7143)"
        />
        <Ellipse
          cx="59.838"
          cy="16.7143"
          rx="4.34572"
          ry="6.35143"
          fill={color}
          transform="rotate(72 59.838 16.7143)"
        />
        <Circle cx="71.4002" cy="16.7143" r="4.17857" fill={core} />
      </G>
    </Svg>
  );
}

export function BrandMark({
  height = 27,
  color = '#FFFFFF',
  core = '#ED5C7A',
}: {
  height?: number;
  color?: string;
  core?: string;
}) {
  return (
    <View style={styles.row}>
      <FloralMark height={height} color={color} core={core} />
      <Text style={[styles.name, { color, fontSize: height * 0.89 }]}>Ovella</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: fonts.display, letterSpacing: -0.5 },
});

