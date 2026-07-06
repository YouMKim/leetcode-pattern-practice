// Save/load via localStorage, plus JSON export/import for backup.

const KEY = 'leetcode-grimoire-save-v1';

function defaultSave() {
  return {
    version: 1,
    cards: {},      // trickId -> FSRS card
    learned: {},    // trickId -> timestamp first learned
    solved: {},     // problem slug -> timestamp checked off
    reviewLog: [],  // {id, rating, at} capped
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch {
    return defaultSave();
  }
}

export function persist(save) {
  try {
    if (save.reviewLog.length > 5000) save.reviewLog.splice(0, save.reviewLog.length - 5000);
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch { /* storage unavailable — session still works in memory */ }
}

export function resetSave() {
  localStorage.removeItem(KEY);
}

export function exportSave(save) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leetcode-grimoire-save.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function importSave(text) {
  const data = JSON.parse(text);
  if (typeof data !== 'object' || !data.cards) throw new Error('not a grimoire save file');
  const save = { ...defaultSave(), ...data };
  persist(save);
  return save;
}
