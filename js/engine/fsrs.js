// Compact FSRS v4.5 scheduler (the algorithm behind Anki's modern scheduling
// and the user's spaced-repetition-prep app). Pure logic, node-testable.
//
// Model: a card has stability S (days until retrievability drops to 90%),
// difficulty D (1..10), and a state. Reviews are graded 1..4
// (Again / Hard / Good / Easy); the formulas below update S and D and
// produce the next due date.

export const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };
export const RATING_NAMES = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

// FSRS-4.5 default parameters w0..w16.
export const W = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
  0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755,
];

const DECAY = -0.5;
const FACTOR = 19 / 81; // chosen so R(t=S) = 0.9
export const RETENTION = 0.9;
export const MAX_INTERVAL_DAYS = 180;
export const DAY_MS = 86400000;
const RELEARN_MS = 10 * 60000; // "Again" comes back in 10 minutes

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// Probability of recall after `elapsedDays` for a card with stability S.
export function retrievability(elapsedDays, S) {
  return Math.pow(1 + (FACTOR * elapsedDays) / S, DECAY);
}

// Interval (days) at which retrievability decays to `retention`.
// At retention 0.9 this is exactly S.
export function intervalFor(S, retention = RETENTION) {
  return (S / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
}

function initStability(g) {
  return Math.max(W[g - 1], 0.1);
}

function initDifficulty(g) {
  return clamp(W[4] - (g - 3) * W[5], 1, 10);
}

function nextDifficulty(d, g) {
  const dp = d - W[6] * (g - 3);
  return clamp(W[7] * initDifficulty(RATING.GOOD) + (1 - W[7]) * dp, 1, 10);
}

function recallStability(d, s, r, g) {
  const hardPenalty = g === RATING.HARD ? W[15] : 1;
  const easyBonus = g === RATING.EASY ? W[16] : 1;
  return s * (1 +
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(s, -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus);
}

function forgetStability(d, s, r) {
  const next = W[11] *
    Math.pow(d, -W[12]) *
    (Math.pow(s + 1, W[13]) - 1) *
    Math.exp(W[14] * (1 - r));
  return Math.min(next, s); // forgetting can't increase stability
}

export function newCard(now) {
  return { state: 'new', S: 0, D: 0, due: now, lastReview: null, reps: 0, lapses: 0 };
}

export function daysUntilDue(card, now) {
  return (card.due - now) / DAY_MS;
}

// Apply a graded review at time `now`. Returns a NEW card object.
export function review(card, g, now) {
  const c = { ...card };

  if (c.state === 'new' || c.lastReview === null) {
    c.S = initStability(g);
    c.D = initDifficulty(g);
  } else if (c.state === 'learning') {
    // Same-session relearning: the long-term formulas don't model sub-day
    // gaps, so graduating out of learning restores at least the initial
    // stability for the grade.
    c.D = nextDifficulty(c.D, g);
    if (g >= RATING.GOOD) c.S = Math.max(c.S, initStability(g));
  } else {
    const elapsed = Math.max((now - c.lastReview) / DAY_MS, 0.01);
    const r = retrievability(elapsed, c.S);
    c.S = g === RATING.AGAIN ? forgetStability(c.D, c.S, r) : recallStability(c.D, c.S, r, g);
    c.D = nextDifficulty(c.D, g);
  }

  c.reps += 1;
  if (g === RATING.AGAIN) {
    if (c.state === 'review') c.lapses += 1;
    c.state = 'learning';
    c.due = now + RELEARN_MS;
  } else if (g === RATING.HARD && c.state === 'learning') {
    c.due = now + RELEARN_MS; // not confident yet — see it again this session
  } else {
    c.state = 'review';
    const days = clamp(Math.round(intervalFor(c.S)), 1, MAX_INTERVAL_DAYS);
    c.due = now + days * DAY_MS;
  }
  c.lastReview = now;
  return c;
}

// Human-readable interval preview for each rating (for the UI footer).
export function previewIntervals(card, now) {
  const out = {};
  for (const g of [1, 2, 3, 4]) {
    const next = review(card, g, now);
    out[g] = formatMs(next.due - now);
  }
  return out;
}

export function formatMs(ms) {
  const mins = ms / 60000;
  if (mins < 60) return `${Math.max(1, Math.round(mins))}m`;
  const days = ms / DAY_MS;
  if (days < 1) return `${Math.round(mins / 60)}h`;
  if (days < 30) return `${Math.round(days)}d`;
  return `${(days / 30).toFixed(1)}mo`;
}
