import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { fonts } from '../../theme';
import { supportArt } from './supportArt';
import { TeenBrandBar } from './TeenChrome';

function Art({ name }: { name: keyof typeof supportArt }) {
  const art = supportArt[name];
  return <SvgXml xml={art.xml} width={art.width} height={art.height} />;
}

const HERO = [
  { name: 'find' as const, label: 'Find a healthcare professional' },
  { name: 'privacy' as const, label: 'Ask about privacy first' },
  { name: 'questions' as const, label: 'Bring questions and support' },
];

const OPTIONS = [
  {
    title: 'Continue the pregnancy and parent',
    copy: 'Ask about pregnancy care and support for your health, school and everyday needs.',
  },
  {
    title: 'Continue the pregnancy and consider adoption',
    copy: 'Ask about pregnancy care and how adoption works, including your rights and support.',
  },
  {
    title: 'End the pregnancy (abortion)',
    copy: 'Ask about available methods, what to expect and follow-up care.',
  },
];

const PREP = [
  'Note your last period date, test result and any symptoms, if you know them.',
  'List medicines you take and questions about your options, costs and privacy.',
  'Ask if you can speak to the clinician alone. Bring someone supportive if you want.',
];

function previousRoute(navigation: { getState: () => { index: number; routes: { name: string }[] } }) {
  const state = navigation.getState();
  return state.routes[state.index - 1];
}

export function TeenPregnancySupportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const previous = previousRoute(navigation);
  const backLabel =
    previous?.name === 'Appointments'
      ? 'Appointments & Care Plan'
      : previous?.name === 'TeenTabs'
        ? 'Back'
        : 'Learn & Support';

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('TeenTabs', { screen: 'Today' });
  };

  const openCarePlan = () => navigation.push('Appointments');
  const scrollRef = useRef<ScrollView>(null);
  const pageTop = useRef(0);
  const privacyY = useRef(0);
  const prepY = useRef(0);
  const scrollTo = (y: number) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });

  return (
    <View style={styles.root}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }}>
        <TeenBrandBar />
        <View style={styles.page} onLayout={(event) => { pageTop.current = event.nativeEvent.layout.y; }}>
          <Pressable onPress={goBack} hitSlop={12} style={styles.back} accessibilityRole="button">
            <Ionicons name="chevron-back" size={14} color="#C78AAE" />
            <Text style={styles.backText}>{backLabel}</Text>
          </Pressable>
          <Text style={styles.title}>Pregnancy & Support</Text>
          <Text style={styles.lead}>
            Think you might be pregnant, or have a positive test? Take it one step at a time.
          </Text>

          <View style={styles.hero}>
            <View style={styles.artWell}>
              <View style={[styles.dot, { left: 17, top: 17 }]}>
                <Art name="e1" />
              </View>
              <View style={[styles.dot, { left: 33, top: 33 }]}>
                <Art name="e2" />
              </View>
              <View style={[styles.dot, { left: 51, top: 51 }]}>
                <Art name="e3" />
              </View>
              <View style={[styles.dot, { left: 11, top: 71 }]}>
                <Art name="e4" />
              </View>
              <View style={[styles.dot, { left: 75, top: 71 }]}>
                <Art name="e5" />
              </View>
            </View>
            <View style={styles.heroCards}>
              {HERO.map((item) => {
                const card = (
                  <>
                    <Art name={item.name} />
                    <Text style={styles.heroLabel}>{item.label}</Text>
                  </>
                );
                if (item.name !== 'find') {
                  const target = item.name === 'privacy' ? privacyY : prepY;
                  return (
                    <Pressable
                      key={item.label}
                      style={styles.heroCard}
                      accessibilityRole="button"
                      onPress={() => scrollTo(pageTop.current + target.current)}
                    >
                      {card}
                    </Pressable>
                  );
                }
                return (
                  <Pressable key={item.label} onPress={openCarePlan} style={styles.heroCard} accessibilityRole="button">
                    {card}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.reassure}>
            <View style={styles.heartWell}>
              <Art name="heart" />
            </View>
            <Text style={styles.reassureTitle}>You deserve care, not judgment.</Text>
          </View>

          <View style={styles.urgent}>
            <View style={styles.alertWell}>
              <Art name="alert" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.urgentTitle}>Severe pain, heavy bleeding or fainting?</Text>
              <Text style={styles.urgentCopy}>
                Get urgent medical care now at an emergency department or call local emergency services.
              </Text>
            </View>
          </View>

          <Text style={styles.section}>A helpful next step</Text>
          <View style={styles.step}>
            <Art name="find" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.stepTitle}>Not sure yet?</Text>
              <Text style={styles.stepCopy}>
                Use a pregnancy test and follow its instructions. If it’s negative but your period hasn’t come, test again or ask a healthcare professional.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Art name="find" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.stepTitle}>Have a positive test?</Text>
              <Text style={styles.stepCopy}>
                A qualified healthcare professional can confirm the pregnancy, answer questions and discuss your options. Arrange an appointment soon.
              </Text>
            </View>
          </View>
          <Pressable onPress={openCarePlan}>
            <LinearGradient colors={['#C78AAE', '#A35D7A', '#6E3654']} locations={[0, 0.56, 1]} style={styles.findBtn}>
              <Art name="scope" />
              <Text style={styles.findText}>Find a healthcare professional</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.note}>
            Look for a licensed clinician or regulated clinic offering pregnancy care and options counseling.
          </Text>

          <View style={styles.privacy} onLayout={(event) => { privacyY.current = event.nativeEvent.layout.y; }}>
            <Art name="shield" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.privacyTitle}>Ask about privacy before you share</Text>
              <Text style={styles.stepCopy}>
                Confidentiality rules vary by location and service. Ask what stays private, what may be shared and whether a parent’s consent is needed.
              </Text>
            </View>
          </View>

          <Text style={styles.section}>Understanding your options</Text>
          <Text style={styles.lead}>
            You can ask for balanced information about every option, without pressure to choose one.
          </Text>
          <View style={styles.options}>
            {OPTIONS.map((item, index) => (
              <View key={item.title}>
                {index > 0 ? <View style={styles.rule} /> : null}
                <View style={styles.option}>
                  <Art name="option" />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.stepTitle}>{item.title}</Text>
                    <Text style={styles.stepCopy}>{item.copy}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.note}>
            Availability, laws and time limits vary by location and how far along a pregnancy is. A qualified professional can explain what applies to you.
          </Text>

          <Text style={styles.section} onLayout={(event) => { prepY.current = event.nativeEvent.layout.y; }}>
            Before your appointment
          </Text>
          {PREP.map((line) => (
            <View key={line} style={styles.prep}>
              <Art name="check" />
              <Text style={styles.prepText}>{line}</Text>
            </View>
          ))}
          <Text style={styles.note}>It’s okay if you don’t have all this information.</Text>

          <View style={styles.support}>
            <View style={styles.supportHead}>
              <Art name="chat" />
              <Text style={styles.supportTitle}>Support from someone you trust</Text>
            </View>
            <Text style={styles.supportCopy}>
              If it feels safe, a trusted adult can help you get care or come with you. This could be a relative, teacher or school nurse—not necessarily a parent.
            </Text>
            <View style={styles.starter}>
              <Text style={styles.starterKicker}>NOT SURE HOW TO START?</Text>
              <Text style={styles.starterCopy}>
                “I think I might be pregnant. I need someone to listen and help me get care.”
              </Text>
            </View>
            <Text style={styles.supportFine}>
              If telling family feels unsafe, ask a healthcare professional about safer ways to get support.
            </Text>
          </View>
          <Text style={styles.footer}>
            Ovella helps you learn and find a next step. This guide doesn’t replace medical advice or a diagnosis.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.bodySemi, color: '#C78AAE', fontSize: 11 },
  title: { fontFamily: fonts.display, color: '#24151D', fontSize: 26, marginTop: 4 },
  lead: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  hero: { flexDirection: 'row', gap: 12, backgroundColor: '#FCE7F3', borderRadius: 22, padding: 12, marginTop: 4 },
  artWell: {
    width: 96,
    alignSelf: 'stretch',
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    borderRadius: 18,
    overflow: 'hidden',
  },
  dot: { position: 'absolute' },
  heroCards: { flex: 1, gap: 10 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    borderRadius: 16,
    padding: 10,
  },
  heroLabel: { flex: 1, fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 12, lineHeight: 16 },
  reassure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FCE7F3',
    borderRadius: 22,
    padding: 14,
    marginTop: 8,
  },
  heartWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reassureTitle: { flex: 1, fontFamily: fonts.display, color: '#24151D', fontSize: 18 },
  urgent: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    borderRadius: 16,
    padding: 12,
  },
  alertWell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 13 },
  urgentCopy: { fontFamily: fonts.body, color: '#24151D', fontSize: 11, lineHeight: 16 },
  section: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 15, marginTop: 8 },
  step: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    borderRadius: 16,
    padding: 12,
  },
  stepTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 13 },
  stepCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  findBtn: {
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 4,
  },
  findText: { fontFamily: fonts.bodyBold, color: '#FFFFFF', fontSize: 13 },
  note: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  privacy: { flexDirection: 'row', gap: 8, padding: 12 },
  privacyTitle: { fontFamily: fonts.bodyBold, color: '#24151D', fontSize: 12 },
  options: {
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  option: { flexDirection: 'row', gap: 10 },
  rule: { height: 1, backgroundColor: '#F0D8E1', marginBottom: 12 },
  prep: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#FFF7FB',
    borderWidth: 1,
    borderColor: '#F0D8E1',
    borderRadius: 16,
    padding: 12,
  },
  prepText: { flex: 1, fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  support: { backgroundColor: '#DCE8E3', borderRadius: 16, padding: 16, gap: 10, marginTop: 8 },
  supportHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  supportTitle: { flex: 1, fontFamily: fonts.display, color: '#24151D', fontSize: 18, lineHeight: 23 },
  supportCopy: { fontFamily: fonts.body, color: '#24151D', fontSize: 13, lineHeight: 19 },
  starter: { backgroundColor: '#FFFCFD', borderRadius: 12, padding: 11, gap: 5 },
  starterKicker: { fontFamily: fonts.bodyBold, color: '#52766E', fontSize: 9 },
  starterCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  supportFine: { fontFamily: fonts.body, color: '#24151D', fontSize: 11, lineHeight: 16 },
  footer: { fontFamily: fonts.body, color: '#786370', fontSize: 10, lineHeight: 14, textAlign: 'center', marginTop: 8 },
});
