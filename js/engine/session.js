// Review-session logic: which cards are due, which exercise each gets,
// and how objective performance maps to an FSRS rating.

import { RATING } from './fsrs.js';
import { blanks } from './cloze.js';
import { eligible as parsonsEligible } from './parsons.js';
import { mulberry32 } from './parsons.js';

// Due cards from the save, oldest due first.
export function dueCards(save, now) {
  return Object.entries(save.cards)
    .filter(([, c]) => c.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([id, card]) => ({ id, card }));
}

export function dueCount(save, now) {
  return dueCards(save, now).length;
}

// Exercise types available for a trick; rotation keyed by rep count so each
// review exercises a different muscle.
export function exerciseTypes(trick) {
  const types = [];
  if (blanks(trick.code).length > 0) types.push('cloze');
  if (parsonsEligible(trick.code)) types.push('parsons');
  if (trick.quiz && trick.quiz.length) types.push('quiz');
  types.push('match');
  return types;
}

export function pickExercise(trick, card) {
  const types = exerciseTypes(trick);
  return types[card.reps % types.length];
}

// Build a pattern-match MCQ: prompt is the trick's when-to-use line; options
// are its name plus 3 distractor names (same world first, then global).
export function matchQuestion(trick, allTricks, seed = 1) {
  const rng = mulberry32(seed);
  const world = trick.id.split('/')[0];
  const pool = allTricks.filter((t) => t.id !== trick.id);
  pool.sort((a, b) => {
    const aw = a.id.startsWith(world + '/') ? 0 : 1;
    const bw = b.id.startsWith(world + '/') ? 0 : 1;
    return aw - bw || (rng() < 0.5 ? -1 : 1);
  });
  const distractors = [];
  for (const t of pool) {
    if (distractors.length >= 3) break;
    if (!distractors.some((d) => d.name === t.name)) distractors.push(t);
  }
  const options = [trick.name, ...distractors.map((d) => d.name)];
  // deterministic shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    q: `Which trick fits? — “${trick.when}”`,
    options,
    answer: options.indexOf(trick.name),
  };
}

// Objective grading: performance → FSRS rating. Fast+clean = Easy,
// clean = Good, needed a retry or hint = Hard, failed = Again.
const FAST_MS = { cloze: 15000, parsons: 30000, quiz: 8000, match: 8000 };

export function gradeOutcome({ kind, wrong = 0, hints = 0, revealed = false, ms = Infinity }) {
  if (revealed || wrong >= 2) return RATING.AGAIN;
  if (kind === 'quiz' || kind === 'match') {
    if (wrong >= 1) return RATING.AGAIN; // 4 options — a miss is a miss
    return ms <= FAST_MS[kind] ? RATING.EASY : RATING.GOOD;
  }
  if (wrong === 1 || hints > 0) return RATING.HARD;
  return ms <= FAST_MS[kind] ? RATING.EASY : RATING.GOOD;
}

// Simple day-streak from the review log (array of {at} timestamps, any order).
export function streakDays(reviewLog, now) {
  const days = new Set(reviewLog.map((r) => Math.floor(r.at / 86400000)));
  const today = Math.floor(now / 86400000);
  let streak = 0;
  let d = today;
  if (!days.has(today)) d = today - 1; // today not played yet — streak survives until midnight
  while (days.has(d)) {
    streak += 1;
    d -= 1;
  }
  return streak;
}
