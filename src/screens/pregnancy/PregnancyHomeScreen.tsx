import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { SymptomCard } from '../../components/SymptomCard';
import { WeekIllustration } from '../../components/graphics';
import { useApp } from '../../context/AppContext';
import { daysUntilDue, getWeekGuide, pregnancyWeek, resolvedDueDate } from '../../data/pregnancyWeeks';
import { colors, fonts, gradient } from '../../theme';
import { fromISODate, toISODate } from '../../utils/dates';
import { reminderAlert } from '../../utils/reminders';
import { appointmentSummary, upcomingAppointment } from './AppointmentsScreen';
import { LinearGradient } from 'expo-linear-gradient';

const TRIMESTER = ['First trimester', 'Second trimester', 'Third trimester'] as const;

export function PregnancyHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { pregnancy, appointments, saveAppointment, selectedDate } = useApp();
  if (!pregnancy) return null;
  const nextVisit = upcomingAppointment(appointments);
  const toggleReminder = async () => {
    if (!nextVisit) return;
    const result = await saveAppointment({ ...nextVisit, remind: !nextVisit.remind });
    const notice = reminderAlert(result, nextVisit.date, nextVisit.reminderTime);
    if (notice) Alert.alert(notice.title, notice.message);
  };

  const week = pregnancyWeek(pregnancy);
  const guide = getWeekGuide(week);
  const dueDate = resolvedDueDate(pregnancy);
  const days = daysUntilDue(dueDate);
  const weeksLeft = Math.max(0, Math.round(days / 7));
  const progress = Math.min(1, Math.max(0, week / 40));
  const due = format(fromISODate(dueDate), 'd MMM yyyy');

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 28, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.date}>{format(new Date(), 'EEEE, d MMMM')}</Text>
            <BrandMark height={28} color={colors.brand} core={colors.rose} />
          </View>
          <Pressable
            onPress={() => navigation.navigate('Appointments')}
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel="Appointment reminders"
          >
            <Ionicons name="notifications-outline" size={19} color={colors.rose} />
          </Pressable>
        </View>

        <LinearGradient
          colors={[...gradient.colors]}
          locations={[...gradient.locations]}
          style={styles.progress}
        >
          <View style={styles.ambient} />
          <View style={styles.progressHead}>
            <View style={{ gap: 3, flex: 1 }}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{TRIMESTER[guide.trimester - 1]}</Text>
              </View>
              <Text style={styles.weeks}>{week === 1 ? '1 week' : `${week} weeks`}</Text>
              <Text style={styles.due}>
                {weeksLeft} weeks to go · Due {due}
              </Text>
            </View>
            <View style={styles.percent}>
              <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.sectionHead}>
          <Text style={styles.section}>This week</Text>
          <Pressable onPress={() => navigation.navigate('Guide')}>
            <Text style={styles.link}>Week {week} guide</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => navigation.navigate('Guide')} style={styles.devCard}>
          <View style={styles.art}>
            <WeekIllustration key={week} week={week} size={108} />
          </View>
          <View style={styles.devCopy}>
            <Text style={styles.devTitle}>{guide.title}</Text>
            <Text style={styles.devBody}>{guide.baby}</Text>
            <View style={styles.readRow}>
              <Text style={styles.link}>Read the week {week} guide</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.rose} />
            </View>
          </View>
        </Pressable>

        <SymptomCard date={selectedDate} />

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Next appointment</Text>
          <Pressable onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.link}>View all</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => navigation.navigate('Appointments')} style={styles.appt}>
          <View style={styles.dateTile}>
            {nextVisit ? (
              <>
                <Text style={styles.dateMonth}>{format(fromISODate(nextVisit.date), 'MMM')}</Text>
                <Text style={styles.dateDay}>{format(fromISODate(nextVisit.date), 'd')}</Text>
              </>
            ) : (
              <Ionicons name="calendar-outline" size={20} color={colors.rose} />
            )}
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.apptTitle}>{nextVisit ? nextVisit.title : 'No visit yet'}</Text>
            <Text style={styles.apptMeta}>
              {nextVisit
                ? appointmentSummary(nextVisit, toISODate(new Date()))
                : 'Tap to add your next visit'}
            </Text>
          </View>
          {nextVisit ? (
            <Pressable
              onPress={toggleReminder}
              style={styles.pin}
              accessibilityRole="button"
              accessibilityLabel={nextVisit.remind ? 'Turn reminder off' : 'Remind me'}
            >
              <Ionicons
                name={nextVisit.remind ? 'notifications' : 'notifications-outline'}
                size={16}
                color={colors.rose}
              />
            </Pressable>
          ) : (
            <View style={styles.pin}>
              <Ionicons name="add" size={16} color={colors.rose} />
            </View>
          )}
        </Pressable>

        <View style={styles.sectionHead}>
          <Text style={styles.section}>Health insights</Text>
          <Pressable onPress={() => navigation.navigate('Insights')}>
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.insights}>
          <InsightRow
            icon="water-outline"
            title="Hydration check-in"
            body="A steady sip through the day supports this stage."
            onPress={() => navigation.navigate('Hydration')}
          />
          <View style={styles.divider} />
          <InsightRow
            icon="pulse-outline"
            title="Know when to reach out"
            body="Review guidance for changes in movement or symptoms."
            onPress={() => navigation.navigate('Guide', { week })}
          />
        </View>
        <Text style={styles.disclaimer}>Ovella supports your care — it does not replace medical advice.</Text>
      </ScrollView>
    </View>
  );
}

function InsightRow({
  icon,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.insightIcon}>
        <Ionicons name={icon} size={17} color={colors.rose} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={styles.insightBody}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </>
  );
  if (!onPress) return <View style={styles.insight}>{content}</View>;
  return (
    <Pressable onPress={onPress} style={styles.insight} accessibilityRole="button" accessibilityLabel={title}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleGroup: { gap: 3 },
  date: { fontFamily: fonts.bodySemi, color: '#8A6F7B', fontSize: 12 },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    marginTop: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 13,
    overflow: 'hidden',
  },
  ambient: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(244,221,226,0.12)',
  },
  progressHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.petal,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: { fontFamily: fonts.bodyBold, color: '#8F5B73', fontSize: 12 },
  weeks: { fontFamily: fonts.display, color: colors.white, fontSize: 30 },
  due: { fontFamily: fonts.body, color: '#FCE8F2', fontSize: 12 },
  percent: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: { fontFamily: fonts.body, color: colors.white, fontSize: 13 },
  track: { height: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
  fill: { height: 7, borderRadius: 999, backgroundColor: colors.peach },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  section: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  link: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 12 },
  devCard: {
    marginTop: 8,
    height: 144,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  art: { width: 116, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8F1' },
  devCopy: { flex: 1, padding: 14, gap: 7, justifyContent: 'center' },
  devTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 18, lineHeight: 22 },
  devBody: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12, lineHeight: 17 },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  appt: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateTile: {
    width: 48,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.petal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontFamily: fonts.bodyBold, color: '#8F5B73', fontSize: 10, textTransform: 'uppercase' },
  dateDay: { fontFamily: fonts.display, color: colors.ink, fontSize: 20 },
  apptTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 13 },
  apptMeta: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12 },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insights: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    padding: 12,
    gap: 10,
  },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.petal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 12 },
  insightBody: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 10, lineHeight: 14 },
  divider: { height: 1, backgroundColor: colors.line },
  disclaimer: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.body,
    color: colors.muted,
    fontSize: 10,
  },
});
