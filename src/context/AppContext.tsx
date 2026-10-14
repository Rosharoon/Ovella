import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { addDays } from 'date-fns';
import { resolvedLastPeriod } from '../data/pregnancyWeeks';
import { AppMode, Appointment, CycleProfile, DayLog, PregnancyProfile, PregnancyRecord, StoredState, TeenPrefs, User, defaultTeenPrefs } from '../types';
import { isTeenBirthDate } from '../utils/age';
import { cycleLengthFromLogs, getCycleAnchor, loggedCycleDays } from '../utils/cycle';
import { addISODays, daysBetween, toISODate } from '../utils/dates';
import { defaultHydration, loadHydration, saveHydration } from '../utils/hydration';
import { syncAccountReminders } from '../utils/accountReminders';
import { syncTeenReminders } from '../utils/teenReminders';
import { cancelAppointmentReminder, ReminderResult, syncAppointmentReminder } from '../utils/reminders';

const SEED_USER: User = {
  id: 'seed-alex',
  name: 'Alex Morgan',
  email: 'alex@ovella.app',
  password: 'ovella123',
};

const SESSION_KEY = 'ovella.session.v1';
const USERS_KEY = 'ovella.users.v1';
const SEED_RESET_KEY = 'ovella.seed.cleared.v1';
const stateKey = (userId: string) => `ovella.state.${userId}`;

function freshSeedState(): StoredState {
  const lastPeriodStart = toISODate(addDays(new Date(), -31));
  return {
    user: { id: SEED_USER.id, name: SEED_USER.name, email: SEED_USER.email },
    mode: 'period',
    cycle: {
      lastPeriodStart,
      cycleLength: 28,
      periodLength: 5,
      loggedPeriodStarts: [],
    },
    pregnancy: null,
    pregnancyHistory: [],
    logs: {},
    appointments: [],
  };
}

type PublicUser = Omit<User, 'password'>;

interface AppContextValue {
  hydrated: boolean;
  user: PublicUser | null;
  mode: AppMode | null;
  cycle: CycleProfile | null;
  pregnancy: PregnancyProfile | null;
  pregnancyHistory: PregnancyRecord[];
  logs: Record<string, DayLog>;
  appointments: Appointment[];
  selectedDate: string;
  setSelectedDate: (iso: string) => void;
  signIn: (email: string, password: string, remember?: boolean) => Promise<string | null>;
  signInWithProvider: (provider: 'apple' | 'google') => Promise<void>;
  signUp: (name: string, email: string, password: string, birthDate: string) => Promise<string | null>;
  resetPassword: (email: string, password: string) => Promise<string | null>;
  changePassword: (current: string, next: string) => Promise<string | null>;
  remindersEnabled: boolean;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
  teenPrefs: TeenPrefs;
  saveTeenPrefs: (prefs: TeenPrefs) => Promise<void>;
  signOut: () => Promise<void>;
  saveBirthDate: (birthDate: string) => Promise<void>;
  setMode: (mode: AppMode) => Promise<void>;
  saveCycle: (cycle: CycleProfile) => Promise<void>;
  savePregnancy: (pregnancy: PregnancyProfile) => Promise<void>;
  beginPregnancy: (pregnancy: PregnancyProfile) => Promise<void>;
  finishPregnancy: (outcome: PregnancyRecord['outcome']) => Promise<void>;
  landOnBaby: boolean;
  clearLandOnBaby: () => void;
  logPeriodStart: (dateISO?: string) => Promise<{ cycleDays: number | null } | void>;
  unlogPeriodStart: (dateISO: string) => Promise<void>;
  endPeriod: () => Promise<void>;
  saveLog: (log: DayLog) => Promise<void>;
  saveAppointment: (appointment: Appointment) => Promise<ReminderResult>;
  removeAppointment: (id: string) => Promise<void>;
  clearLogs: () => Promise<void>;
  eraseTracking: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

async function readUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

async function ensureSeedAccount() {
  const users = await readUsers();
  if (!users.some((item) => item.email === SEED_USER.email)) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, SEED_USER]));
  }
  const key = stateKey(SEED_USER.id);
  const cleared = await AsyncStorage.getItem(SEED_RESET_KEY);
  if (!cleared) {
    await AsyncStorage.setItem(key, JSON.stringify(freshSeedState()));
    await AsyncStorage.removeItem('ovella.hydration.seed-alex');
    await AsyncStorage.setItem(SEED_RESET_KEY, '1');
    return;
  }
  const existingRaw = await AsyncStorage.getItem(key);
  if (!existingRaw) {
    await AsyncStorage.setItem(key, JSON.stringify(freshSeedState()));
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [mode, setModeState] = useState<AppMode | null>(null);
  const [cycle, setCycle] = useState<CycleProfile | null>(null);
  const [pregnancy, setPregnancy] = useState<PregnancyProfile | null>(null);
  const [pregnancyHistory, setPregnancyHistory] = useState<PregnancyRecord[]>([]);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teenPrefs, setTeenPrefs] = useState<TeenPrefs>(defaultTeenPrefs());
  const [remindersEnabled, setRemindersState] = useState(true);
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [landOnBaby, setLandOnBaby] = useState(false);

  const applyState = useCallback((saved: StoredState | null, nextUser: PublicUser | null) => {
    setUser(nextUser);
    setModeState(saved?.mode ?? null);
    setCycle(saved?.cycle ?? null);
    setPregnancy(saved?.pregnancy ?? null);
    setPregnancyHistory(saved?.pregnancyHistory ?? []);
    setLogs(saved?.logs ?? {});
    setAppointments(saved?.appointments ?? []);
    setTeenPrefs(saved?.teenPrefs ?? defaultTeenPrefs());
    setRemindersState(saved?.remindersEnabled !== false);
  }, []);

  const persist = useCallback(async (next: StoredState) => {
    if (!next.user) return;
    await AsyncStorage.setItem(stateKey(next.user.id), JSON.stringify(next));
  }, []);

  useEffect(() => {
    (async () => {
      await ensureSeedAccount();
      const session = await AsyncStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionUser = JSON.parse(session) as PublicUser;
        const raw = await AsyncStorage.getItem(stateKey(sessionUser.id));
        const saved = raw ? (JSON.parse(raw) as StoredState) : null;
        const nextUser = { ...sessionUser, birthDate: sessionUser.birthDate ?? saved?.user?.birthDate };
        applyState(saved, nextUser);
      }
      setHydrated(true);
    })();
  }, [applyState]);

  const snapshot = useCallback(
    (overrides: Partial<StoredState> = {}): StoredState => ({
      user,
      mode,
      cycle,
      pregnancy,
      pregnancyHistory,
      logs,
      appointments,
      teenPrefs,
      remindersEnabled,
      ...overrides,
    }),
    [user, mode, cycle, pregnancy, pregnancyHistory, logs, appointments, teenPrefs, remindersEnabled],
  );

  const signIn = useCallback(
    async (email: string, password: string, remember = true) => {
      const users = await readUsers();
      const match = users.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!match) return 'No account found for that email.';
      if (match.password !== password) return 'That password does not match.';
      const nextUser = { id: match.id, name: match.name, email: match.email, birthDate: match.birthDate };
      const raw = await AsyncStorage.getItem(stateKey(nextUser.id));
      const saved = raw ? (JSON.parse(raw) as StoredState) : null;
      applyState(saved, nextUser);
      if (remember) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      else await AsyncStorage.removeItem(SESSION_KEY);
      await persist({
        user: nextUser,
        mode: saved?.mode ?? null,
        cycle: saved?.cycle ?? null,
        pregnancy: saved?.pregnancy ?? null,
        pregnancyHistory: saved?.pregnancyHistory ?? [],
        logs: saved?.logs ?? {},
        appointments: saved?.appointments ?? [],
        teenPrefs: saved?.teenPrefs ?? defaultTeenPrefs(),
        remindersEnabled: saved?.remindersEnabled !== false,
      });
      return null;
    },
    [applyState, persist],
  );

  const signInWithProvider = useCallback(
    async (provider: 'apple' | 'google') => {
      const profile =
        provider === 'apple'
          ? { id: 'social-apple', name: 'Apple', email: 'apple@ovella.app' }
          : { id: 'social-google', name: 'Gmail', email: 'gmail@ovella.app' };
      const users = await readUsers();
      let match = users.find((item) => item.id === profile.id);
      if (!match) {
        match = { ...profile, password: provider, authProvider: provider };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, match]));
      }
      const nextUser = {
        id: match.id,
        name: match.name,
        email: match.email,
        birthDate: match.birthDate,
        authProvider: provider,
      };
      const raw = await AsyncStorage.getItem(stateKey(nextUser.id));
      const saved = raw ? (JSON.parse(raw) as StoredState) : null;
      applyState(saved, nextUser);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      await persist({
        user: nextUser,
        mode: saved?.mode ?? null,
        cycle: saved?.cycle ?? null,
        pregnancy: saved?.pregnancy ?? null,
        pregnancyHistory: saved?.pregnancyHistory ?? [],
        logs: saved?.logs ?? {},
        appointments: saved?.appointments ?? [],
        teenPrefs: saved?.teenPrefs ?? defaultTeenPrefs(),
        remindersEnabled: saved?.remindersEnabled !== false,
      });
    },
    [applyState, persist],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string, birthDate: string) => {
      const users = await readUsers();
      if (users.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) {
        return 'An account with that email already exists.';
      }
      const teen = isTeenBirthDate(birthDate);
      const created: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        birthDate,
      };
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, created]));
      const nextUser = { id: created.id, name: created.name, email: created.email, birthDate };
      applyState(null, nextUser);
      if (teen) setModeState('period');
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      await persist({
        user: nextUser,
        mode: teen ? 'period' : null,
        cycle: null,
        pregnancy: null,
        pregnancyHistory: [],
        logs: {},
        appointments: [],
        teenPrefs: defaultTeenPrefs(),
        remindersEnabled: true,
      });
      return null;
    },
    [applyState, persist],
  );

  const resetPassword = useCallback(async (email: string, password: string) => {
    const users = await readUsers();
    const match = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) return 'No account found for that email on this phone.';
    if (match.authProvider === 'apple' || match.authProvider === 'google') {
      return 'This account uses Apple or Gmail sign-in, so it has no password to reset.';
    }
    await AsyncStorage.setItem(
      USERS_KEY,
      JSON.stringify(users.map((item) => (item.id === match.id ? { ...item, password } : item))),
    );
    return null;
  }, []);

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) return 'Sign in again to change your password.';
      if (next.length < 6) return 'Use at least 6 characters.';
      const users = await readUsers();
      const match = users.find((item) => item.id === user.id);
      if (!match) return 'Account not found on this phone.';
      const social = match.authProvider === 'apple' || match.authProvider === 'google';
      if (!social && match.password !== current) return 'That password does not match.';
      await AsyncStorage.setItem(
        USERS_KEY,
        JSON.stringify(users.map((item) => (item.id === user.id ? { ...item, password: next } : item))),
      );
      return null;
    },
    [user],
  );

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const setRemindersEnabled = useCallback(
    async (enabled: boolean) => {
      setRemindersState(enabled);
      await persist(snapshot({ remindersEnabled: enabled }));
      const today = toISODate(new Date());
      const nextPeriod = cycle ? addISODays(getCycleAnchor(cycle, today), cycle.cycleLength) : null;
      if (isTeenBirthDate(user?.birthDate)) {
        const nextPrefs = { ...teenPrefs, periodReminder: enabled };
        setTeenPrefs(nextPrefs);
        await persist(snapshot({ remindersEnabled: enabled, teenPrefs: nextPrefs }));
        await syncTeenReminders(nextPrefs, nextPeriod);
        return;
      }
      await syncAccountReminders(enabled, mode === 'period' ? nextPeriod : null);
    },
    [cycle, mode, persist, snapshot, teenPrefs, user?.birthDate],
  );

  const saveBirthDate = useCallback(
    async (birthDate: string) => {
      if (!user) return;
      const users = await readUsers();
      await AsyncStorage.setItem(
        USERS_KEY,
        JSON.stringify(users.map((item) => (item.id === user.id ? { ...item, birthDate } : item))),
      );
      const nextUser = { ...user, birthDate };
      const teen = isTeenBirthDate(birthDate);
      setUser(nextUser);
      if (teen) setModeState('period');
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      await persist(snapshot({ user: nextUser, mode: teen ? 'period' : mode }));
    },
    [mode, persist, snapshot, user],
  );

  const setMode = useCallback(
    async (next: AppMode) => {
      if (isTeenBirthDate(user?.birthDate)) return;
      if (mode === 'pregnancy' && next === 'period') return;
      setModeState(next);
      await persist(snapshot({ mode: next }));
    },
    [mode, persist, snapshot, user?.birthDate],
  );

  const saveCycle = useCallback(
    async (next: CycleProfile) => {
      setCycle(next);
      await persist(snapshot({ cycle: next }));
    },
    [persist, snapshot],
  );

  const savePregnancy = useCallback(
    async (next: PregnancyProfile) => {
      setPregnancy(next);
      await persist(snapshot({ pregnancy: next }));
    },
    [persist, snapshot],
  );

  const beginPregnancy = useCallback(
    async (next: PregnancyProfile) => {
      if (next.lastPeriodStart && next.lastPeriodStart > toISODate(new Date())) return;
      if (!isTeenBirthDate(user?.birthDate)) setLandOnBaby(true);
      setModeState('pregnancy');
      setPregnancy(next);
      await persist(snapshot({ mode: 'pregnancy', pregnancy: next }));
    },
    [persist, snapshot, user?.birthDate],
  );

  const finishPregnancy = useCallback(
    async (outcome: PregnancyRecord['outcome']) => {
      if (!pregnancy) return;
      const endDate = toISODate(new Date());
      const lastPeriodStart = resolvedLastPeriod(pregnancy);
      const record: PregnancyRecord = {
        id: Date.now().toString(),
        lastPeriodStart,
        endDate,
        days: Math.max(0, daysBetween(lastPeriodStart, endDate)),
        outcome,
        babyName: pregnancy.babyName,
      };
      const history = [...pregnancyHistory, record];
      const nextCycle = cycle ? { ...cycle, lastPeriodStart: endDate } : cycle;
      setPregnancyHistory(history);
      setPregnancy(null);
      setModeState('period');
      if (nextCycle) setCycle(nextCycle);
      await persist(
        snapshot({
          mode: 'period',
          pregnancy: null,
          pregnancyHistory: history,
          cycle: nextCycle,
        }),
      );
    },
    [cycle, persist, pregnancy, pregnancyHistory, snapshot],
  );

  const clearLandOnBaby = useCallback(() => setLandOnBaby(false), []);

  const logPeriodStart = useCallback(
    async (dateISO?: string) => {
      if (!cycle) return;
      const start = dateISO ?? toISODate(new Date());
      if (start > toISODate(new Date())) return;
      const logged = Array.from(new Set([...cycle.loggedPeriodStarts, start])).sort();
      const cycleDays = loggedCycleDays(logged, start);
      const next = {
        ...cycle,
        lastPeriodStart: logged[logged.length - 1],
        loggedPeriodStarts: logged,
        cycleLength: cycleLengthFromLogs(logged, cycle.cycleLength),
      };
      setCycle(next);
      await persist(snapshot({ cycle: next }));
      const today = toISODate(new Date());
      const nextPeriod = addISODays(getCycleAnchor(next, today), next.cycleLength);
      if (isTeenBirthDate(user?.birthDate)) {
        await syncTeenReminders(teenPrefs, nextPeriod);
      } else if (remindersEnabled) {
        await syncAccountReminders(true, nextPeriod);
      }
      return { cycleDays };
    },
    [cycle, persist, remindersEnabled, snapshot, teenPrefs, user?.birthDate],
  );

  const unlogPeriodStart = useCallback(
    async (dateISO: string) => {
      if (!cycle) return;
      const remaining = cycle.loggedPeriodStarts.filter((item) => item !== dateISO).sort();
      const nextLast = remaining[remaining.length - 1] ?? cycle.lastPeriodStart;
      const periodEnds = { ...(cycle.periodEnds ?? {}) };
      delete periodEnds[dateISO];
      const next = {
        ...cycle,
        lastPeriodStart: nextLast,
        loggedPeriodStarts: remaining,
        cycleLength: cycleLengthFromLogs(remaining, cycle.cycleLength),
        periodEnds,
      };
      setCycle(next);
      await persist(snapshot({ cycle: next }));
    },
    [cycle, persist, snapshot],
  );

  const endPeriod = useCallback(async () => {
    if (!cycle) return;
    const today = toISODate(new Date());
    const anchor = getCycleAnchor(cycle, today);
    if (!cycle.loggedPeriodStarts.includes(anchor) || today < anchor) return;
    const usualEnd = addISODays(anchor, cycle.periodLength - 1);
    if (today >= usualEnd || cycle.periodEnds?.[anchor]) return;
    const next = {
      ...cycle,
      periodEnds: { ...(cycle.periodEnds ?? {}), [anchor]: today },
    };
    setCycle(next);
    await persist(snapshot({ cycle: next }));
  }, [cycle, persist, snapshot]);

  const saveTeenPrefs = useCallback(
    async (prefs: TeenPrefs) => {
      setTeenPrefs(prefs);
      await persist(snapshot({ teenPrefs: prefs }));
      const today = toISODate(new Date());
      const nextPeriod = cycle ? addISODays(getCycleAnchor(cycle, today), cycle.cycleLength) : null;
      await syncTeenReminders(prefs, nextPeriod);
    },
    [cycle, persist, snapshot],
  );

  const saveAppointment = useCallback(
    async (appointment: Appointment) => {
      const result = await syncAppointmentReminder(appointment);
      const stored =
        result === 'denied' || result === 'past' ? { ...appointment, remind: false } : appointment;
      const next = appointments.some((item) => item.id === stored.id)
        ? appointments.map((item) => (item.id === stored.id ? stored : item))
        : [...appointments, stored];
      setAppointments(next);
      await persist(snapshot({ appointments: next }));
      return result;
    },
    [appointments, persist, snapshot],
  );

  const removeAppointment = useCallback(
    async (id: string) => {
      await cancelAppointmentReminder(id);
      const next = appointments.filter((item) => item.id !== id);
      setAppointments(next);
      await persist(snapshot({ appointments: next }));
    },
    [appointments, persist, snapshot],
  );

  const clearLogs = useCallback(async () => {
    setLogs({});
    await persist(snapshot({ logs: {} }));
  }, [persist, snapshot]);

  const eraseTracking = useCallback(async () => {
    await Promise.all(appointments.map((item) => cancelAppointmentReminder(item.id)));
    await syncTeenReminders({ ...teenPrefs, periodReminder: false, moodReminder: false }, null);
    if (user) {
      await saveHydration(user.id, defaultHydration());
      await AsyncStorage.multiRemove([
        `ovella.health.${user.id}`,
        `ovella.care.${user.id}`,
        `ovella.body-note.${user.id}`,
      ]);
    }
    const nextCycle = cycle ? { ...cycle, loggedPeriodStarts: [], periodEnds: {} } : null;
    setLogs({});
    setAppointments([]);
    setPregnancy(null);
    setPregnancyHistory([]);
    setCycle(nextCycle);
    setModeState(cycle ? 'period' : mode);
    await persist(
      snapshot({
        logs: {},
        appointments: [],
        pregnancy: null,
        pregnancyHistory: [],
        cycle: nextCycle,
        mode: cycle ? 'period' : mode,
      }),
    );
  }, [appointments, cycle, mode, persist, snapshot, teenPrefs, user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await Promise.all(appointments.map((item) => cancelAppointmentReminder(item.id)));
    await syncTeenReminders({ ...defaultTeenPrefs(), periodReminder: false, moodReminder: false }, null);
    const hydration = await loadHydration(user.id);
    if (hydration.reminders) await saveHydration(user.id, { ...hydration, reminders: false });
    await AsyncStorage.multiRemove([
      stateKey(user.id),
      `ovella.hydration.${user.id}`,
      `ovella.health.${user.id}`,
      `ovella.care.${user.id}`,
      `ovella.body-note.${user.id}`,
    ]);
    if (user.id !== SEED_USER.id) {
      const users = await readUsers();
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users.filter((item) => item.id !== user.id)));
    }
    await signOut();
  }, [appointments, signOut, user]);

  const saveLog = useCallback(
    async (log: DayLog) => {
      const next = { ...logs, [log.date]: { ...log, loggedMode: log.loggedMode ?? mode ?? 'period' } };
      setLogs(next);
      await persist(snapshot({ logs: next }));
    },
    [logs, mode, persist, snapshot],
  );

  const value = useMemo(
    () => ({
      hydrated,
      user,
      mode,
      cycle,
      pregnancy,
      pregnancyHistory,
      logs,
      appointments,
      teenPrefs,
      saveTeenPrefs,
      selectedDate,
      setSelectedDate,
      signIn,
      signInWithProvider,
      signUp,
      resetPassword,
      changePassword,
      remindersEnabled,
      setRemindersEnabled,
      signOut,
      saveBirthDate,
      setMode,
      saveCycle,
      savePregnancy,
      beginPregnancy,
      finishPregnancy,
      landOnBaby,
      clearLandOnBaby,
      logPeriodStart,
      unlogPeriodStart,
      endPeriod,
      saveLog,
      saveAppointment,
      removeAppointment,
      clearLogs,
      eraseTracking,
      deleteAccount,
    }),
    [
      hydrated,
      user,
      mode,
      cycle,
      pregnancy,
      pregnancyHistory,
      logs,
      appointments,
      teenPrefs,
      saveTeenPrefs,
      selectedDate,
      signIn,
      signInWithProvider,
      signUp,
      resetPassword,
      changePassword,
      remindersEnabled,
      setRemindersEnabled,
      signOut,
      saveBirthDate,
      setMode,
      saveCycle,
      savePregnancy,
      beginPregnancy,
      finishPregnancy,
      landOnBaby,
      clearLandOnBaby,
      logPeriodStart,
      unlogPeriodStart,
      endPeriod,
      saveLog,
      saveAppointment,
      removeAppointment,
      clearLogs,
      eraseTracking,
      deleteAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
