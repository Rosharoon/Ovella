import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CycleSnapshot } from '../types';
import { colors, fonts } from '../theme';

const SIZE = 230;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

function arc(length: number, offset: number, color: string) {
  return (
    <Circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={R}
      stroke={color}
      strokeWidth={STROKE}
      strokeDasharray={`${(length / 100) * C} ${C}`}
      strokeDashoffset={-((offset / 100) * C)}
      strokeLinecap="round"
      fill="none"
    />
  );
}

export function CycleRing({ snapshot }: { snapshot: CycleSnapshot }) {
  const periodPct = (snapshot.periodLength / snapshot.cycleLength) * 100;
  const follicularPct = ((snapshot.ovulationDay - 1 - snapshot.periodLength) / snapshot.cycleLength) * 100;
  const ovuPct = (1 / snapshot.cycleLength) * 100;
  const lutealPct = 100 - periodPct - Math.max(follicularPct, 0) - ovuPct;
  const progress = ((snapshot.cycleDay - 1) / snapshot.cycleLength) * 100;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.blushDeep}
            strokeWidth={STROKE}
            fill="none"
          />
          {arc(periodPct, 0, colors.period)}
          {arc(Math.max(follicularPct, 2), periodPct, colors.follicular)}
          {arc(Math.max(ovuPct, 3), periodPct + Math.max(follicularPct, 0), colors.ovulation)}
          {arc(Math.max(lutealPct, 2), periodPct + Math.max(follicularPct, 0) + ovuPct, colors.luteal)}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R - 22}
            stroke={colors.petal}
            strokeWidth={4}
            strokeDasharray={`${(progress / 100) * (2 * Math.PI * (R - 22))} ${2 * Math.PI * (R - 22)}`}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.kicker}>Cycle day</Text>
        <Text style={styles.day}>{snapshot.cycleDay}</Text>
        <Text style={styles.phase}>{snapshot.phaseLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  day: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.ink,
    lineHeight: 58,
  },
  phase: {
    fontFamily: fonts.bodySemi,
    color: colors.rose,
    fontSize: 14,
  },
});
