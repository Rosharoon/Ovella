import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  SvgXml,
} from 'react-native-svg';
import { weekArt } from './weekArt';
import { colors, fonts } from '../theme';
import { CycleSnapshot, LunarName } from '../types';
import { LunarSnapshot } from '../utils/lunar';

const LUNAR_MONTH = 29.530588853;
const PHASE_ORDER: LunarName[] = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];

export function MoonGraphic({
  lunar,
  size = 92,
  clipId,
}: {
  lunar: LunarSnapshot;
  size?: number;
  clipId?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const t = (lunar.age % LUNAR_MONTH) / LUNAR_MONTH;
  const lit = lunar.illumination / 100;
  const waxing = t < 0.5;
  const dx = waxing ? r * (1.05 - lit * 1.05) : -r * (1.05 - lit * 1.05);
  const dark = lit < 0.06;
  const full = lit > 0.94;
  const clip = clipId ?? `moon-${lunar.name.replace(/\s/g, '')}-${size}`;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <ClipPath id={clip}>
          <Circle cx={cx} cy={cy} r={r} />
        </ClipPath>
      </Defs>
      <Circle cx={cx} cy={cy} r={r + 10} fill={colors.lilacSoft} opacity={0.45} />
      <Circle cx={cx} cy={cy} r={r + 5} fill="#E8D9F4" opacity={0.7} />
      <Circle cx={cx} cy={cy} r={r} fill={full || !dark ? '#F7E7C4' : '#5A4468'} />
      {!full && !dark ? (
        <G clipPath={`url(#${clip})`}>
          <Circle cx={cx + dx} cy={cy} r={r} fill="#3F2C4F" opacity={0.78} />
        </G>
      ) : null}
      {dark ? <Circle cx={cx} cy={cy} r={r} fill="#4A3558" /> : null}
      <Circle cx={cx - r * 0.28} cy={cy - r * 0.3} r={r * 0.12} fill="#FFF8E8" opacity={0.28} />
      <Circle cx={cx} cy={cy} r={r} stroke="#E8C36A" strokeWidth={1.2} fill="none" opacity={0.45} />
    </Svg>
  );
}

export function LunarPhaseWheel({
  current,
  idPrefix = 'wheel',
}: {
  current: LunarName;
  idPrefix?: string;
}) {
  return (
    <View style={styles.wheel}>
      {PHASE_ORDER.map((name, index) => {
        const age = (index / 8) * LUNAR_MONTH;
        const illumination = Math.round((1 - Math.cos((2 * Math.PI * age) / LUNAR_MONTH)) * 50);
        const active = name === current;
        return (
          <View key={name} style={[styles.wheelItem, active && styles.wheelItemOn]}>
            <MoonGraphic
              size={active ? 36 : 28}
              clipId={`${idPrefix}-${index}`}
              lunar={{ name, emoji: '', illumination, age, message: '' }}
            />
          </View>
        );
      })}
    </View>
  );
}

function toneForDay(day: number, snapshot: CycleSnapshot) {
  if (day <= snapshot.periodLength) return colors.period;
  if (day === snapshot.ovulationDay) return colors.ovulation;
  if (day >= snapshot.fertileStart && day <= snapshot.fertileEnd) return colors.fertile;
  if (day < snapshot.ovulationDay) return colors.follicular;
  return colors.luteal;
}

export function CycleDayStrip({ snapshot }: { snapshot: CycleSnapshot }) {
  const days = Array.from({ length: snapshot.cycleLength }, (_, i) => i + 1);
  return (
    <View>
      <View style={styles.strip}>
        {days.map((day) => {
          const today = day === snapshot.cycleDay;
          return (
            <View
              key={day}
              style={[
                styles.stripBar,
                {
                  height: today ? 46 : day === snapshot.ovulationDay ? 36 : 26,
                  backgroundColor: toneForDay(day, snapshot),
                  opacity: today ? 1 : 0.78,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.stripLabels}>
        <Text style={styles.stripLabel}>Day 1</Text>
        <Text style={[styles.stripLabel, styles.stripLabelCenter]}>Today · {snapshot.cycleDay}</Text>
        <Text style={styles.stripLabel}>Day {snapshot.cycleLength}</Text>
      </View>
    </View>
  );
}

function estrogenAt(day: number, n: number, ovu: number) {
  const peak = Math.exp(-((day - ovu) ** 2) / (2 * 2.4 ** 2));
  const luteal =
    day > ovu ? 0.2 * Math.exp(-((day - ovu - n * 0.18) ** 2) / (2 * 4.2 ** 2)) : 0;
  const baseline = 0.1 + 0.08 * Math.max(0, (day - 4) / n);
  return Math.min(1, baseline + peak * 0.86 + luteal);
}

function progesteroneAt(day: number, n: number, ovu: number) {
  if (day <= ovu) return 0.07 + 0.03 * (day / Math.max(ovu, 1));
  const mid = ovu + (n - ovu) * 0.42;
  return 0.1 + 0.8 * Math.exp(-((day - mid) ** 2) / (2 * 4.8 ** 2));
}

function curvePath(
  values: number[],
  width: number,
  height: number,
  pad: number,
) {
  const innerW = width - pad * 2;
  const innerH = height - pad * 2 - 8;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * innerW;
    const y = height - pad - 8 - v * innerH;
    return { x, y };
  });
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i += 1) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return { d, pts };
}

export function HormoneChart({ snapshot }: { snapshot: CycleSnapshot }) {
  const width = 300;
  const height = 148;
  const pad = 14;
  const n = snapshot.cycleLength;
  const days = Array.from({ length: n }, (_, i) => i + 1);
  const e = days.map((d) => estrogenAt(d, n, snapshot.ovulationDay));
  const p = days.map((d) => progesteroneAt(d, n, snapshot.ovulationDay));
  const ePath = curvePath(e, width, height, pad);
  const pPath = curvePath(p, width, height, pad);
  const todayX =
    pad + ((snapshot.cycleDay - 1) / Math.max(n - 1, 1)) * (width - pad * 2);
  const closeE = `${ePath.d} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`;
  const closeP = `${pPath.d} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect x={0} y={0} width={width} height={height} rx={16} fill={colors.blush} />
        {[0.25, 0.5, 0.75].map((g) => (
          <Line
            key={g}
            x1={pad}
            x2={width - pad}
            y1={pad + g * (height - pad * 2 - 8)}
            y2={pad + g * (height - pad * 2 - 8)}
            stroke={colors.petal}
            strokeDasharray="4 6"
          />
        ))}
        <Path d={closeE} fill={colors.rose} opacity={0.14} />
        <Path d={closeP} fill={colors.lilac} opacity={0.16} />
        <Path d={ePath.d} stroke={colors.rose} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d={pPath.d} stroke="#8B5FBF" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Line
          x1={todayX}
          x2={todayX}
          y1={pad}
          y2={height - pad}
          stroke={colors.ink}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          opacity={0.35}
        />
        <Circle cx={todayX} cy={ePath.pts[snapshot.cycleDay - 1]?.y ?? 0} r={4.5} fill={colors.rose} />
        <Circle cx={todayX} cy={pPath.pts[snapshot.cycleDay - 1]?.y ?? 0} r={4.5} fill="#8B5FBF" />
      </Svg>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.rose }]} />
          <Text style={styles.legendText}>Estrogen</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: '#8B5FBF' }]} />
          <Text style={styles.legendText}>Progesterone</Text>
        </View>
        <Text style={styles.legendText}>Dashed line is today</Text>
      </View>
    </View>
  );
}

export function PregnancyRing({ week, label }: { week: number; label: string }) {
  const size = 196;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.min(1, Math.max(0, week / 40));

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.blushDeep}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.rose}
            strokeWidth={stroke}
            strokeDasharray={`${progress * c} ${c}`}
            strokeLinecap="round"
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r - 22}
            stroke={colors.lilacSoft}
            strokeWidth={6}
            strokeDasharray={`${Math.min(1, week / 13) * 2 * Math.PI * (r - 22)} ${2 * Math.PI * (r - 22)}`}
            fill="none"
            opacity={0.7}
          />
        </G>
      </Svg>
      <View style={styles.ringCenter} pointerEvents="none">
        <Text style={styles.ringKicker}>Week</Text>
        <Text style={styles.ringDay}>{Math.min(week, 42)}</Text>
        <Text style={styles.ringPhase}>{label}</Text>
      </View>
    </View>
  );
}

export function BabyBloom({ week, size = 132 }: { week: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const progress = Math.min(1, Math.max(0.12, week / 40));
  const petals = week < 13 ? 5 : week < 28 ? 7 : 9;
  const petalR = 18 + progress * 22;
  const core = 8 + progress * 16;
  const tint = week < 13 ? colors.petal : week < 28 ? colors.peach : colors.lilac;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={size * 0.46} fill={colors.blush} />
      {Array.from({ length: petals }, (_, i) => {
        const angle = (i / petals) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(angle) * petalR * 0.55;
        const py = cy + Math.sin(angle) * petalR * 0.55;
        return (
          <Ellipse
            key={i}
            cx={px}
            cy={py}
            rx={10 + progress * 7}
            ry={16 + progress * 10}
            fill={tint}
            opacity={0.72}
            transform={`rotate(${(angle * 180) / Math.PI} ${px} ${py})`}
          />
        );
      })}
      <Circle cx={cx} cy={cy} r={core} fill={colors.gold} />
      <Circle cx={cx - 4} cy={cy - 5} r={core * 0.28} fill="#FFF6D8" opacity={0.7} />
    </Svg>
  );
}

function weekXml(week: number) {
  return weekArt[week - 1].replace(/\s(?:width|height)="[^"]*"/g, '');
}

export function WeekIllustration({ week, size = 108 }: { week: number; size?: number }) {
  const clamped = Math.min(40, Math.max(1, week));
  const height = Math.round((size * 106) / 108);
  return <SvgXml key={clamped} xml={weekXml(clamped)} width={size} height={height} />;
}

export function WeekTicks({ week }: { week: number }) {
  return (
    <View style={styles.ticks}>
      {Array.from({ length: 40 }, (_, i) => {
        const n = i + 1;
        const filled = n <= week;
        const tri = n <= 13 ? colors.period : n <= 27 ? colors.peach : colors.lilac;
        return (
          <View
            key={n}
            style={[
              styles.tick,
              { backgroundColor: filled ? tri : colors.blushDeep, height: n === week ? 22 : 12 },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  wheelItem: { opacity: 0.45, alignItems: 'center' },
  wheelItemOn: { opacity: 1, transform: [{ scale: 1.05 }] },
  strip: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    gap: 2.5,
  },
  stripBar: {
    flex: 1,
    borderRadius: 5,
  },
  stripLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stripLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 11 },
  stripLabelCenter: { fontFamily: fonts.bodySemi, color: colors.rose },
  chartLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.body, color: colors.inkSoft, fontSize: 12 },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringKicker: {
    fontFamily: fonts.bodySemi,
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ringDay: { fontFamily: fonts.display, fontSize: 48, color: colors.ink, lineHeight: 54 },
  ringPhase: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 13 },
  ticks: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 24 },
  tick: { flex: 1, borderRadius: 3 },
});
