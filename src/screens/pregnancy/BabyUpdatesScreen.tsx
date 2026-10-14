import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { guideIcons } from '../../components/guideIcons';
import { LogoMark } from '../../components/layout';
import { WeekIllustration, WeekTicks } from '../../components/graphics';
import { Card, Pill, ScrollScreen } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { getWeekGuide, pregnancyWeek, pregnancyWeeks, WeekGuide } from '../../data/pregnancyWeeks';
import { colors, fonts } from '../../theme';

export function BabyUpdatesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { pregnancy } = useApp();
  if (!pregnancy) return null;
  const current = pregnancyWeek(pregnancy);
  const baby = pregnancy.babyName || 'Baby';

  return (
    <ScrollScreen>
      <View style={{ paddingTop: insets.top + 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <LogoMark size={40} />
          <Text style={styles.title}>Baby updates</Text>
        </View>
        <Text style={styles.lead}>
          A week-by-week letter for {baby}. Your current week is highlighted.
        </Text>

        <Card style={{ marginTop: 8, alignItems: 'center' }}>
          <WeekIllustration key={current} week={current} size={140} />
          <Text style={styles.size}>Week {current} · size of {getWeekGuide(current).size}</Text>
          <View style={{ width: '100%', marginTop: 12 }}>
            <WeekTicks week={current} />
          </View>
        </Card>

        {pregnancyWeeks.map((week) => {
          const active = week.week === current;
          return (
            <Card
              key={week.week}
              style={{
                marginTop: 12,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colors.rose : colors.line,
                backgroundColor: active ? colors.petal : colors.white,
              }}
            >
              <Pressable onPress={() => navigation.navigate('Guide', { week: week.week })} style={styles.weekRow}>
                <WeekIllustration week={week.week} size={78} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={styles.row}>
                    <Pill
                      label={`Week ${week.week}`}
                      tone={week.trimester === 1 ? 'rose' : week.trimester === 2 ? 'peach' : 'lilac'}
                    />
                    {active ? <Pill label="This week" tone="gold" /> : null}
                  </View>
                  <Text style={[styles.cardTitle, { marginTop: 0 }]}>{week.title}</Text>
                  <Text style={styles.size}>Size of {week.size}</Text>
                </View>
              </Pressable>
              <Text style={styles.copy}>{week.baby}</Text>
              <Text style={styles.tip}>{week.tip}</Text>
            </Card>
          );
        })}
      </View>
    </ScrollScreen>
  );
}

const TRIMESTER = ['First trimester', 'Second trimester', 'Third trimester'] as const;

export function WeekGuideScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();
  const { pregnancy } = useApp();
  const list = useRef<FlatList<WeekGuide>>(null);
  const heights = useRef<number[]>(Array(40).fill(0));
  const current = Math.min(40, Math.max(1, pregnancy ? pregnancyWeek(pregnancy) : 1));
  const requested = Number(route.params?.week);
  const start = requested >= 1 && requested <= 40 ? requested : current;
  const [index, setIndex] = useState(start - 1);
  const [cardHeight, setCardHeight] = useState(640);
  const showing = pregnancyWeeks[index];

  useEffect(() => {
    const measured = heights.current[index];
    if (measured) setCardHeight(measured);
  }, [index]);

  const go = (next: number) => {
    const clamped = Math.min(39, Math.max(0, next));
    list.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  };

  if (!pregnancy || !showing) return null;

  return (
    <View style={[styles.guide, { backgroundColor: colors.canvas, paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
      >
        <View style={styles.nav}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backWell}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <SvgXml xml={guideIcons.chevronBack} width={18} height={18} />
          </Pressable>
          <View style={styles.brand}>
            <SvgXml xml={guideIcons.floral} width={24} height={24} />
            <Text style={styles.brandName}>Ovella</Text>
          </View>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.heading}>
          <Text style={styles.screenTitle}>Baby week guide</Text>
          <Text style={styles.screenLead}>A little closer to meeting your little one.</Text>
        </View>
        <View style={styles.weekNavWrap}>
          <View style={styles.weekNav}>
            <Pressable
              onPress={() => go(index - 1)}
              disabled={index === 0}
              style={styles.weekStep}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
            >
              <View style={index === 0 ? styles.stepOff : undefined}>
                <SvgXml xml={guideIcons.chevronPrev} width={17} height={17} />
              </View>
              <Text style={[styles.weekStepText, index === 0 && styles.weekStepOff]}>
                {index === 0 ? '' : `Week ${showing.week - 1}`}
              </Text>
            </Pressable>
            <View style={styles.weekPill}>
              <Text style={styles.weekPillText}>Week {showing.week}</Text>
            </View>
            <Pressable
              onPress={() => go(index + 1)}
              disabled={index === 39}
              style={[styles.weekStep, styles.weekStepEnd]}
              accessibilityRole="button"
              accessibilityLabel="Next week"
            >
              <Text style={[styles.weekStepText, index === 39 && styles.weekStepOff]}>
                {index === 39 ? '' : `Week ${showing.week + 1}`}
              </Text>
              <View style={index === 39 ? styles.stepOff : undefined}>
                <SvgXml xml={guideIcons.chevronNext} width={17} height={17} />
              </View>
            </Pressable>
          </View>
        </View>
        <FlatList
          ref={list}
          style={{ height: cardHeight }}
          data={pregnancyWeeks}
          extraData={index}
          horizontal
          pagingEnabled
          directionalLockEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={start - 1}
          getItemLayout={(_, itemIndex) => ({ length: width, offset: width * itemIndex, index: itemIndex })}
          contentContainerStyle={styles.pager}
          keyExtractor={(item) => String(item.week)}
          onMomentumScrollEnd={(event) => {
            const next = Math.round(event.nativeEvent.contentOffset.x / width);
            if (pregnancyWeeks[next]) setIndex(next);
          }}
          onScrollToIndexFailed={(info) => {
            list.current?.scrollToOffset({ offset: width * info.index, animated: false });
          }}
          renderItem={({ item }) => (
            <WeekGuideCard
              guide={item}
              width={width}
              current={current}
              onHeight={(height) => {
                heights.current[item.week - 1] = height;
                if (item.week - 1 === index) setCardHeight(height);
              }}
            />
          )}
        />
        <View style={styles.swipeBlock}>
          <SvgXml xml={guideIcons.pagination} width={64} height={5} />
          <View style={styles.swipeRow}>
            <SvgXml xml={guideIcons.move} width={15} height={15} />
            <Text style={styles.swipeText}>Swipe left or right to explore each week</Text>
          </View>
        </View>
        <Text style={styles.careNote}>
          Every pregnancy is different. Ovella supports your care; it does not replace medical advice.
        </Text>
      </ScrollView>
    </View>
  );
}

function measureLine(guide: WeekGuide) {
  const parts = [
    guide.length && guide.length !== '—' ? `${guide.length} long` : '',
    guide.weight && guide.weight !== '—' ? guide.weight : '',
  ].filter(Boolean);
  return parts.length ? `About ${parts.join(' · ')}` : '';
}

function WeekGuideCard({
  guide,
  width,
  current,
  onHeight,
}: {
  guide: WeekGuide;
  width: number;
  current: number;
  onHeight?: (height: number) => void;
}) {
  const isCurrent = guide.week === current;
  const measure = measureLine(guide);
  return (
    <View
      style={{ width }}
      onLayout={(event) => {
        const next = Math.ceil(event.nativeEvent.layout.height);
        if (next > 0) onHeight?.(next);
      }}
    >
      <View style={styles.page}>
      <View style={styles.stack}>
        <View style={styles.cardFar} />
        <View style={styles.cardNear} />
        <View style={[styles.frontCard, isCurrent && styles.frontCardCurrent]}>
          <View style={styles.overview}>
            <WeekIllustration key={guide.week} week={guide.week} size={108} />
            <Text style={styles.sizeLine}>Size of {guide.size}</Text>
            <View style={styles.contextRow}>
              <Text style={styles.trimester}>{TRIMESTER[guide.trimester - 1]}</Text>
              {isCurrent ? (
                <>
                  <View style={styles.separator} />
                  <View style={styles.thisWeek}>
                    <Text style={styles.thisWeekText}>This week</Text>
                  </View>
                </>
              ) : null}
            </View>
            <Text style={styles.guideTitle}>{guide.title}</Text>
            {measure ? <Text style={styles.measure}>{measure}</Text> : null}
          </View>
          <View style={styles.divider} />
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeading}>
              <SvgXml xml={guideIcons.baby} width={16} height={16} />
              <Text style={styles.sectionTitle}>Baby</Text>
            </View>
            <Text style={styles.sectionBody}>{guide.baby}</Text>
          </View>
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeading}>
              <SvgXml xml={guideIcons.heart} width={16} height={16} />
              <Text style={styles.sectionTitle}>You</Text>
            </View>
            <Text style={styles.sectionBody}>{guide.body}</Text>
          </View>
          <View style={styles.tipBlock}>
            <View style={styles.sectionHeading}>
              <SvgXml xml={guideIcons.sparkles} width={16} height={16} />
              <Text style={styles.sectionTitle}>This week</Text>
            </View>
            <Text style={styles.sectionBody}>{guide.tip}</Text>
          </View>
        </View>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandName: { fontFamily: fonts.display, color: colors.brand, fontSize: 25 },
  navSpacer: { width: 36, height: 36 },
  heading: { paddingTop: 17, paddingBottom: 12, paddingHorizontal: 24, gap: 7 },
  weekNavWrap: { paddingTop: 8, paddingHorizontal: 20, paddingBottom: 12 },
  stepOff: { opacity: 0.35 },
  backWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: { fontFamily: fonts.display, color: '#30212A', fontSize: 29, lineHeight: 33 },
  screenLead: { fontFamily: fonts.body, color: '#705D68', fontSize: 13, lineHeight: 18 },
  weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weekStep: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, minWidth: 74 },
  weekStepEnd: { justifyContent: 'flex-end' },
  weekStepText: { fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 12 },
  weekStepOff: { color: colors.line },
  weekPill: { backgroundColor: colors.petal, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  weekPillText: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  pager: { alignItems: 'flex-start' },
  page: { paddingHorizontal: 20 },
  stack: { paddingBottom: 20 },
  cardFar: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 28,
    bottom: 0,
    backgroundColor: '#EDD9E2',
    borderWidth: 1,
    borderColor: '#D9BCCB',
    borderRadius: 24,
  },
  cardNear: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 14,
    bottom: 10,
    backgroundColor: '#F5E7ED',
    borderWidth: 1,
    borderColor: '#DFC4D2',
    borderRadius: 24,
  },
  frontCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#6E3654',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  frontCardCurrent: { borderColor: colors.rose },
  overview: { alignItems: 'center', gap: 11 },
  sizeLine: { fontFamily: fonts.body, color: colors.rose, fontSize: 13, textAlign: 'center' },
  contextRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trimester: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 11 },
  separator: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#8A6F7B' },
  thisWeek: { backgroundColor: '#F9EDC9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  thisWeekText: { fontFamily: fonts.bodySemi, color: '#927029', fontSize: 10 },
  guideTitle: { fontFamily: fonts.display, color: '#30212A', fontSize: 27, lineHeight: 31, textAlign: 'center' },
  measure: { fontFamily: fonts.body, color: '#705D68', fontSize: 13, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.line, alignSelf: 'stretch' },
  sectionBlock: { gap: 7 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontFamily: fonts.display, color: colors.rose, fontSize: 17 },
  sectionBody: { fontFamily: fonts.body, color: '#705D68', fontSize: 13, lineHeight: 20 },
  tipBlock: { backgroundColor: colors.petal, borderRadius: 12, padding: 12, gap: 7 },
  swipeBlock: { alignItems: 'center', gap: 9, marginTop: 12, paddingHorizontal: 20 },
  swipeRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  swipeText: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 11 },
  careNote: {
    fontFamily: fonts.body,
    color: '#8A6F7B',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 32,
  },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 4, marginBottom: 8, lineHeight: 21 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 10 },
  size: { fontFamily: fonts.bodySemi, color: colors.rose, marginTop: 4 },
  copy: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 8, lineHeight: 22 },
  tip: { fontFamily: fonts.bodySemi, color: colors.ink, marginTop: 8, lineHeight: 21 },
  guide: { flex: 1 },
});
