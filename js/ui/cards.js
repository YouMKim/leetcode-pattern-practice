// HTML renderers for tricks and exercises. Pure string-building — all
// interactivity is wired by the controllers in main.js.

import { stripMarkers } from '../engine/cloze.js';
import { problemUrl } from '../content/schema.js';

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const DIFF_NAME = { E: 'Easy', M: 'Medium', H: 'Hard' };

// Plain code block (cloze markers resolved).
export function renderCode(lines) {
  const rows = lines.map((line, i) =>
    `<div class="cline"><span class="cgut">${i + 1}</span><span class="ccode">${esc(stripMarkers(line)) || '&nbsp;'}</span></div>`
  );
  return `<div class="codeblock">${rows.join('')}</div>`;
}

// Code block with one blank as an input (from cloze renderPlan output).
export function renderClozeCode(plan) {
  const rows = plan.map((segs, i) => {
    const body = segs
      .map((seg) => {
        if (seg.t === 'text') return esc(seg.s);
        if (seg.t === 'filled') return `<span class="cloze-filled">${esc(seg.s)}</span>`;
        return `<input class="cloze-input" id="cloze-input" autocomplete="off" spellcheck="false" size="${Math.max(6, seg.answer.length + 2)}">`;
      })
      .join('');
    return `<div class="cline"><span class="cgut">${i + 1}</span><span class="ccode">${body || '&nbsp;'}</span></div>`;
  });
  return `<div class="codeblock">${rows.join('')}</div>`;
}

export function renderBigO(trick) {
  return `<div class="bigo"><span class="bigo-chip">⏱ ${esc(trick.bigO.time)}</span><span class="bigo-chip">💾 ${esc(trick.bigO.space)}</span></div>`;
}

export function renderGotchas(trick) {
  return `<ul class="gotchas">${trick.gotchas.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>`;
}

export function renderProblems(trick, save) {
  const rows = trick.problems.map((p) => {
    const done = !!save.solved[p.slug];
    return `<li class="prob ${done ? 'done' : ''}">
      <button class="prob-check" data-slug="${esc(p.slug)}" title="mark solved">${done ? '☑' : '☐'}</button>
      <a href="${problemUrl(p)}" target="_blank" rel="noopener">${esc(p.title)}</a>
      <span class="diff diff-${p.diff}">${DIFF_NAME[p.diff]}</span>
    </li>`;
  });
  return `<ul class="problems">${rows.join('')}</ul>`;
}

// The full reference card (learn view + post-answer reveal).
export function renderTrickCard(trick, save, { showProblems = true } = {}) {
  return `
    <div class="trick-card">
      <div class="trick-when">💡 <b>When:</b> ${esc(trick.when)}</div>
      ${renderCode(trick.code)}
      ${renderBigO(trick)}
      ${renderGotchas(trick)}
      ${showProblems ? `<div class="prob-title">Practice on real problems</div>${renderProblems(trick, save)}` : ''}
    </div>`;
}

export function renderParsons(puzzle, arrangement, sel, grabbed) {
  const rows = arrangement.map((li, pos) => {
    const cls = ['parsons-line'];
    if (pos === sel) cls.push(grabbed ? 'grabbed' : 'sel');
    return `<div class="${cls.join(' ')}" data-pos="${pos}"><span class="parsons-grip">${pos === sel ? (grabbed ? '✊' : '▸') : '&nbsp;'}</span><span class="ccode">${esc(puzzle.lines[li])}</span></div>`;
  });
  return `<div class="parsons">${rows.join('')}</div>
    <div class="ex-help">↑/↓ select · <kbd>Space</kbd> grab/drop · <kbd>Enter</kbd> submit</div>`;
}

export function renderMcq(q, { chosen = null, revealed = false, answer = -1 } = {}) {
  const opts = q.options.map((opt, i) => {
    const cls = ['mcq-opt'];
    if (revealed && i === answer) cls.push('right');
    if (revealed && chosen === i && i !== answer) cls.push('wrong');
    return `<div class="${cls.join(' ')}" data-idx="${i}"><kbd>${i + 1}</kbd> ${esc(opt)}</div>`;
  });
  return `<div class="mcq"><div class="mcq-q">${esc(q.q)}</div>${opts.join('')}</div>`;
}
