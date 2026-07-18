// localStorage persistence. The diary is keyed by local date so each day
// starts fresh while history is retained for a future history view.

const KEY = 'macromatch:v1';

export function todayKey(d = new Date()) {
  const p = (n) => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const DEFAULT_TARGETS = { kcal: 2580, p: 180, c: 285, f: 80 };

export function defaultState() {
  return {
    name: 'mate',
    targets: { ...DEFAULT_TARGETS },
    wizardDone: false,
    wizardProfile: null,
    diaryByDate: {},
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return { ...defaultState(), ...s };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full/unavailable — the app keeps working in-memory
  }
}

export function emptyDay() {
  return { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
}
