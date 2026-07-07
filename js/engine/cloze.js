// Cloze engine: trick templates mark blanks with {{...}}. One blank is
// hidden per review (rotating), the rest render filled in.

const BLANK_RE = /\{\{(.+?)\}\}/g;

// Parse one line into segments: {t:'text', s} | {t:'blank', answer}.
export function parseLine(line) {
  const segs = [];
  let last = 0;
  for (const m of line.matchAll(BLANK_RE)) {
    if (m.index > last) segs.push({ t: 'text', s: line.slice(last, m.index) });
    segs.push({ t: 'blank', answer: m[1] });
    last = m.index + m[0].length;
  }
  if (last < line.length) segs.push({ t: 'text', s: line.slice(last) });
  return segs;
}

// All blanks in a template, in order: [{line, answer}].
export function blanks(code) {
  const out = [];
  code.forEach((line, li) => {
    for (const m of line.matchAll(BLANK_RE)) out.push({ line: li, answer: m[1] });
  });
  return out;
}

// Line with markers resolved to their answers (for display / parsons).
export function stripMarkers(line) {
  return line.replace(BLANK_RE, (_, a) => a);
}

// Render plan for a cloze exercise hiding blank #blankIdx: an array of lines,
// each an array of segments {t:'text'|'input'|'filled', ...}.
export function renderPlan(code, blankIdx) {
  let seen = -1;
  return code.map((line) =>
    parseLine(line).map((seg) => {
      if (seg.t === 'text') return seg;
      seen += 1;
      return seen === blankIdx
        ? { t: 'input', answer: seg.answer }
        : { t: 'filled', s: seg.answer };
    })
  );
}

// Whitespace-insensitive, quote-style-insensitive comparison.
export function normalize(s) {
  return String(s).trim().replace(/\s+/g, ' ').replace(/'/g, '"');
}

export function grade(input, answer) {
  return normalize(input) === normalize(answer);
}

// Which blank to hide on this review (rotates with rep count).
export function pickBlank(code, reps) {
  const n = blanks(code).length;
  return n === 0 ? -1 : reps % n;
}

// Render plan hiding EVERY blank (the standard cloze drill): each blank
// becomes {t:'input', answer, idx}.
export function renderPlanAll(code) {
  let idx = -1;
  return code.map((line) =>
    parseLine(line).map((seg) => {
      if (seg.t === 'text') return seg;
      idx += 1;
      return { t: 'input', answer: seg.answer, idx };
    })
  );
}

// --- full-template typing -------------------------------------------------
// Grade a free-typed reproduction of the whole template. Compared line by
// line with comments, blank lines, indentation and quote style forgiven —
// the CONTENT of each line, in order, is what must match.

export function templateLines(code) {
  return code
    .map((l) => stripMarkers(l))
    .map(stripComment)
    .filter((l) => l.trim() !== '');
}

function stripComment(line) {
  const i = line.indexOf('#');
  return i === -1 ? line : line.slice(0, i);
}

function normFull(line) {
  return normalize(stripComment(line));
}

// Returns { ok, expected, results: [{expected, got, ok}] } — results is as
// long as the expected template; extra typed lines mark it wrong.
export function gradeFull(text, code) {
  const expected = templateLines(code);
  const got = String(text).split('\n').map(stripComment).filter((l) => l.trim() !== '');
  const results = expected.map((exp, i) => ({
    expected: exp.trim(),
    got: got[i] !== undefined ? got[i].trim() : '',
    ok: got[i] !== undefined && normFull(got[i]) === normFull(exp),
  }));
  const ok = results.every((r) => r.ok) && got.length === expected.length;
  return { ok, expected, extra: Math.max(0, got.length - expected.length), results };
}
