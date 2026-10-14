import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useApp } from '../../context/AppContext';
import { fonts } from '../../theme';
import { bodyArt } from './bodyArt';
import { TeenBrandBar } from './TeenChrome';

function Art({ name }: { name: keyof typeof bodyArt }) {
  const art = bodyArt[name];
  return <SvgXml xml={art.xml} width={art.width} height={art.height} />;
}

const PACE = [
  { icon: 'pace' as const, title: 'Your pace', copy: 'Changes happen when your body is ready.' },
  { icon: 'rush' as const, title: 'No rush', copy: 'Take time to notice what is normal for you.' },
  { icon: 'ask' as const, title: 'Ask anytime', copy: 'Questions are always okay.' },
];

const FLAGS = [
  { icon: 'ask' as const, title: 'Itching or pain', copy: 'Tell a trusted adult.' },
  { icon: 'rush' as const, title: 'Strong smell', copy: 'Check in with a pro.' },
  { icon: 'pace' as const, title: 'Worried', copy: 'Ask someone you trust.' },
];

export function TeenChangingBodyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useApp();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`ovella.body-note.${user.id}`).then((saved) => {
      if (saved) setNote(saved);
    });
  }, [user]);

  const saveNote = (value: string) => {
    setNote(value);
    if (user) AsyncStorage.setItem(`ovella.body-note.${user.id}`, value);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }}>
        <TeenBrandBar />
        <View style={styles.page}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityRole="button">
            <Ionicons name="arrow-back" size={16} color="#C94C7B" />
            <Text style={styles.backText}>Back to Learn & Support</Text>
          </Pressable>

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <View style={styles.eyebrow}>
                <Text style={styles.eyebrowText}>PUBERTY 101</Text>
              </View>
              <Text style={styles.title}>Your changing body</Text>
              <Text style={styles.summary}>Puberty, discharge and your own pace.</Text>
              <View style={styles.chips}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>5 min read</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>Honest, not scary</Text>
                </View>
              </View>
            </View>
            <Art name="hero" />
          </View>

          <View style={styles.intro}>
            <View style={styles.introHead}>
              <Art name="spark" />
              <Text style={styles.introTitle}>There’s no single timeline.</Text>
            </View>
            <Text style={styles.ink}>
              Everyone develops at their own pace. Changes may happen before or after your friends’ changes. You don’t need to compare your body with anyone else’s.
            </Text>
            <View style={styles.trio}>
              {PACE.map((item) => (
                <View key={item.title} style={styles.mini}>
                  <Art name={item.icon} />
                  <Text style={styles.miniTitle}>{item.title}</Text>
                  <Text style={styles.miniCopy}>{item.copy}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.sectionHead}>
              <Art name="puberty" />
              <Text style={styles.section}>What puberty can bring</Text>
            </View>
            <Text style={styles.ink}>Hormones are chemical messengers that help your body grow and change.</Text>
            <View style={styles.change}>
              <Art name="physical" />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.changeTitle}>Physical changes</Text>
                <Text style={styles.muted}>
                  Growth spurts, breast or chest development, body hair, oilier skin and more sweat can happen gradually.
                </Text>
              </View>
            </View>
            <View style={styles.change}>
              <Art name="feelings" />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.changeTitle}>Feelings and periods</Text>
                <Text style={styles.muted}>
                  Emotions may feel stronger. Periods may begin, and can be irregular in the first few years.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.sectionHead}>
              <Art name="discharge" />
              <Text style={styles.section}>Understanding discharge</Text>
            </View>
            <Text style={styles.ink}>
              Vaginal discharge is fluid that helps keep the vagina clean and moist. You might notice it in your underwear, even before your first period.
            </Text>
            <View style={styles.clear}>
              <View style={styles.clearHead}>
                <Art name="clear" />
                <Text style={styles.clearTitle}>Clear or white can be normal</Text>
              </View>
              <Text style={styles.ink}>
                Discharge without a strong smell can be normal. The amount and texture can change through your cycle.
              </Text>
            </View>
            <View style={styles.care}>
              <View style={styles.careHead}>
                <Art name="drops" />
                <Text style={styles.changeTitle}>Keep care simple</Text>
              </View>
              <Text style={styles.ink}>
                Gently wash the vulva (the outside area) with water. The vagina cleans itself inside, so avoid douching and scented intimate products. Change underwear daily and when damp.
              </Text>
              <View style={styles.pair}>
                <View style={styles.tip}>
                  <Art name="rush" />
                  <Text style={styles.miniTitle}>Wash outside only</Text>
                  <Text style={styles.miniCopy}>Water is enough for the vulva.</Text>
                </View>
                <View style={styles.tip}>
                  <Art name="ask" />
                  <Text style={styles.miniTitle}>Change when damp</Text>
                  <Text style={styles.miniCopy}>Fresh underwear helps stay comfortable.</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.sectionHead}>
              <Art name="help" />
              <Text style={styles.section}>When to ask for help</Text>
            </View>
            <Text style={styles.ink}>
              Speak with a healthcare professional if you notice itching, pain, a strong or unusual smell, or a noticeable change in discharge. You can also ask about any body change that worries you.
            </Text>
            <View style={styles.trio}>
              {FLAGS.map((item) => (
                <View key={item.title} style={styles.mini}>
                  <Art name={item.icon} />
                  <Text style={styles.miniTitle}>{item.title}</Text>
                  <Text style={styles.miniCopy}>{item.copy}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.prompt}>
            <View style={styles.promptHead}>
              <Text style={styles.promptTitle}>A question to take with you</Text>
              <Text style={styles.optional}>Optional</Text>
            </View>
            <Text style={styles.muted}>Jot down what you’ve noticed, when it started and what you’d like to ask.</Text>
            <TextInput
              value={note}
              onChangeText={saveNote}
              placeholder="I’ve noticed… / I’d like to understand…"
              placeholderTextColor="#786370"
              multiline
              style={styles.note}
            />
          </View>

          <View style={styles.support}>
            <View style={styles.supportHead}>
              <Art name="leaf" />
              <Text style={styles.supportTitle}>You don’t have to figure it out alone.</Text>
            </View>
            <Text style={styles.ink}>
              Choose an adult you trust and feel safe with, a school nurse or a healthcare professional. They can help you find support and talk through your questions.
            </Text>
            <View style={styles.starter}>
              <Text style={styles.starterKicker}>NOT SURE HOW TO START?</Text>
              <Text style={styles.starterCopy}>
                “I’ve noticed a change in my body. Can you help me talk to a health professional?”
              </Text>
            </View>
          </View>

          <View style={styles.caution}>
            <Art name="info" />
            <Text style={styles.cautionText}>
              Severe pain, very heavy bleeding or feeling faint? Seek medical help. This guide is for learning, not a diagnosis.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { paddingHorizontal: 20, paddingTop: 12, gap: 20 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28 },
  backText: { fontFamily: fonts.bodySemi, color: '#C94C7B', fontSize: 12 },
  hero: {
    backgroundColor: '#FCE7F3',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroCopy: { flex: 1, gap: 10 },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eyebrowText: { fontFamily: fonts.bodyBold, color: '#C94C7B', fontSize: 10 },
  title: { fontFamily: fonts.display, color: '#24151D', fontSize: 28, lineHeight: 32 },
  summary: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.bodySemi, color: '#C94C7B', fontSize: 11 },
  intro: {
    backgroundColor: '#FFF1F8',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  introHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  introTitle: { flex: 1, fontFamily: fonts.display, color: '#24151D', fontSize: 18 },
  ink: { fontFamily: fonts.body, color: '#24151D', fontSize: 13, lineHeight: 20 },
  muted: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 20 },
  trio: { flexDirection: 'row', gap: 8 },
  mini: {
    flex: 1,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  miniTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 12 },
  miniCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 15 },
  block: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  section: { flex: 1, fontFamily: fonts.display, color: '#24151D', fontSize: 19 },
  change: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 16,
    padding: 12,
  },
  changeTitle: { fontFamily: fonts.bodySemi, color: '#24151D', fontSize: 13 },
  clear: { backgroundColor: '#FCE7F3', borderWidth: 1, borderColor: '#F0D6DF', borderRadius: 16, padding: 14, gap: 10 },
  clearHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearTitle: { flex: 1, fontFamily: fonts.bodyBold, color: '#C94C7B', fontSize: 13 },
  care: {
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  careHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pair: { flexDirection: 'row', gap: 8 },
  tip: {
    flex: 1,
    backgroundColor: '#FFF1F8',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  prompt: {
    backgroundColor: '#FFF1F8',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  promptHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promptTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 14 },
  optional: { fontFamily: fonts.body, color: '#786370', fontSize: 10 },
  note: {
    minHeight: 96,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D6DF',
    borderRadius: 12,
    padding: 12,
    fontFamily: fonts.body,
    color: '#24151D',
    fontSize: 12,
    lineHeight: 17,
    textAlignVertical: 'top',
  },
  support: {
    backgroundColor: '#EAF7F0',
    borderWidth: 1,
    borderColor: '#D7E7DD',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  supportHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  supportTitle: { flex: 1, fontFamily: fonts.display, color: '#24151D', fontSize: 18, lineHeight: 23 },
  starter: {
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#D7E7DD',
    borderRadius: 12,
    padding: 11,
    gap: 5,
  },
  starterKicker: { fontFamily: fonts.bodyBold, color: '#52766E', fontSize: 9 },
  starterCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 12, lineHeight: 17 },
  caution: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cautionText: { flex: 1, fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
});
