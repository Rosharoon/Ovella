import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceField } from '../../components/PlaceField';
import { DatePickerModal, PrimaryButton, ScrollScreen, TextField } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { colors, fonts, shadows } from '../../theme';
import { Appointment } from '../../types';
import { daysBetween, prettyDate, prettyTime, toISODate } from '../../utils/dates';
import { DEFAULT_REMINDER_TIME, DEFAULT_VISIT_TIME, reminderAlert, reminderNote } from '../../utils/reminders';

export function upcomingAppointment(items: Appointment[], today = toISODate(new Date())) {
  return (
    items
      .filter((item) => item.date >= today)
      .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.time || DEFAULT_VISIT_TIME).localeCompare(b.time || DEFAULT_VISIT_TIME) ||
        a.title.localeCompare(b.title),
    )[0] ?? null
  );
}

export function appointmentSummary(item: Appointment, today = toISODate(new Date())) {
  const time = item.time ? ` · ${prettyTime(item.time)}` : '';
  const place = item.place ? ` · ${item.place}` : '';
  const remind = item.remind ? ` · Reminder ${prettyTime(item.reminderTime || DEFAULT_REMINDER_TIME)}` : '';
  return `${appointmentWhen(item.date, today)}${time}${place}${remind}`;
}

export function appointmentWhen(date: string, today = toISODate(new Date())) {
  const delta = daysBetween(today, date);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta > 1) return `In ${delta} days`;
  return 'Past';
}

export function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { appointments, saveAppointment, removeAppointment } = useApp();
  const today = toISODate(new Date());
  const [editing, setEditing] = useState<string | null>(appointments.length ? null : 'new');
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(DEFAULT_VISIT_TIME);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [remind, setRemind] = useState(true);
  const [picker, setPicker] = useState(false);
  const [timePicker, setTimePicker] = useState<'visit' | 'reminder' | null>(null);

  const sorted = [...appointments].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time || DEFAULT_VISIT_TIME).localeCompare(b.time || DEFAULT_VISIT_TIME) ||
      a.title.localeCompare(b.title),
  );

  const openNew = () => {
    setEditing('new');
    setTitle('');
    setPlace('');
    setLatitude(undefined);
    setLongitude(undefined);
    setDate(today);
    setTime(DEFAULT_VISIT_TIME);
    setReminderTime(DEFAULT_REMINDER_TIME);
    setRemind(true);
  };

  const openEdit = (item: Appointment) => {
    setEditing(item.id);
    setTitle(item.title);
    setPlace(item.place);
    setLatitude(item.latitude);
    setLongitude(item.longitude);
    setDate(item.date);
    setTime(item.time || DEFAULT_VISIT_TIME);
    setReminderTime(item.reminderTime || DEFAULT_REMINDER_TIME);
    setRemind(Boolean(item.remind));
  };

  const save = async () => {
    const trimmed = title.trim();
    const trimmedPlace = place.trim();
    if (!trimmed || !date) return;
    const result = await saveAppointment({
      id: editing && editing !== 'new' ? editing : Date.now().toString(),
      title: trimmed,
      place: trimmedPlace,
      latitude: trimmedPlace ? latitude : undefined,
      longitude: trimmedPlace ? longitude : undefined,
      date,
      time,
      reminderTime,
      remind,
    });
    const notice = reminderAlert(result, date, reminderTime);
    if (notice) Alert.alert(notice.title, notice.message);
    if (result === 'denied') setRemind(false);
    setEditing(null);
  };

  const toggleRemind = async (item: Appointment) => {
    const result = await saveAppointment({ ...item, remind: !item.remind });
    const notice = reminderAlert(result, item.date, item.reminderTime || DEFAULT_REMINDER_TIME);
    if (notice) Alert.alert(notice.title, notice.message);
  };

  const remove = (item: Appointment) => {
    Alert.alert('Remove appointment', `Remove ${item.title}?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (editing === item.id) setEditing(null);
          removeAppointment(item.id);
        },
      },
    ]);
  };

  return (
    <ScrollScreen>
      <View style={{ paddingTop: insets.top + 8 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Appointments</Text>
        <Text style={styles.lead}>
          Set the visit time and a reminder time. Type a place to pin it on the map if you allow location.
        </Text>

        {sorted.map((item) => {
          const past = item.date < today;
          return (
            <Pressable key={item.id} onPress={() => openEdit(item)} style={[styles.row, past && styles.rowPast]}>
              <View style={styles.dateTile}>
                <Text style={styles.dateMonth}>{prettyDate(item.date).slice(0, 3)}</Text>
                <Text style={styles.dateDay}>{Number(item.date.slice(8))}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMeta}>{appointmentSummary(item, today)}</Text>
              </View>
              <Pressable
                onPress={() => toggleRemind(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={item.remind ? `Turn off reminder for ${item.title}` : `Remind me about ${item.title}`}
              >
                <Ionicons
                  name={item.remind ? 'notifications' : 'notifications-outline'}
                  size={18}
                  color={item.remind ? colors.rose : colors.muted}
                />
              </Pressable>
              <Pressable
                onPress={() => remove(item)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title}`}
              >
                <Ionicons name="trash-outline" size={18} color={colors.muted} />
              </Pressable>
            </Pressable>
          );
        })}

        {editing ? (
          <View style={styles.form}>
            <TextField
              label="Visit"
              value={title}
              onChangeText={setTitle}
              placeholder="Scan, midwife, check-in"
              autoCapitalize="sentences"
            />
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
            <Pressable onPress={() => setPicker(true)} style={styles.dateRow}>
              <Text style={styles.dateLabel}>Date</Text>
              <Text style={styles.dateValue}>{prettyDate(date)}</Text>
            </Pressable>
            <Pressable onPress={() => setTimePicker('visit')} style={styles.dateRow}>
              <Text style={styles.dateLabel}>Appointment time</Text>
              <Text style={styles.dateValue}>{prettyTime(time)}</Text>
            </Pressable>
            <Pressable
              onPress={() => setRemind((value) => !value)}
              style={[styles.remind, remind && styles.remindOn]}
              accessibilityRole="button"
              accessibilityLabel="Remind me"
            >
              <Ionicons name={remind ? 'notifications' : 'notifications-outline'} size={18} color={colors.rose} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.remindTitle}>{remind ? 'Reminder on' : 'Remind me'}</Text>
                <Text style={styles.remindMeta}>{reminderNote(date, reminderTime)}</Text>
              </View>
            </Pressable>
            {remind ? (
              <Pressable onPress={() => setTimePicker('reminder')} style={styles.dateRow}>
                <Text style={styles.dateLabel}>Reminder time</Text>
                <Text style={styles.dateValue}>{prettyTime(reminderTime)}</Text>
              </Pressable>
            ) : null}
            <PrimaryButton label={editing === 'new' ? 'Save appointment' : 'Update appointment'} disabled={!title.trim()} onPress={save} />
            {sorted.length ? (
              <Pressable onPress={() => setEditing(null)} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={{ marginTop: 16 }}>
            <PrimaryButton label="Add appointment" onPress={openNew} />
          </View>
        )}
      </View>
      <DatePickerModal
        visible={picker}
        value={date}
        title="Appointment date"
        confirmLabel="Use this date"
        onClose={() => setPicker(false)}
        onSelect={setDate}
      />
      <TimePickerModal
        visible={timePicker !== null}
        value={timePicker === 'reminder' ? reminderTime : time}
        title={timePicker === 'reminder' ? 'Reminder time' : 'Appointment time'}
        onClose={() => setTimePicker(null)}
        onSelect={(next) => {
          if (timePicker === 'reminder') setReminderTime(next);
          else setTime(next);
        }}
      />
    </ScrollScreen>
  );
}

function clockToDate(clock: string) {
  const [hour, minute] = clock.split(':').map(Number);
  const next = new Date();
  next.setHours(Number.isFinite(hour) ? hour : 9, Number.isFinite(minute) ? minute : 0, 0, 0);
  return next;
}

function dateToClock(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function TimePickerModal({
  visible,
  value,
  title,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: string;
  title: string;
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
          onClose();
        }}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.timeBackdrop} onPress={onClose}>
        <Pressable style={styles.timeCard} onPress={() => undefined}>
          <Text style={styles.timeTitle}>{title}</Text>
          <DateTimePicker
            value={draft}
            mode="time"
            display="spinner"
            onChange={(_, next) => {
              if (next) setDraft(next);
            }}
          />
          <PrimaryButton
            label="Use this time"
            onPress={() => {
              onSelect(dateToClock(draft));
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...shadows.soft,
  },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  lead: { fontFamily: fonts.body, color: colors.inkSoft, marginTop: 4, marginBottom: 8, lineHeight: 21 },
  row: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowPast: { opacity: 0.55 },
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
  rowTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  rowMeta: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12 },
  form: { marginTop: 16, gap: 12 },
  dateRow: {
    backgroundColor: colors.field,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: { fontFamily: fonts.bodySemi, color: colors.inkSoft, fontSize: 13 },
  dateValue: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  remind: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.field,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  remindOn: { borderColor: colors.rose, backgroundColor: colors.petal },
  remindTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  remindMeta: { fontFamily: fonts.body, color: '#8A6F7B', fontSize: 12 },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 14 },
  timeBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 22,
  },
  timeCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
  },
  timeTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginBottom: 8 },
});
