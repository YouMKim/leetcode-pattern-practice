// Trick shape + validation. Run by the test suite over every authored trick
// so content errors fail CI instead of surfacing at play time.
//
// Trick:
// {
//   id: 'heap/max-heap-negation',       world prefix / kebab slug
//   name: 'Max-heap via negation',
//   when: 'one-line "use this when..." (also the pattern-match prompt —
//          must NOT contain the trick name)',
//   code: ['lines...', 'with {{cloze blanks}}'],   // Python
//   bigO: { time: 'O(log n)', space: 'O(n)' },
//   gotchas: ['...'],                    1..4 short strings
//   quiz: [{ q, options: [4], answer: idx, why? }],  ≥1
//   problems: [{ title, diff: 'E'|'M'|'H', slug }],  3..5, slug = leetcode slug
// }

import { blanks } from '../engine/cloze.js';

export function validateTrick(t) {
  const errs = [];
  const e = (msg) => errs.push(`${t.id || '(no id)'}: ${msg}`);

  if (!t.id || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(t.id)) e('id must be world/kebab-slug');
  if (!t.name) e('missing name');
  if (!t.when || t.when.length < 15) e('when-to-use missing or too short');
  if (t.name && t.when && t.when.toLowerCase().includes(t.name.toLowerCase())) {
    e('when-to-use must not contain the trick name (it is the match-quiz prompt)');
  }

  if (!Array.isArray(t.code) || t.code.length < 2) e('code must be ≥2 lines');
  else {
    const b = blanks(t.code);
    if (b.length < 1) e('code needs at least one {{cloze}} blank');
    for (const { answer } of b) {
      if (!answer.trim()) e('empty cloze blank');
      if (answer.includes('{{')) e('nested cloze markers');
    }
  }

  if (!t.bigO || !t.bigO.time || !t.bigO.space) e('bigO.time and bigO.space required');
  if (!Array.isArray(t.gotchas) || t.gotchas.length < 1 || t.gotchas.length > 4) e('1-4 gotchas required');

  if (!Array.isArray(t.quiz) || t.quiz.length < 1) e('≥1 quiz question required');
  else {
    t.quiz.forEach((q, i) => {
      if (!q.q) e(`quiz[${i}] missing q`);
      if (!Array.isArray(q.options) || q.options.length !== 4) e(`quiz[${i}] needs exactly 4 options`);
      if (!(q.answer >= 0 && q.answer <= 3)) e(`quiz[${i}] answer out of range`);
      if (q.options && new Set(q.options).size !== q.options.length) e(`quiz[${i}] duplicate options`);
    });
  }

  if (!Array.isArray(t.problems) || t.problems.length < 3 || t.problems.length > 5) {
    e('3-5 linked problems required');
  } else {
    t.problems.forEach((p, i) => {
      if (!p.title) e(`problems[${i}] missing title`);
      if (!['E', 'M', 'H'].includes(p.diff)) e(`problems[${i}] diff must be E/M/H`);
      if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) e(`problems[${i}] bad slug: ${p.slug}`);
    });
  }
  return errs;
}

export function validateAll(worlds) {
  const errs = [];
  const ids = new Set();
  const names = new Set();
  for (const w of worlds) {
    if (!w.id || !w.name || !w.icon || !Array.isArray(w.tricks)) {
      errs.push(`world ${w.id || '?'}: missing id/name/icon/tricks`);
      continue;
    }
    for (const t of w.tricks) {
      errs.push(...validateTrick(t));
      if (t.id) {
        if (ids.has(t.id)) errs.push(`duplicate trick id: ${t.id}`);
        ids.add(t.id);
        if (!t.id.startsWith(w.id + '/')) errs.push(`${t.id} not under world ${w.id}`);
      }
      if (t.name) {
        if (names.has(t.name)) errs.push(`duplicate trick name: ${t.name}`);
        names.add(t.name);
      }
    }
  }
  return errs;
}

export function problemUrl(p) {
  return `https://leetcode.com/problems/${p.slug}/`;
}
