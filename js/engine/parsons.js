// Parsons puzzles: the trick's template lines, shuffled — restore the order.
// Indentation is preserved on each line; only line ORDER is the puzzle.

import { stripMarkers } from './cloze.js';

// Deterministic PRNG so tests (and per-review shuffles) are reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function puzzleLines(code) {
  return code.map(stripMarkers).filter((l) => l.trim() !== '');
}

export function eligible(code) {
  return puzzleLines(code).length >= 4;
}

// Returns {lines, order}: `lines` in CORRECT order; `order` is the shuffled
// display order (array of indices into lines). Never the identity permutation.
export function makePuzzle(code, seed = 1) {
  const lines = puzzleLines(code);
  const order = lines.map((_, i) => i);
  const rng = mulberry32(seed);
  for (let tries = 0; tries < 20; tries++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (!isSolved({ lines }, order)) break;
  }
  return { lines, order };
}

// arrangement: array of line-indices in displayed order. Compare by CONTENT
// so duplicate lines (e.g. two `return` lines) count as interchangeable.
export function isSolved(puzzle, arrangement) {
  if (arrangement.length !== puzzle.lines.length) return false;
  return arrangement.every((li, pos) => puzzle.lines[li] === puzzle.lines[pos]);
}

// How many display positions currently hold the right content (for feedback).
export function correctCount(puzzle, arrangement) {
  return arrangement.filter((li, pos) => puzzle.lines[li] === puzzle.lines[pos]).length;
}
