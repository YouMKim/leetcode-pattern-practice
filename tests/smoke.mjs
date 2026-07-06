// Engine unit tests + full content validation. Run: node tests/smoke.mjs
import {
  W, RATING, newCard, review, retrievability, intervalFor, formatMs, previewIntervals, DAY_MS,
} from '../js/engine/fsrs.js';
import { parseLine, blanks, stripMarkers, renderPlan, grade, normalize, pickBlank } from '../js/engine/cloze.js';
import { puzzleLines, eligible, makePuzzle, isSolved, correctCount, mulberry32 } from '../js/engine/parsons.js';
import { dueCards, exerciseTypes, pickExercise, matchQuestion, gradeOutcome, streakDays } from '../js/engine/session.js';
import { validateAll } from '../js/content/schema.js';
import { WORLDS, ALL_TRICKS, trickById } from '../js/content/index.js';

let failures = 0;
let count = 0;

function eq(actual, expected, label) {
  count++;
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) {
    failures++;
    console.error(`✗ ${label}\n    expected: ${b}\n    actual:   ${a}`);
  }
}
function ok(cond, label) {
  count++;
  if (!cond) { failures++; console.error(`✗ ${label}`); }
}
function approx(actual, expected, tol, label) {
  count++;
  if (Math.abs(actual - expected) > tol) {
    failures++;
    console.error(`✗ ${label}: expected ≈${expected}, got ${actual}`);
  }
}

// --- FSRS ------------------------------------------------------------------

{
  const NOW = 1700000000000;
  // At the target retention 0.9, interval == stability exactly.
  approx(intervalFor(5), 5, 1e-9, 'fsrs interval(S) == S at retention 0.9');
  approx(retrievability(5, 5), 0.9, 1e-9, 'fsrs R(t=S) == 0.9');
  approx(retrievability(0, 5), 1, 1e-9, 'fsrs R(0) == 1');

  // First review: Good.
  const c0 = newCard(NOW);
  eq(c0.state, 'new', 'fsrs new card state');
  const good = review(c0, RATING.GOOD, NOW);
  approx(good.S, W[2], 1e-9, 'fsrs first Good stability = w2');
  approx(good.D, W[4], 1e-9, 'fsrs first Good difficulty = w4');
  eq(good.state, 'review', 'fsrs Good graduates to review');
  eq(good.due, NOW + Math.round(W[2]) * DAY_MS, 'fsrs first Good due ≈ 4 days');

  // First review: Easy schedules further than Good.
  const easy = review(newCard(NOW), RATING.EASY, NOW);
  ok(easy.due > good.due, 'fsrs Easy > Good interval');

  // First review: Again goes to learning, due in minutes.
  const again = review(newCard(NOW), RATING.AGAIN, NOW);
  eq(again.state, 'learning', 'fsrs Again enters learning');
  ok(again.due - NOW <= 15 * 60000, 'fsrs Again due within minutes');
  ok(again.D > good.D, 'fsrs Again difficulty > Good difficulty');

  // Learning -> Good graduates.
  const grad = review(again, RATING.GOOD, NOW + 10 * 60000);
  eq(grad.state, 'review', 'fsrs learning graduates on Good');
  ok(grad.S >= W[2] - 1e-9, 'fsrs graduation restores initial stability');

  // On-time Good review grows stability.
  const later = NOW + Math.round(good.S) * DAY_MS;
  const second = review(good, RATING.GOOD, later);
  ok(second.S > good.S, 'fsrs stability grows on successful review');
  ok(second.due > later + good.S * DAY_MS * 0.8, 'fsrs second interval longer');

  // Again from review state: lapse + stability drop.
  const lapsed = review(second, RATING.AGAIN, second.due);
  eq(lapsed.lapses, 1, 'fsrs lapse counted');
  ok(lapsed.S < second.S, 'fsrs forgetting shrinks stability');

  // Preview intervals are human strings for all four ratings.
  const prev = previewIntervals(good, later);
  ok([1, 2, 3, 4].every((g) => typeof prev[g] === 'string' && prev[g].length > 0), 'fsrs preview intervals');
  eq(formatMs(60000), '1m', 'fsrs formatMs minutes');
  eq(formatMs(3 * DAY_MS), '3d', 'fsrs formatMs days');
}

// --- Cloze ------------------------------------------------------------------

{
  const line = 'heapq.heappush(heap, {{-num}})';
  const segs = parseLine(line);
  eq(segs.length, 3, 'cloze parseLine segments');
  eq(segs[1], { t: 'blank', answer: '-num' }, 'cloze blank segment');
  eq(stripMarkers(line), 'heapq.heappush(heap, -num)', 'cloze stripMarkers');

  const code = ['a = {{1}}', 'plain', 'b = {{2}} + {{3}}'];
  eq(blanks(code).length, 3, 'cloze blanks count');
  eq(blanks(code)[2], { line: 2, answer: '3' }, 'cloze blank order');

  const plan = renderPlan(code, 1);
  const flat = plan.flat();
  eq(flat.filter((s) => s.t === 'input').length, 1, 'cloze one input');
  eq(flat.find((s) => s.t === 'input').answer, '2', 'cloze right blank hidden');
  eq(flat.filter((s) => s.t === 'filled').length, 2, 'cloze others filled');

  ok(grade('  -num ', '-num'), 'cloze grade trims');
  ok(grade("x = 'a'", 'x = "a"'), 'cloze grade quote-insensitive');
  ok(grade('a  +  b', 'a + b'), 'cloze grade whitespace-collapse');
  ok(!grade('num', '-num'), 'cloze grade rejects wrong');
  eq(pickBlank(code, 4), 1, 'cloze blank rotation');
}

// --- Parsons -----------------------------------------------------------------

{
  const code = ['a = 1', '', 'b = {{2}}', 'c = 3', 'd = 4'];
  eq(puzzleLines(code), ['a = 1', 'b = 2', 'c = 3', 'd = 4'], 'parsons lines strip blanks+markers');
  ok(eligible(code), 'parsons eligible with 4 lines');
  ok(!eligible(['a', 'b', 'c']), 'parsons ineligible with 3');

  const puzzle = makePuzzle(code, 7);
  ok(!isSolved(puzzle, puzzle.order), 'parsons shuffle is not identity');
  ok(isSolved(puzzle, [0, 1, 2, 3]), 'parsons identity arrangement solves');
  ok(correctCount(puzzle, [0, 1, 3, 2]) === 2, 'parsons correctCount');

  // duplicate lines are interchangeable
  const dup = { lines: ['x', 'y', 'x'] };
  ok(isSolved(dup, [2, 1, 0]), 'parsons duplicate content interchangeable');

  const rng = mulberry32(42);
  const seq1 = [rng(), rng()];
  const rng2 = mulberry32(42);
  eq([rng2(), rng2()], seq1, 'parsons rng deterministic');
}

// --- Session ------------------------------------------------------------------

{
  const NOW = 1700000000000;
  const save = {
    cards: {
      'a/x': { due: NOW - 1000, reps: 1 },
      'a/y': { due: NOW + 99999, reps: 1 },
      'a/z': { due: NOW - 50000, reps: 2 },
    },
    reviewLog: [],
  };
  eq(dueCards(save, NOW).map((d) => d.id), ['a/z', 'a/x'], 'session due sorted oldest first');

  const trick = trickById('heap/max-heap');
  eq(exerciseTypes(trick), ['cloze', 'parsons', 'quiz', 'match'], 'session all exercise types');
  eq(pickExercise(trick, { reps: 0 }), 'cloze', 'session exercise rotation 0');
  eq(pickExercise(trick, { reps: 2 }), 'quiz', 'session exercise rotation 2');

  const mq = matchQuestion(trick, ALL_TRICKS, 3);
  eq(mq.options.length, 4, 'session match 4 options');
  eq(new Set(mq.options).size, 4, 'session match options unique');
  eq(mq.options[mq.answer], trick.name, 'session match answer index correct');

  eq(gradeOutcome({ kind: 'cloze', wrong: 0, hints: 0, ms: 5000 }), RATING.EASY, 'grade fast clean = Easy');
  eq(gradeOutcome({ kind: 'cloze', wrong: 0, hints: 0, ms: 60000 }), RATING.GOOD, 'grade slow clean = Good');
  eq(gradeOutcome({ kind: 'cloze', wrong: 1, ms: 5000 }), RATING.HARD, 'grade retry = Hard');
  eq(gradeOutcome({ kind: 'cloze', hints: 1, wrong: 0, ms: 5000 }), RATING.HARD, 'grade hint = Hard');
  eq(gradeOutcome({ kind: 'cloze', revealed: true }), RATING.AGAIN, 'grade reveal = Again');
  eq(gradeOutcome({ kind: 'quiz', wrong: 1 }), RATING.AGAIN, 'grade mcq miss = Again');
  eq(gradeOutcome({ kind: 'quiz', wrong: 0, ms: 3000 }), RATING.EASY, 'grade mcq fast = Easy');

  const day = 86400000;
  const today = Math.floor(NOW / day) * day + 1000;
  eq(streakDays([{ at: today }, { at: today - day }, { at: today - 2 * day }], NOW), 3, 'streak 3 days');
  eq(streakDays([{ at: today - day }], NOW), 1, 'streak survives if today unplayed');
  eq(streakDays([], NOW), 0, 'streak empty');
}

// --- Content validation -----------------------------------------------------------

{
  const errs = validateAll(WORLDS);
  for (const e of errs) console.error(`  content: ${e}`);
  eq(errs.length, 0, 'content passes schema validation');
  eq(WORLDS.length, 13, 'content has 13 worlds');
  eq(ALL_TRICKS.length, 65, 'content has 65 tricks');
  ok(WORLDS.every((w) => w.tricks.length === 5), 'content 5 tricks per world');

  // every trick supports at least cloze + match, and rotation never crashes
  for (const t of ALL_TRICKS) {
    const types = exerciseTypes(t);
    ok(types.includes('cloze') && types.includes('match'), `${t.id} has cloze+match`);
    for (let reps = 0; reps < 6; reps++) {
      const kind = pickExercise(t, { reps });
      ok(types.includes(kind), `${t.id} rotation valid at reps=${reps}`);
    }
    const mq = matchQuestion(t, ALL_TRICKS, 5);
    eq(mq.options[mq.answer], t.name, `${t.id} match question well-formed`);
    // parsons puzzles for eligible tricks shuffle safely
    if (eligible(t.code)) {
      const p = makePuzzle(t.code, 11);
      ok(!isSolved(p, p.order), `${t.id} parsons shuffled`);
    }
  }
}

// --- report -------------------------------------------------------------------------

if (failures) {
  console.error(`\n${failures}/${count} checks FAILED`);
  process.exit(1);
} else {
  console.log(`all ${count} checks passed ✔`);
}
