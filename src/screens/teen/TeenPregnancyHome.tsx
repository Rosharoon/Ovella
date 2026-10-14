import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WeekIllustration } from '../../components/graphics';
import { useApp } from '../../context/AppContext';
import { daysUntilDue, getWeekGuide, pregnancyWeek, resolvedDueDate } from '../../data/pregnancyWeeks';
import { fonts } from '../../theme';
import { prettyDate, prettyTime, toISODate } from '../../utils/dates';
import { upcomingAppointment } from '../pregnancy/AppointmentsScreen';
import { TeenBrandBar } from './TeenChrome';

const WASH = ['#F7D6E2', '#E9B8C8', '#C78AAE'] as const;

function sizeName(size: string) {
  const stripped = size.replace(/^(a|an) /, '');
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

export function TeenPregnancyHome() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { pregnancy, appointments } = useApp();
  if (!pregnancy) return null;

  const today = toISODate(new Date());
  const week = pregnancyWeek(pregnancy);
  const guide = getWeekGuide(week);
  const due = resolvedDueDate(pregnancy);
  const weeksLeft = Math.max(0, Math.round(daysUntilDue(due) / 7));
  const progress = Math.min(1, week / 40);
  const trimester = guide.trimester === 1 ? 'First trimester' : guide.trimester === 2 ? 'Second trimester' : 'Third trimester';
  const visit = upcomingAppointment(appointments, today);
  const sizeLabel = sizeName(guide.size);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28 }}>
        <TeenBrandBar />
        <View style={styles.page}>
          <LinearGradient colors={WASH} locations={[0, 0.56, 1]} style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.heroTitle}>Pregnancy Overview</Text>
                <Text style={styles.heroCopy}>
                  Your care, one step at a time. You can change what you track whenever you want.
                </Text>
              </View>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>Week {week}</Text>
              </View>
            </View>
            <View style={styles.heroRow}>
              <View style={styles.glass}>
                <Text style={styles.glassLabel}>Timeline</Text>
                <Text style={styles.glassValue}>{week} wks</Text>
                <Text style={styles.glassHint}>{weeksLeft === 1 ? '1 week left' : `${weeksLeft} weeks left`}</Text>
              </View>
              <View style={[styles.glass, { flex: 1 }]}>
                <Text style={styles.glassLabel}>Baby size</Text>
                <Text style={styles.glassValue}>{sizeLabel}</Text>
                <Text style={styles.glassHint}>{guide.baby}</Text>
              </View>
            </View>
          </LinearGradient>

          <LinearGradient colors={WASH} locations={[0, 0.56, 1]} style={styles.progressCard}>
            <View style={styles.progressHead}>
              <View style={styles.trimester}>
                <Text style={styles.trimesterText}>{trimester}</Text>
              </View>
            </View>
            <Text style={styles.weeks}>{week === 1 ? '1 week' : `${week} weeks`}</Text>
            <Text style={styles.asOf}>{format(new Date(), 'EEEE, d MMMM yyyy')} · estimated</Text>
            <Text style={styles.due}>Estimated due date · {prettyDate(due)}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.max(8, progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressNote}>
              About {weeksLeft} {weeksLeft === 1 ? 'week' : 'weeks'} to the estimated due date. Your healthcare professional can confirm or update these estimates.
            </Text>
          </LinearGradient>

          <View style={styles.sectionHead}>
            <Text style={styles.section}>This week</Text>
            <Pressable onPress={() => navigation.navigate('Guide', { week })}>
              <Text style={styles.sectionLink}>Week {week} guide →</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => navigation.navigate('Guide', { week })} style={styles.weekCard}>
            <View style={styles.artWell}>
              <WeekIllustration week={week} size={72} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.weekTitle}>{guide.title}</Text>
              <Text style={styles.weekCopy}>
                {guide.baby} Around the size of {guide.size}.
              </Text>
              <Text style={styles.weekFine}>A general guide; development varies.</Text>
            </View>
          </Pressable>

          <View style={styles.sectionHead}>
            <Text style={styles.section}>A moment for you</Text>
            <Text style={styles.sectionLink}>Always optional</Text>
          </View>
          <View style={styles.prompt}>
            <View style={styles.promptHead}>
              <Ionicons name="heart-outline" size={18} color={'#B85A7A'} />
              <Text style={styles.promptTitle}>How are you feeling today?</Text>
            </View>
            <Text style={styles.promptCopy}>
              Notice your mood, symptoms, water and rest. There’s no right way to feel.
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Log')}>
            <LinearGradient colors={WASH} locations={[0, 0.56, 1]} style={styles.checkBtn}>
              <Ionicons name="add-circle-outline" size={18} color="#66294A" />
              <Text style={styles.checkText}>Daily Health Check-in</Text>
            </LinearGradient>
          </Pressable>

          <View style={styles.sectionHead}>
            <Text style={styles.section}>Next appointment</Text>
            <Pressable onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.sectionLink}>Care plan →</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => navigation.navigate('Appointments')} style={styles.visit}>
            {visit ? (
              <>
                <View style={styles.dateTile}>
                  <Text style={styles.dateMonth}>{format(parseISO(visit.date), 'MMM').toUpperCase()}</Text>
                  <Text style={styles.dateDay}>{format(parseISO(visit.date), 'd')}</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.visitTitle}>{visit.title}</Text>
                  <Text style={styles.visitWhen}>
                    {format(parseISO(visit.date), 'EEE, d MMM')}
                    {visit.time ? ` · ${prettyTime(visit.time)}` : ''}
                  </Text>
                  <Text style={styles.visitPlace}>{visit.place || 'Location not added'}</Text>
                </View>
              </>
            ) : (
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.visitTitle}>No visit yet</Text>
                <Text style={styles.visitWhen}>Add a date, time, and place when you have one.</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color={'#B85A7A'} />
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Article', { id: 'pregnancy' })} style={styles.support}>
            <View style={styles.supportHead}>
              <Ionicons name="leaf-outline" size={18} color="#52766E" />
              <Text style={styles.supportTitle}>Pregnancy & Support</Text>
              <Ionicons name="arrow-forward" size={15} color="#52766E" />
            </View>
            <Text style={styles.supportCopy}>
              Balanced information about your options, privacy and finding support. Your choices still matter.
            </Text>
          </Pressable>

          <View style={styles.urgent}>
            <Ionicons name="alert-circle-outline" size={18} color={'#B85A7A'} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.urgentTitle}>Severe pain, heavy bleeding or fainting?</Text>
              <Text style={styles.urgentCopy}>
                Seek urgent medical care now. Don’t wait for a check-in or appointment.
              </Text>
            </View>
          </View>
          <Text style={styles.footer}>
            Ovella helps you track, not diagnose. Ask a qualified healthcare professional for personal care advice.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7FB' },
  page: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  hero: { borderRadius: 24, padding: 16, gap: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroTitle: { fontFamily: fonts.display, color: '#66294A', fontSize: 26, lineHeight: 31 },
  heroCopy: { fontFamily: fonts.body, color: '#66294A', fontSize: 13, lineHeight: 19 },
  weekBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  weekBadgeText: { fontFamily: fonts.bodyBold, color: '#66294A', fontSize: 11 },
  heroRow: { flexDirection: 'row', gap: 12 },
  glass: {
    width: 118,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 12,
    gap: 8,
  },
  glassLabel: { fontFamily: fonts.bodyBold, color: '#66294A', fontSize: 11 },
  glassValue: { fontFamily: fonts.display, color: '#66294A', fontSize: 22 },
  glassHint: { fontFamily: fonts.body, color: '#66294A', fontSize: 10, lineHeight: 14 },
  progressCard: { borderRadius: 22, padding: 16, gap: 8 },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between' },
  trimester: { backgroundColor: '#FCE7F3', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  trimesterText: { fontFamily: fonts.bodyBold, color: '#B85A7A', fontSize: 11 },
  weeks: { fontFamily: fonts.display, color: '#66294A', fontSize: 30 },
  asOf: { fontFamily: fonts.body, color: '#66294A', fontSize: 11 },
  due: { fontFamily: fonts.bodySemi, color: '#66294A', fontSize: 13 },
  track: { height: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 7, borderRadius: 999, backgroundColor: '#F7E2DC' },
  progressNote: { fontFamily: fonts.body, color: '#66294A', fontSize: 11, lineHeight: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontFamily: fonts.bodyBold, color: '#B85A7A', fontSize: 15 },
  sectionLink: { fontFamily: fonts.bodySemi, color: '#B85A7A', fontSize: 11 },
  weekCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#FFF8FC',
    borderWidth: 1,
    borderColor: '#F1D9E1',
    borderRadius: 16,
    padding: 14,
  },
  artWell: {
    width: 80,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#FFF8F1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  weekTitle: { fontFamily: fonts.display, color: '#B85A7A', fontSize: 18, lineHeight: 22 },
  weekCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  weekFine: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  prompt: {
    backgroundColor: '#FFF8FC',
    borderWidth: 1,
    borderColor: '#F1D9E1',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  promptHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  promptTitle: { fontFamily: fonts.bodyBold, color: '#B85A7A', fontSize: 13 },
  promptCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  checkBtn: {
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  checkText: { fontFamily: fonts.bodyBold, color: '#66294A', fontSize: 13 },
  visit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF8FC',
    borderWidth: 1,
    borderColor: '#F1D9E1',
    borderRadius: 16,
    padding: 13,
  },
  dateTile: {
    width: 48,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontFamily: fonts.bodyBold, color: '#B85A7A', fontSize: 10 },
  dateDay: { fontFamily: fonts.display, color: '#B85A7A', fontSize: 20 },
  visitTitle: { fontFamily: fonts.bodyBold, color: '#B85A7A', fontSize: 13 },
  visitWhen: { fontFamily: fonts.body, color: '#786370', fontSize: 11 },
  visitPlace: { fontFamily: fonts.body, color: '#B85A7A', fontSize: 10 },
  support: { backgroundColor: '#EAF6F1', borderRadius: 16, padding: 14, gap: 5 },
  supportHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  supportTitle: { flex: 1, fontFamily: fonts.display, color: '#52766E', fontSize: 17 },
  supportCopy: { fontFamily: fonts.body, color: '#52766E', fontSize: 11, lineHeight: 16 },
  urgent: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#FFF8FC',
    borderWidth: 1,
    borderColor: '#F1D9E1',
    borderRadius: 12,
    padding: 12,
  },
  urgentTitle: { fontFamily: fonts.bodyBold, color: '#B85A7A', fontSize: 12 },
  urgentCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  footer: { fontFamily: fonts.body, color: '#A35D7A', fontSize: 10, lineHeight: 14, textAlign: 'center' },
});
