import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CarePlan {
  questions: string[];
  checks: string[];
  visitReminder: boolean;
  showDetails: boolean;
}

export const CARE_QUESTIONS = [
  'What could help with my nausea and tiredness?',
  'Which medicines or supplements are safe for me?',
  'What stays private, and is parent consent needed?',
];

export const CARE_TASKS = [
  { id: 'questions', label: 'Write down questions I want to ask' },
  { id: 'medicines', label: 'List medicines and supplements I take' },
  { id: 'tests', label: 'Ask which tests and care I may need' },
  { id: 'travel', label: 'Plan travel and time away from school' },
];

export function defaultCarePlan(): CarePlan {
  return {
    questions: [...CARE_QUESTIONS],
    checks: ['questions'],
    visitReminder: true,
    showDetails: false,
  };
}

const keyFor = (userId: string) => `ovella.care.${userId}`;

export async function loadCarePlan(userId: string): Promise<CarePlan> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return defaultCarePlan();
  const saved = JSON.parse(raw) as Partial<CarePlan>;
  return {
    ...defaultCarePlan(),
    ...saved,
    questions: saved.questions?.length ? saved.questions : CARE_QUESTIONS,
    checks: saved.checks ?? ['questions'],
  };
}

export async function saveCarePlan(userId: string, plan: CarePlan) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(plan));
}
