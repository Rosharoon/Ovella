import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { PlaceField } from '../../components/PlaceField';
import { DatePickerModal, PrimaryButton, TextField } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { pregnancyWeek } from '../../data/pregnancyWeeks';
import { colors, fonts } from '../../theme';
import { Appointment } from '../../types';
import { CarePlan, CARE_TASKS, loadCarePlan, saveCarePlan } from '../../utils/carePlan';
import { prettyTime, toISODate } from '../../utils/dates';
import { DEFAULT_VISIT_TIME, reminderAlert } from '../../utils/reminders';
import { TeenBrandBar } from './TeenChrome';

const HERO = `<svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="87" height="87" rx="19.5" fill="#FFFCFD"/><rect x="0.5" y="0.5" width="87" height="87" rx="19.5" stroke="#F0D7E1"/><circle cx="44" cy="44" r="36" fill="#FCE7F3"/><circle cx="44" cy="44" r="26" fill="#FFFCFD"/><circle cx="44" cy="44" r="16" fill="#FCE7F3"/><circle cx="44" cy="44" r="6" fill="#C78AAE"/><circle cx="57" cy="57" r="5" fill="#ED5C7A"/><circle cx="22" cy="62" r="4" fill="#ED5C7A"/><circle cx="62" cy="22" r="4" fill="#6E3654"/></svg>`;

const WASH = ['#F7C9D8', '#E7A3C8', '#C78AAE'] as const;

function clockToDate(clock: string) {
  const [hour, minute] = clock.split(':').map(Number);
  const next = new Date();
  next.setHours(Number.isFinite(hour) ? hour : 9, Number.isFinite(minute) ? minute : 0, 0, 0);
  return next;
}

function dateToClock(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

export function TeenCarePlanScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, pregnancy, appointments, saveAppointment, removeAppointment } = useApp();
  const today = toISODate(new Date());
  const [plan, setPlan] = useState<CarePlan | null>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState('');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(DEFAULT_VISIT_TIME);
  const [picker, setPicker] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadCarePlan(user.id).then(setPlan);
  }, [user]);

  const upcoming = appointments
    .filter((item) => item.date >= today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.time || DEFAULT_VISIT_TIME).localeCompare(b.time || DEFAULT_VISIT_TIME) ||
        a.title.localeCompare(b.title),
    );
  const week = pregnancy ? pregnancyWeek(pregnancy) : null;
  const ready = plan ? CARE_TASKS.filter((task) => plan.checks.includes(task.id)).length : 0;

  const openNew = () => {
    setEditing('new');
    setTitle('');
    setPlace('');
    setLatitude(undefined);
    setLongitude(undefined);
    setDate(today);
    setTime('10:30');
  };

  const openEdit = (item: Appointment) => {
    setEditing(item.id);
    setTitle(item.title);
    setPlace(item.place);
    setLatitude(item.latitude);
    setLongitude(item.longitude);
    setDate(item.date);
    setTime(item.time || DEFAULT_VISIT_TIME);
  };

  const visitFlags = (current: CarePlan) => ({
    remind: current.visitReminder,
    reminderTime: '18:00',
    remindOffsetDays: current.visitReminder ? 1 : undefined,
    discreet: !current.showDetails,
  });

  const saveVisit = async () => {
    if (!plan || !title.trim()) return;
    const result = await saveAppointment({
      id: editing && editing !== 'new' ? editing : Date.now().toString(),
      title: title.trim(),
      place: place.trim(),
      latitude: place.trim() ? latitude : undefined,
      longitude: place.trim() ? longitude : undefined,
      date,
      time,
      ...visitFlags(plan),
    });
    const notice = reminderAlert(result, date, '18:00');
    if (notice) Alert.alert(notice.title, notice.message);
    setEditing(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const applyReminders = async (next: CarePlan) => {
    await Promise.all(appointments.map((item) => saveAppointment({ ...item, ...visitFlags(next) })));
  };

  const savePlan = async () => {
    if (!user || !plan) return;
    await saveCarePlan(user.id, plan);
    await applyReminders(plan);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!plan) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }}>
        <TeenBrandBar />
        <View style={styles.page}>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>YOUR CARE PLAN</Text>
                <Text style={styles.title}>Appointments & Care Plan</Text>
                <Text style={styles.lead}>
                  Keep your next steps together. Your healthcare professional can help shape your plan.
                </Text>
              </View>
              {week ? (
                <View style={styles.weekBadge}>
                  <Text style={styles.weekBadgeText}>WEEK {week}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.heroRow}>
              <SvgXml xml={HERO} width={88} height={88} />
              <View style={styles.heroDetails}>
                <Pressable
                  onPress={() => {
                    const state = navigation.getState();
                    const previous = state.routes[state.index - 1];
                    if (previous?.name === 'Article') navigation.goBack();
                    else navigation.navigate('TeenTabs', { screen: 'Today' });
                  }}
                  hitSlop={12}
                  style={styles.backLink}
                  accessibilityRole="button"
                >
                  <Ionicons name="chevron-back" size={14} color="#C78AAE" />
                  <Text style={styles.backText}>
                    {navigation.getState().routes[navigation.getState().index - 1]?.name === 'Article'
                      ? 'Pregnancy & Support'
                      : 'Pregnancy Overview'}
                  </Text>
                </Pressable>
                <View style={styles.note}>
                  <Ionicons name="calendar-outline" size={16} color="#C78AAE" />
                  <Text style={styles.noteText}>
                    {week ? `Week ${week}` : 'Your plan'} · estimated on {format(new Date(), 'd MMM yyyy')}
                  </Text>
                </View>
                <View style={styles.note}>
                  <Ionicons name="information-circle-outline" size={16} color="#C78AAE" />
                  <Text style={styles.noteText}>
                    Your visits, not bookings. Confirm dates and care needs with your care team.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.section}>Upcoming visits</Text>
            <Pressable onPress={openNew}>
              <Text style={styles.sectionLink}>+ Add visit</Text>
            </Pressable>
          </View>
          {upcoming.length ? (
            upcoming.map((item) => (
              <Pressable key={item.id} onPress={() => openEdit(item)} style={styles.visit}>
                <View style={styles.dateTile}>
                  <Text style={styles.dateMonth}>{format(parseISO(item.date), 'MMM').toUpperCase()}</Text>
                  <Text style={styles.dateDay}>{format(parseISO(item.date), 'd')}</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.visitTitle}>{item.title}</Text>
                  <Text style={styles.visitWhen}>
                    {format(parseISO(item.date), 'EEE, d MMM yyyy')}
                    {item.time ? ` · ${prettyTime(item.time)}` : ''}
                  </Text>
                  <Text style={styles.visitPlace}>{item.place || 'Location not added'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#C78AAE" />
              </Pressable>
            ))
          ) : (
            <Pressable onPress={openNew} style={styles.visit}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.visitTitle}>No visits yet</Text>
                <Text style={styles.visitWhen}>Add a date when you have one. This does not book the visit.</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#C78AAE" />
            </Pressable>
          )}

          <View style={styles.sectionHead}>
            <Text style={styles.section}>Questions for your visit</Text>
            <Text style={styles.sectionLink}>{plan.questions.length} saved</Text>
          </View>
          <View style={styles.card}>
            {plan.questions.map((question, index) => (
              <View key={question} style={[styles.question, index < plan.questions.length - 1 && styles.questionLine]}>
                <Ionicons name="chatbubble-outline" size={16} color="#C78AAE" />
                <Text style={styles.questionText}>{question}</Text>
              </View>
            ))}
            {addingQuestion ? (
              <TextInput
                value={draftQuestion}
                onChangeText={setDraftQuestion}
                placeholder="Write a question"
                placeholderTextColor="#A89BB0"
                style={styles.input}
                onSubmitEditing={() => {
                  const next = draftQuestion.trim();
                  if (!next) return;
                  setPlan({ ...plan, questions: [...plan.questions, next] });
                  setDraftQuestion('');
                  setAddingQuestion(false);
                }}
              />
            ) : null}
            <Pressable
              onPress={() => {
                const next = draftQuestion.trim();
                if (addingQuestion && next) {
                  setPlan({ ...plan, questions: [...plan.questions, next] });
                  setDraftQuestion('');
                  setAddingQuestion(false);
                  return;
                }
                setAddingQuestion(true);
              }}
            >
              <Text style={styles.addLink}>+ Add a question</Text>
            </Pressable>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.section}>Before your next visit</Text>
            <Text style={styles.sectionLink}>
              {ready} of {CARE_TASKS.length} ready
            </Text>
          </View>
          <View style={styles.card}>
            {CARE_TASKS.map((task) => {
              const on = plan.checks.includes(task.id);
              return (
                <Pressable
                  key={task.id}
                  onPress={() =>
                    setPlan({
                      ...plan,
                      checks: on ? plan.checks.filter((id) => id !== task.id) : [...plan.checks, task.id],
                    })
                  }
                  style={styles.checkRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                >
                  <View style={[styles.box, on && styles.boxOn]}>
                    {on ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                  </View>
                  <Text style={styles.checkText}>{task.label}</Text>
                </Pressable>
              );
            })}
            <Text style={styles.fine}>Do what you can. It’s okay to arrive without every detail ready.</Text>
          </View>

          <Text style={styles.section}>Reminders, your way</Text>
          <View style={styles.card}>
            <View style={styles.pref}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.prefTitle}>Visit reminder</Text>
                <Text style={styles.prefCopy}>1 day before · 6:00 PM</Text>
              </View>
              <CareSwitch on={plan.visitReminder} onPress={() => setPlan({ ...plan, visitReminder: !plan.visitReminder })} />
            </View>
            <View style={styles.divider} />
            <View style={styles.pref}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.prefTitle}>Show appointment details</Text>
                <Text style={styles.prefCopy}>{plan.showDetails ? 'On · the visit name shows' : 'Off · use “Ovella reminder” instead'}</Text>
              </View>
              <CareSwitch on={plan.showDetails} onPress={() => setPlan({ ...plan, showDetails: !plan.showDetails })} />
            </View>
            <Text style={styles.fine}>
              Check device notification previews too, especially if someone else uses your phone.
            </Text>
          </View>

          <View style={styles.support}>
            <View style={styles.supportHead}>
              <Ionicons name="leaf-outline" size={18} color="#6E3654" />
              <Text style={styles.supportTitle}>Support, if it feels safe</Text>
            </View>
            <Text style={styles.supportCopy}>
              You choose who to involve. A trusted adult, relative or school nurse could help with travel, school arrangements or coming to a visit.
            </Text>
            <View style={styles.ask}>
              <Text style={styles.askKicker}>A WAY TO ASK</Text>
              <Text style={styles.askCopy}>“Could you help me get to my appointment? I’d like some support.”</Text>
            </View>
            <Text style={styles.supportFine}>
              You can ask to speak to the clinician alone. If involving family feels unsafe, ask a healthcare professional about safer support.
            </Text>
          </View>

          <Pressable onPress={savePlan}>
            <LinearGradient colors={WASH} locations={[0, 0.56, 1]} style={styles.saveBtn}>
              <Ionicons name="checkmark" size={18} color="#66294A" />
              <Text style={styles.saveText}>{saved ? 'Care plan saved' : 'Save care plan'}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => {
              const state = navigation.getState();
              const previous = state.routes[state.index - 1];
              if (previous?.name === 'Article' && previous.params?.id === 'pregnancy') navigation.goBack();
              else navigation.push('Article', { id: 'pregnancy' });
            }}
            style={styles.route}
          >
            <View style={styles.routeHead}>
              <Ionicons name="leaf-outline" size={18} color="#6E3654" />
              <Text style={styles.routeTitle}>Pregnancy & Support</Text>
              <Ionicons name="arrow-forward" size={15} color="#6E3654" />
            </View>
            <Text style={styles.routeCopy}>
              Balanced information about your options, privacy and finding support. Your choices still matter.
            </Text>
          </Pressable>

          <View style={styles.urgent}>
            <Ionicons name="alert-circle-outline" size={18} color="#6E3654" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.urgentTitle}>Severe pain, heavy bleeding or fainting?</Text>
              <Text style={styles.urgentCopy}>Seek urgent medical care now. Don’t wait for a check-in or appointment.</Text>
            </View>
          </View>
          <Text style={styles.footer}>
            Ovella helps you track, not diagnose. Ask a qualified healthcare professional for personal care advice.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing === 'new' ? 'Add visit' : 'Edit visit'}</Text>
            <TextField label="Visit" value={title} onChangeText={setTitle} placeholder="Prenatal visit" autoCapitalize="sentences" />
            <PlaceField
              place={place}
              latitude={latitude}
              longitude={longitude}
              onChange={(next) => {
                setPlace(next.place);
                setLatitude(next.latitude);
                setLongitude(next.longitude);
              }}
            />
            <Pressable onPress={() => setPicker(true)} style={styles.field}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Text style={styles.fieldValue}>{format(parseISO(date), 'EEE, d MMM yyyy')}</Text>
            </Pressable>
            <Pressable onPress={() => setTimeOpen(true)} style={styles.field}>
              <Text style={styles.fieldLabel}>Time</Text>
              <Text style={styles.fieldValue}>{prettyTime(time)}</Text>
            </Pressable>
            <PrimaryButton label="Save visit" disabled={!title.trim()} onPress={saveVisit} />
            {editing && editing !== 'new' ? (
              <Pressable
                onPress={() => {
                  const id = editing;
                  Alert.alert('Remove visit', 'Remove this visit from your plan?', [
                    { text: 'Keep', style: 'cancel' },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => {
                        removeAppointment(id);
                        setEditing(null);
                      },
                    },
                  ]);
                }}
              >
                <Text style={styles.remove}>Remove visit</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => setEditing(null)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <DatePickerModal
        visible={picker}
        value={date}
        title="Visit date"
        confirmLabel="Use this date"
        onClose={() => setPicker(false)}
        onSelect={setDate}
      />
      <TimeModal
        visible={timeOpen}
        value={time}
        onClose={() => setTimeOpen(false)}
        onSelect={(next) => {
          setTime(next);
          setTimeOpen(false);
        }}
      />
    </View>
  );
}

function CareSwitch({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.switch, on && styles.switchOn]}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
    >
      <View style={[styles.knob, on && styles.knobOn]} />
    </Pressable>
  );
}

function TimeModal({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (clock: string) => void;
}) {
  const [draft, setDraft] = useState(() => clockToDate(value));
  useEffect(() => {
    if (visible) setDraft(clockToDate(value));
  }, [visible, value]);
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={clockToDate(value)}
        mode="time"
        onChange={(event, next) => {
          if (event.type === 'set' && next) onSelect(dateToClock(next));
          else onClose();
        }}
      />
    );
  }
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => undefined}>
          <Text style={styles.modalTitle}>Visit time</Text>
          <DateTimePicker value={draft} mode="time" display="spinner" onChange={(_, next) => next && setDraft(next)} />
          <PrimaryButton label="Use this time" onPress={() => onSelect(dateToClock(draft))} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF8FC' },
  page: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  hero: {
    backgroundColor: '#FCE7F3',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 24,
    padding: 16,
    gap: 14,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  heroCopy: { flex: 1, gap: 6 },
  kicker: { fontFamily: fonts.bodyBold, color: '#C78AAE', fontSize: 11 },
  title: { fontFamily: fonts.display, color: '#6E3654', fontSize: 26, lineHeight: 31 },
  lead: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  weekBadge: {
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  weekBadgeText: { fontFamily: fonts.bodyBold, color: '#C78AAE', fontSize: 10 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroDetails: { flex: 1, gap: 8 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 24 },
  backText: { fontFamily: fonts.bodySemi, color: '#C78AAE', fontSize: 11 },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noteText: { flex: 1, fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { fontFamily: fonts.bodyBold, color: '#6E3654', fontSize: 15 },
  sectionLink: { fontFamily: fonts.bodySemi, color: '#C78AAE', fontSize: 11 },
  visit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 18,
    padding: 13,
  },
  dateTile: {
    width: 48,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: { fontFamily: fonts.bodyBold, color: '#C78AAE', fontSize: 10 },
  dateDay: { fontFamily: fonts.display, color: '#6E3654', fontSize: 20 },
  visitTitle: { fontFamily: fonts.bodyBold, color: '#6E3654', fontSize: 13 },
  visitWhen: { fontFamily: fonts.body, color: '#786370', fontSize: 11 },
  visitPlace: { fontFamily: fonts.body, color: '#C78AAE', fontSize: 10, lineHeight: 14 },
  card: {
    backgroundColor: '#FFFCFD',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  question: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  questionLine: { borderBottomWidth: 1, borderBottomColor: '#F0D7E1', paddingBottom: 10 },
  questionText: { flex: 1, fontFamily: fonts.body, color: '#6E3654', fontSize: 12, lineHeight: 17 },
  addLink: { fontFamily: fonts.bodySemi, color: '#C78AAE', fontSize: 12 },
  input: {
    fontFamily: fonts.body,
    color: '#6E3654',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0D7E1',
    backgroundColor: '#FFFCFD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: '#C78AAE', borderColor: '#C78AAE' },
  checkText: { flex: 1, fontFamily: fonts.body, color: '#6E3654', fontSize: 12, lineHeight: 17 },
  fine: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  pref: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefTitle: { fontFamily: fonts.bodySemi, color: '#6E3654', fontSize: 12 },
  prefCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 11, lineHeight: 16 },
  divider: { height: 1, backgroundColor: '#F0D7E1' },
  switch: {
    width: 38,
    height: 23,
    borderRadius: 999,
    backgroundColor: '#E4D5DC',
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchOn: { backgroundColor: '#C78AAE' },
  knob: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#FFFCFD' },
  knobOn: { marginLeft: 'auto' },
  support: { backgroundColor: '#F4EFE6', borderRadius: 18, padding: 16, gap: 10 },
  supportHead: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  supportTitle: { flex: 1, fontFamily: fonts.display, color: '#6E3654', fontSize: 18, lineHeight: 23 },
  supportCopy: { fontFamily: fonts.body, color: '#6E3654', fontSize: 13, lineHeight: 19 },
  ask: { backgroundColor: '#FFFCFD', borderRadius: 12, padding: 11, gap: 5 },
  askKicker: { fontFamily: fonts.bodyBold, color: '#7A8F7A', fontSize: 9 },
  askCopy: { fontFamily: fonts.body, color: '#786370', fontSize: 13, lineHeight: 19 },
  supportFine: { fontFamily: fonts.body, color: '#6E3654', fontSize: 11, lineHeight: 16 },
  saveBtn: {
    height: 52,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  saveText: { fontFamily: fonts.bodyBold, color: '#66294A', fontSize: 13 },
  route: { backgroundColor: '#F4EFE6', borderRadius: 18, padding: 14, gap: 5 },
  routeHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeTitle: { flex: 1, fontFamily: fonts.display, color: '#6E3654', fontSize: 17 },
  routeCopy: { fontFamily: fonts.body, color: '#6E3654', fontSize: 11, lineHeight: 16 },
  urgent: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#FFF8FC',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 14,
    padding: 12,
  },
  urgentTitle: { fontFamily: fonts.bodyBold, color: '#6E3654', fontSize: 12 },
  urgentCopy: { fontFamily: fonts.body, color: '#6E3654', fontSize: 11, lineHeight: 16 },
  footer: { fontFamily: fonts.body, color: '#786370', fontSize: 10, lineHeight: 14, textAlign: 'center' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 21, 29, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, gap: 12 },
  modalTitle: { fontFamily: fonts.display, color: colors.ink, fontSize: 26 },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0D7E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldLabel: { fontFamily: fonts.body, color: '#786370', fontSize: 13 },
  fieldValue: { fontFamily: fonts.bodySemi, color: '#6E3654', fontSize: 13 },
  remove: { textAlign: 'center', fontFamily: fonts.bodySemi, color: colors.periodText, fontSize: 14 },
  cancel: { textAlign: 'center', fontFamily: fonts.bodySemi, color: colors.rose, fontSize: 14 },
});
