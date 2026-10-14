import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { pregnancyWeek } from '../../data/pregnancyWeeks';
import { TEEN_ARTICLES } from '../../data/teenLearn';
import { colors, fonts } from '../../theme';
import { TeenBadge, TeenBrandBar } from './TeenChrome';

const TOPICS = TEEN_ARTICLES.filter((item) => item.id !== 'pace');
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  basics: 'water-outline',
  body: 'body-outline',
  symptoms: 'heart-outline',
  help: 'chatbubble-ellipses-outline',
  pregnancy: 'leaf-outline',
};

export function TeenLearnScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { mode, pregnancy, teenPrefs } = useApp();
  const pregnant = mode === 'pregnancy' && pregnancy;
  const topics = [...TOPICS].sort((a, b) => {
    const rank = (id: string) => {
      const index = teenPrefs.interests.indexOf(id);
      return index === -1 ? 99 : index;
    };
    return rank(a.id) - rank(b.id);
  });
  const open = (id: string) => navigation.navigate('Article', { id });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28 }}>
        <TeenBrandBar />
        <View style={styles.page}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.kicker}>OVELLA TEEN</Text>
                <Text style={styles.title}>Learn & Support</Text>
                <Text style={styles.lead}>Honest answers. No awkward questions.</Text>
              </View>
              <TeenBadge />
            </View>
            <View style={styles.heroRow}>
              <Image source={require('../../../assets/teen/learn.jpg')} style={styles.heroArt} />
              <View style={{ flex: 1, gap: 8 }}>
                {['Period basics', 'Body changes', 'Symptoms & support'].map((label) => (
                  <View key={label} style={styles.chip}>
                    <View style={styles.chipDot} />
                    <Text style={styles.chipText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Pressable onPress={() => open(topics[0]?.id ?? 'basics')} style={styles.feature}>
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={styles.kicker}>GROWING WITH YOU</Text>
              <Text style={styles.featureTitle}>Getting to know your cycle</Text>
              <Text style={styles.featureCopy}>A gentle guide to what’s happening in your body.</Text>
              <Text style={styles.link}>Read the guide →</Text>
            </View>
            <Image source={require('../../../assets/teen/learn.jpg')} style={styles.featureArt} />
          </Pressable>

          {pregnant ? (
            <Pressable onPress={() => navigation.navigate('Guide', { week: pregnancyWeek(pregnancy) })} style={styles.topic}>
              <View style={styles.topicIcon}>
                <Ionicons name="flower-outline" size={18} color="#C57AA5" />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.topicTitle}>Week {pregnancyWeek(pregnancy)} guide</Text>
                <Text style={styles.topicCopy}>What is changing this week, and how you might feel.</Text>
                <Text style={styles.topicMeta}>Baby week guide</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C57AA5" />
            </Pressable>
          ) : null}

          <Text style={styles.section}>Explore at your pace</Text>
          {topics.map((topic) => (
            <Pressable key={topic.id} onPress={() => open(topic.id)} style={styles.topic}>
              <View style={styles.topicIcon}>
                <Ionicons name={ICONS[topic.id] ?? 'book-outline'} size={18} color="#C57AA5" />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicCopy}>{topic.summary}</Text>
                <Text style={styles.topicMeta}>{topic.eyebrow} · {topic.minutes}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C57AA5" />
            </Pressable>
          ))}

          <View style={styles.support}>
            <View style={styles.supportHead}>
              <Ionicons name="chatbubbles-outline" size={20} color="#7C6BCF" />
              <Text style={styles.supportTitle}>You don’t have to figure it out alone.</Text>
            </View>
            <Text style={styles.supportCopy}>
              Talk with a trusted adult, school nurse or healthcare professional if something worries you.
            </Text>
            <View style={styles.starter}>
              <Text style={styles.starterKicker}>NOT SURE HOW TO START?</Text>
              <Text style={styles.starterText}>“I have a question about my period. Can we talk?”</Text>
            </View>
            <Pressable onPress={() => open('help')}>
              <Text style={styles.link}>Tips for asking for help →</Text>
            </Pressable>
          </View>
          <View style={styles.care}>
            <Ionicons name="information-circle-outline" size={15} color="#786370" />
            <Text style={styles.careText}>
              Severe pain, very heavy bleeding or feeling faint? Seek medical help. These guides are for learning, not a diagnosis.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  hero: { backgroundColor: '#FCE7F3', borderRadius: 24, borderWidth: 1, borderColor: '#F1D9E1', padding: 16, gap: 14 },
  heroTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  kicker: { fontFamily: fonts.bodyBold, color: '#C57AA5', fontSize: 9, letterSpacing: 0.4 },
  title: { fontFamily: fonts.display, color: colors.ink, fontSize: 26 },
  lead: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 18 },
  heroRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  heroArt: { width: 96, height: 96, borderRadius: 20, backgroundColor: colors.white },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F1D9E1',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C57AA5' },
  chipText: { fontFamily: fonts.bodySemi, color: colors.ink, fontSize: 11 },
  feature: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#FFF4FB',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1D9E1',
    padding: 16,
  },
  featureTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 20, lineHeight: 24 },
  featureCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  featureArt: { width: 112, height: 142, borderRadius: 16 },
  link: { fontFamily: fonts.bodySemi, color: '#C57AA5', fontSize: 12 },
  section: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  topic: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#FFF8FC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1D9E1',
    padding: 13,
  },
  topicIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 13 },
  topicCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 15 },
  topicMeta: { fontFamily: fonts.body, color: '#C57AA5', fontSize: 10 },
  support: { backgroundColor: '#F4F1FF', borderRadius: 16, padding: 16, gap: 10 },
  supportHead: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  supportTitle: { flex: 1, fontFamily: fonts.display, color: colors.ink, fontSize: 18, lineHeight: 23 },
  supportCopy: { fontFamily: fonts.body, color: colors.ink, fontSize: 12, lineHeight: 18 },
  starter: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 11, gap: 5 },
  starterKicker: { fontFamily: fonts.bodyBold, color: '#7C6BCF', fontSize: 9 },
  starterText: { fontFamily: fonts.body, color: '#786370', fontSize: 12, lineHeight: 17 },
  care: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  careText: { flex: 1, fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
});
