// LeetCode Grimoire — app shell: routing, screens, exercise controllers.

import { loadSave, persist, resetSave, exportSave, importSave } from './state.js';
import { WORLDS, ALL_TRICKS, trickById } from './content/index.js';
import { newCard, review, RATING, RATING_NAMES, formatMs, previewIntervals } from './engine/fsrs.js';
import { renderPlanAll, blanks, grade as gradeCloze, gradeFull, templateLines } from './engine/cloze.js';
import { makePuzzle, isSolved, correctCount } from './engine/parsons.js';
import { dueCards, dueCount, pickExercise, matchQuestion, gradeOutcome, streakDays } from './engine/session.js';
import {
  esc, renderCode, renderClozeCode, renderBigO, renderGotchas,
  renderProblems, renderTrickCard, renderParsons, renderMcq,
} from './ui/cards.js';

const app = document.getElementById('app');
let save = loadSave();
let ctrl = null; // active screen controller: { key(e) }

const now = () => Date.now();

function seedFor(id, reps) {
  let h = reps + 1;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h || 1;
}

// --- routing -----------------------------------------------------------------

function route() {
  ctrl = null;
  const hash = location.hash.slice(1);
  const [screen, a, b] = hash.split('/');
  if (screen === 'world') return renderWorld(a);
  if (screen === 'trick') return renderTrick(a, parseInt(b, 10));
  if (screen === 'review') return renderReview();
  if (screen === 'drill') return renderDrill(a);
  if (screen === 'stats') return renderStats();
  renderHome();
}
window.addEventListener('hashchange', route);

window.addEventListener('keydown', (e) => {
  if (e.metaKey || e.altKey) return;
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (ctrl && ctrl.key && ctrl.key(e)) e.preventDefault();
});

// --- shared bits ---------------------------------------------------------------

function topbar(backHash, title, right = '') {
  return `<div class="topbar">
    <button class="btn" id="btn-back">← Back</button>
    <div class="topbar-title">${title}</div>
    <div class="topbar-right">${right}</div>
  </div>`;
}

function wireTopbar(backHash) {
  const el = document.getElementById('btn-back');
  if (el) el.addEventListener('click', () => (location.hash = backHash));
}

function wireProblemChecks(rerender) {
  for (const btn of app.querySelectorAll('.prob-check')) {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.slug;
      if (save.solved[slug]) delete save.solved[slug];
      else save.solved[slug] = now();
      persist(save);
      rerender();
    });
  }
}

function worldStats(world) {
  const learned = world.tricks.filter((t) => save.learned[t.id]).length;
  const due = world.tricks.filter((t) => save.cards[t.id] && save.cards[t.id].due <= now()).length;
  return { learned, due, total: world.tricks.length };
}

// --- home ------------------------------------------------------------------------

function renderHome() {
  const due = dueCount(save, now());
  const learnedTotal = Object.keys(save.learned).length;
  const streak = streakDays(save.reviewLog, now());

  let reviewCta;
  if (due > 0) {
    reviewCta = `<button class="btn primary big" id="btn-review">🔮 Review — ${due} due</button>`;
  } else if (learnedTotal === 0) {
    reviewCta = `<div class="review-idle">Learn your first trick to start the spaced-repetition engine ↓</div>`;
  } else {
    const next = Math.min(...Object.values(save.cards).map((c) => c.due));
    reviewCta = `<div class="review-idle">✅ All clear — next review in ${formatMs(Math.max(0, next - now()))}</div>`;
  }

  const groupNames = [...new Set(WORLDS.map((w) => w.group))];
  const groups = groupNames.map((g) => {
    const cards = WORLDS.filter((w) => w.group === g).map((w) => {
      const s = worldStats(w);
      const pct = Math.round((s.learned / s.total) * 100);
      return `<div class="world-card" data-world="${w.id}">
        <div class="world-head"><span class="world-icon">${w.icon}</span>
        ${s.due ? `<span class="due-badge">${s.due} due</span>` : ''}</div>
        <div class="world-name">${esc(w.name)}</div>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="world-count">${s.learned}/${s.total} tricks</div>
      </div>`;
    });
    return `<div class="group-title">${g}</div><div class="worlds">${cards.join('')}</div>`;
  });

  app.innerHTML = `
    <div class="home">
      <div class="hero">
        <div class="hero-title">LEETCODE GRIMOIRE</div>
        <div class="hero-sub">every trick in the book — burned into memory with spaced repetition</div>
        <div class="hero-meta">${streak > 0 ? `🔥 ${streak}-day streak · ` : ''}${learnedTotal}/${ALL_TRICKS.length} tricks learned</div>
        <div class="hero-cta">${reviewCta}</div>
      </div>
      ${groups.join('')}
      <div class="home-foot">
        <a href="#stats">📊 stats</a> ·
        <a href="#" id="btn-export">export save</a> ·
        <a href="#" id="btn-import">import save</a> ·
        <a href="#" id="btn-reset">reset</a>
        <input type="file" id="import-file" accept=".json" style="display:none">
      </div>
    </div>`;

  for (const card of app.querySelectorAll('.world-card')) {
    card.addEventListener('click', () => (location.hash = `world/${card.dataset.world}`));
  }
  const btnReview = document.getElementById('btn-review');
  if (btnReview) btnReview.addEventListener('click', () => (location.hash = 'review'));
  document.getElementById('btn-export').addEventListener('click', (e) => { e.preventDefault(); exportSave(save); });
  const fileInput = document.getElementById('import-file');
  document.getElementById('btn-import').addEventListener('click', (e) => { e.preventDefault(); fileInput.click(); });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    f.text().then((text) => {
      try { save = importSave(text); route(); }
      catch (err) { alert('Import failed: ' + err.message); }
    });
  });
  document.getElementById('btn-reset').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Wipe all Grimoire progress?')) { resetSave(); save = loadSave(); route(); }
  });

  ctrl = {
    key(e) {
      if (e.key === 'Enter' && due > 0) { location.hash = 'review'; return true; }
      return false;
    },
  };
}

// --- world (trick list) -------------------------------------------------------------

function renderWorld(wid) {
  const world = WORLDS.find((w) => w.id === wid);
  if (!world) { location.hash = ''; return; }
  const s = worldStats(world);

  const rows = world.tricks.map((t, i) => {
    const card = save.cards[t.id];
    let status;
    if (!save.learned[t.id]) status = '<span class="st st-new">NEW</span>';
    else if (card && card.due <= now()) status = '<span class="st st-due">DUE</span>';
    else if (card) status = `<span class="st st-ok">in ${formatMs(card.due - now())}</span>`;
    else status = '<span class="st st-new">NEW</span>';
    return `<div class="trick-row" data-idx="${i}">
      <span class="trick-num">${i + 1}</span>
      <span class="trick-name">${esc(t.name)}</span>
      <span class="trick-bigo">${esc(t.bigO.time)}</span>
      ${status}
    </div>`;
  });

  app.innerHTML = `<div class="screen">
    ${topbar('', `${world.icon} ${esc(world.name)}`, `${s.learned}/${s.total}`)}
    <div class="drill-cta"><button class="btn" id="btn-drill">🔥 Drill this world — type every template from memory (no grading)</button></div>
    <div class="trick-list">${rows.join('')}</div>
  </div>`;
  wireTopbar('');
  document.getElementById('btn-drill').addEventListener('click', () => (location.hash = `drill/${wid}`));
  for (const row of app.querySelectorAll('.trick-row')) {
    row.addEventListener('click', () => (location.hash = `trick/${wid}/${row.dataset.idx}`));
  }
  ctrl = null;
}

// --- drill mode: type-only, ungraded, repeat at will --------------------------------

function renderDrill(wid) {
  const world = WORLDS.find((w) => w.id === wid);
  if (!world) { location.hash = ''; return; }
  const queue = world.tricks.slice();
  let clean = 0;
  let done = 0;

  app.innerHTML = `<div class="screen">
    ${topbar(`world/${wid}`, `🔥 Drill: ${world.icon} ${esc(world.name)}`, `<span id="drill-count"></span>`)}
    <div class="session" id="session"></div>
  </div>`;
  wireTopbar(`world/${wid}`);

  const step = () => {
    const counter = document.getElementById('drill-count');
    if (counter) counter.textContent = `${done}/${world.tricks.length}`;
    if (!queue.length) {
      document.getElementById('session').innerHTML = `
        <div class="summary">
          <div class="summary-title">Drill complete 💪</div>
          <div class="summary-row">${clean}/${world.tricks.length} templates typed clean, first try</div>
          <div class="ex-actions">
            <button class="btn primary" id="btn-redrill">Drill again <kbd>⏎</kbd></button>
            <button class="btn" id="btn-back-world">Back to world</button>
          </div>
        </div>`;
      document.getElementById('btn-redrill').addEventListener('click', () => renderDrill(wid));
      document.getElementById('btn-back-world').addEventListener('click', () => (location.hash = `world/${wid}`));
      ctrl = { key(e) { if (e.key === 'Enter') { renderDrill(wid); return true; } return false; } };
      return;
    }
    const trick = queue.shift();
    runExercise(document.getElementById('session'), trick, 'type', { reps: 1 }, (outcome) => {
      const ok = !outcome.wrong && !outcome.hints && !outcome.revealed;
      if (ok) clean += 1;
      done += 1;
      const container = document.getElementById('session');
      container.innerHTML = `
        <div class="reveal">
          <div class="verdict ${ok ? 'r-good' : 'r-again'}">${ok ? '✓ Clean' : '✗ Study it — then it comes around again next drill'}</div>
          <div class="reveal-name">${esc(trick.name)}</div>
          ${renderTrickCard(trick, save, { showProblems: false })}
          <div class="ex-actions"><button class="btn primary" id="btn-next">Next <kbd>⏎</kbd></button></div>
        </div>`;
      container.querySelector('#btn-next').addEventListener('click', step);
      ctrl = { key(e) { if (e.key === 'Enter') { step(); return true; } return false; } };
    });
  };
  step();
}

// Inline single-trick drill loop on the trick view: drill → result → Enter → again.
function drillOnce(trick, wid, idx) {
  const container = document.getElementById('trick-view');
  runExercise(container, trick, 'type', { reps: 1 }, (outcome) => {
    const ok = !outcome.wrong && !outcome.hints && !outcome.revealed;
    container.innerHTML = `
      <div class="reveal">
        <div class="verdict ${ok ? 'r-good' : 'r-again'}">${ok ? '✓ Nailed it' : '✗ Keep drilling'} — ungraded, repeat until it’s automatic</div>
        ${renderTrickCard(trick, save, { showProblems: false })}
        <div class="ex-actions">
          <button class="btn primary" id="btn-again">Drill again <kbd>⏎</kbd></button>
          <button class="btn" id="btn-done">Done</button>
        </div>
      </div>`;
    container.querySelector('#btn-again').addEventListener('click', () => drillOnce(trick, wid, idx));
    container.querySelector('#btn-done').addEventListener('click', () => renderTrick(wid, idx));
    ctrl = { key(e) { if (e.key === 'Enter') { drillOnce(trick, wid, idx); return true; } if (e.key === 'Escape') { renderTrick(wid, idx); return true; } return false; } };
  });
}

// --- trick reference / learn ----------------------------------------------------------

function renderTrick(wid, idx) {
  const world = WORLDS.find((w) => w.id === wid);
  const trick = world && world.tricks[idx];
  if (!trick) { location.hash = ''; return; }
  const card = save.cards[trick.id];
  const learned = !!save.learned[trick.id];

  let statusHtml;
  if (!learned) {
    statusHtml = `<button class="btn primary big" id="btn-learn">🎓 Got it — practice once to start reviews <kbd>⏎</kbd></button>`;
  } else if (card && card.due <= now()) {
    statusHtml = `<button class="btn primary big" id="btn-learn">🔮 This trick is due — review it now <kbd>⏎</kbd></button>`;
  } else if (card) {
    statusHtml = `<div class="deck-status">📚 In your deck — ${card.reps} review${card.reps === 1 ? '' : 's'} · next in <b>${formatMs(card.due - now())}</b></div>`;
  } else {
    statusHtml = '';
  }

  app.innerHTML = `<div class="screen">
    ${topbar(`world/${wid}`, `${world.icon} ${esc(trick.name)}`)}
    <div class="trick-view" id="trick-view">
      ${renderTrickCard(trick, save)}
      <div class="learn-cta">${statusHtml}
        <button class="btn" id="btn-trick-drill">🔥 Drill: type it from memory (ungraded)</button>
      </div>
    </div>
  </div>`;
  wireTopbar(`world/${wid}`);
  wireProblemChecks(() => renderTrick(wid, idx));
  document.getElementById('btn-trick-drill').addEventListener('click', () => drillOnce(trick, wid, idx));

  const startPractice = () => runSingleCard(trick, { backHash: `trick/${wid}/${idx}`, worldHash: `world/${wid}` });
  const btn = document.getElementById('btn-learn');
  if (btn) btn.addEventListener('click', startPractice);

  ctrl = {
    key(e) {
      if (e.key === 'Enter' && btn) { startPractice(); return true; }
      if (e.key === 'Escape') { location.hash = `world/${wid}`; return true; }
      return false;
    },
  };
}

// Learn-practice (or single due review) for one trick, inline.
function runSingleCard(trick, { backHash, worldHash }) {
  const container = document.getElementById('trick-view');
  const card = save.cards[trick.id] || newCard(now());
  const kind = save.learned[trick.id] ? pickExercise(trick, card) : 'cloze';
  runExercise(container, trick, kind, card, (outcome) => {
    const rating = gradeOutcome(outcome);
    const updated = review(card, rating, now());
    save.cards[trick.id] = updated;
    if (!save.learned[trick.id]) save.learned[trick.id] = now();
    save.reviewLog.push({ id: trick.id, rating, at: now() });
    persist(save);
    showReveal(container, trick, rating, updated, () => {
      location.hash = worldHash;
      route();
    });
  });
}

// --- review session ---------------------------------------------------------------------

function renderReview() {
  const queue = dueCards(save, now()).map((d) => d.id);
  if (!queue.length) {
    app.innerHTML = `<div class="screen">${topbar('', '🔮 Review')}
      <div class="empty-state">Nothing due right now. Go learn something new!</div></div>`;
    wireTopbar('');
    ctrl = { key(e) { if (e.key === 'Escape' || e.key === 'Enter') { location.hash = ''; return true; } return false; } };
    return;
  }

  const session = { queue, done: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0 } };

  app.innerHTML = `<div class="screen">
    ${topbar('', '🔮 Review', `<span id="session-count"></span>`)}
    <div class="session" id="session"></div>
  </div>`;
  wireTopbar('');

  const step = () => {
    const counter = document.getElementById('session-count');
    if (counter) counter.textContent = `${session.done} done · ${session.queue.length} left`;
    if (!session.queue.length) return showSummary(session);
    const id = session.queue[0];
    const trick = trickById(id);
    const card = save.cards[id];
    if (!trick || !card) { session.queue.shift(); return step(); }
    const kind = pickExercise(trick, card);
    const container = document.getElementById('session');
    runExercise(container, trick, kind, card, (outcome) => {
      const rating = gradeOutcome(outcome);
      const updated = review(card, rating, now());
      save.cards[id] = updated;
      save.reviewLog.push({ id, rating, at: now() });
      persist(save);
      session.queue.shift();
      session.done += 1;
      session.counts[rating] += 1;
      if (rating === RATING.AGAIN) session.queue.push(id); // redo at the end
      showReveal(container, trick, rating, updated, step);
    });
  };
  step();
}

function showSummary(session) {
  const c = session.counts;
  app.innerHTML = `<div class="screen">
    ${topbar('', '🔮 Review complete')}
    <div class="summary">
      <div class="summary-title">Session complete ✨</div>
      <div class="summary-row">${session.done} reviews</div>
      <div class="summary-row">
        <span class="r-again">Again ${c[1]}</span> · <span class="r-hard">Hard ${c[2]}</span> ·
        <span class="r-good">Good ${c[3]}</span> · <span class="r-easy">Easy ${c[4]}</span>
      </div>
      <button class="btn primary" id="btn-home">Home <kbd>⏎</kbd></button>
    </div>
  </div>`;
  wireTopbar('');
  document.getElementById('btn-home').addEventListener('click', () => (location.hash = ''));
  ctrl = { key(e) { if (e.key === 'Enter' || e.key === 'Escape') { location.hash = ''; return true; } return false; } };
}

// --- exercises -----------------------------------------------------------------------------

function exerciseHeader(trick, kind) {
  const label = {
    cloze: '⌨️ Fill the blanks', parsons: '🧩 Restore the order',
    type: '🔥 Type the whole template', quiz: '❓ Quiz', match: '🔍 Which trick?',
  }[kind];
  return `<div class="ex-head"><span class="ex-kind">${label}</span><span class="ex-trick">${kind === 'match' ? '???' : esc(trick.name)}</span></div>`;
}

function runExercise(container, trick, kind, card, onDone) {
  const started = now();
  const outcome = { kind, wrong: 0, hints: 0, revealed: false, ms: 0 };
  const finish = () => { outcome.ms = now() - started; onDone(outcome); };

  if (kind === 'cloze') return clozeCtrl(container, trick, card, outcome, finish);
  if (kind === 'parsons') return parsonsCtrl(container, trick, card, outcome, finish);
  if (kind === 'type') return typeCtrl(container, trick, card, outcome, finish);
  const q = kind === 'quiz'
    ? trick.quiz[card.reps % trick.quiz.length]
    : matchQuestion(trick, ALL_TRICKS, seedFor(trick.id, card.reps));
  return mcqCtrl(container, trick, kind, q, outcome, finish);
}

function clozeCtrl(container, trick, card, outcome, finish) {
  const plan = renderPlanAll(trick.code);
  const answers = blanks(trick.code).map((b) => b.answer);

  const render = (msg = '', values = []) => {
    container.innerHTML = `
      ${exerciseHeader(trick, 'cloze')}
      <div class="ex-when">💡 ${esc(trick.when)}</div>
      ${renderClozeCode(plan)}
      <div class="ex-msg">${msg}</div>
      <div class="ex-actions">
        <button class="btn" id="btn-hint">💡 Hint</button>
        <button class="btn" id="btn-reveal">Give up</button>
        <button class="btn primary" id="btn-submit">Submit <kbd>⏎</kbd></button>
      </div>`;
    answers.forEach((_, i) => {
      const input = document.getElementById(`cloze-input-${i}`);
      if (!input) return;
      input.value = values[i] || '';
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    });
    const first = document.getElementById('cloze-input-0');
    if (first) first.focus();
    document.getElementById('btn-submit').addEventListener('click', submit);
    document.getElementById('btn-hint').addEventListener('click', () => {
      outcome.hints += 1;
      const vals = answers.map((_, i) => document.getElementById(`cloze-input-${i}`).value);
      const miss = answers.findIndex((a, i) => !gradeCloze(vals[i], a));
      const a = answers[Math.max(0, miss)];
      render(`<span class="hint">hint (blank ${Math.max(0, miss) + 1}): starts with “${esc(a.slice(0, Math.min(3, a.length)))}…” (${a.length} chars)</span>`, vals);
    });
    document.getElementById('btn-reveal').addEventListener('click', () => { outcome.revealed = true; finish(); });
  };

  const submit = () => {
    const vals = answers.map((_, i) => document.getElementById(`cloze-input-${i}`).value);
    const bad = answers.filter((a, i) => !gradeCloze(vals[i], a)).length;
    if (bad === 0) return finish();
    outcome.wrong += 1;
    if (outcome.wrong >= 2) { outcome.revealed = true; return finish(); }
    render(`<span class="wrong-msg">✗ ${answers.length - bad}/${answers.length} blanks right — one more try</span>`, vals);
  };

  render();
  ctrl = { key: () => false }; // inputs handle their own keys
}

// Full-template recall: type the entire snippet from memory.
function typeCtrl(container, trick, card, outcome, finish) {
  const nLines = templateLines(trick.code).length;

  const render = (msg = '', value = '') => {
    container.innerHTML = `
      ${exerciseHeader(trick, 'type')}
      <div class="ex-when">💡 ${esc(trick.when)}</div>
      <textarea class="type-area" id="type-area" rows="${nLines + 2}" spellcheck="false"
        placeholder="# type the full ${nLines}-line template from memory
# comments, blank lines and indentation are forgiven — content and order are graded"></textarea>
      <div class="ex-msg">${msg}</div>
      <div class="ex-actions">
        <button class="btn" id="btn-hint">💡 First line</button>
        <button class="btn" id="btn-reveal">Give up</button>
        <button class="btn primary" id="btn-submit">Submit <kbd>⌘⏎</kbd></button>
      </div>`;
    const area = document.getElementById('type-area');
    area.value = value;
    area.focus();
    area.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = area.selectionStart ?? area.value.length;
        area.value = area.value.slice(0, s) + '    ' + area.value.slice(s);
        if (area.selectionStart !== undefined) area.selectionStart = area.selectionEnd = s + 4;
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
    });
    document.getElementById('btn-submit').addEventListener('click', submit);
    document.getElementById('btn-hint').addEventListener('click', () => {
      outcome.hints += 1;
      const res = gradeFull(document.getElementById('type-area').value, trick.code);
      const firstBad = res.results.find((r) => !r.ok);
      render(`<span class="hint">next line: <code>${esc(firstBad ? firstBad.expected : '(all lines ok — extra lines?)')}</code></span>`,
        document.getElementById('type-area').value);
    });
    document.getElementById('btn-reveal').addEventListener('click', () => { outcome.revealed = true; finish(); });
  };

  const submit = () => {
    const area = document.getElementById('type-area');
    const res = gradeFull(area.value, trick.code);
    if (res.ok) return finish();
    outcome.wrong += 1;
    if (outcome.wrong >= 2) { outcome.revealed = true; return finish(); }
    const marks = res.results.map((r, i) => `<span class="${r.ok ? 'line-ok' : 'line-bad'}">${i + 1}</span>`).join(' ');
    const extra = res.extra ? ` · ${res.extra} extra line(s)` : '';
    render(`<span class="wrong-msg">✗ line check: ${marks}${extra} — fix and resubmit</span>`, area.value);
  };

  render();
  ctrl = { key: () => false }; // textarea handles its own keys
}

function parsonsCtrl(container, trick, card, outcome, finish) {
  const puzzle = makePuzzle(trick.code, seedFor(trick.id, card.reps));
  let arrangement = puzzle.order.slice();
  let sel = 0;
  let grabbed = false;

  const render = (msg = '') => {
    container.innerHTML = `
      ${exerciseHeader(trick, 'parsons')}
      <div class="ex-when">💡 ${esc(trick.when)}</div>
      ${renderParsons(puzzle, arrangement, sel, grabbed)}
      <div class="ex-msg">${msg}</div>
      <div class="ex-actions">
        <button class="btn" id="btn-reveal">Give up</button>
        <button class="btn primary" id="btn-submit">Submit <kbd>⏎</kbd></button>
      </div>`;
    document.getElementById('btn-submit').addEventListener('click', submit);
    document.getElementById('btn-reveal').addEventListener('click', () => { outcome.revealed = true; finish(); });
    for (const line of container.querySelectorAll('.parsons-line')) {
      line.addEventListener('click', () => {
        const pos = parseInt(line.dataset.pos, 10);
        if (grabbed && pos !== sel) {
          const [moved] = arrangement.splice(sel, 1);
          arrangement.splice(pos, 0, moved);
          grabbed = false;
        }
        sel = pos;
        render();
      });
    }
  };

  const submit = () => {
    if (isSolved(puzzle, arrangement)) return finish();
    outcome.wrong += 1;
    if (outcome.wrong >= 2) { outcome.revealed = true; return finish(); }
    render(`<span class="wrong-msg">✗ ${correctCount(puzzle, arrangement)}/${puzzle.lines.length} lines in place — try again</span>`);
  };

  render();
  ctrl = {
    key(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const dir = e.key === 'ArrowUp' ? -1 : 1;
        const to = sel + dir;
        if (to < 0 || to >= arrangement.length) return true;
        if (grabbed) {
          [arrangement[sel], arrangement[to]] = [arrangement[to], arrangement[sel]];
        }
        sel = to;
        render();
        return true;
      }
      if (e.key === ' ') { grabbed = !grabbed; render(); return true; }
      if (e.key === 'Enter') { submit(); return true; }
      return false;
    },
  };
}

function mcqCtrl(container, trick, kind, q, outcome, finish) {
  const render = (state) => {
    container.innerHTML = `
      ${exerciseHeader(trick, kind)}
      ${renderMcq(q, state)}
      <div class="ex-msg">${state && state.revealed && q.why ? `<span class="why">${esc(q.why)}</span>` : ''}</div>`;
    for (const opt of container.querySelectorAll('.mcq-opt')) {
      opt.addEventListener('click', () => choose(parseInt(opt.dataset.idx, 10)));
    }
  };

  const choose = (i) => {
    if (i === q.answer) return finish();
    outcome.wrong += 1;
    render({ chosen: i, revealed: true, answer: q.answer });
    setTimeout(finish, 1400); // let the correction sink in
  };

  render();
  ctrl = {
    key(e) {
      if (/^[1-4]$/.test(e.key)) { choose(parseInt(e.key, 10) - 1); return true; }
      return false;
    },
  };
}

// Post-answer reinforcement: verdict + the full trick card + next interval.
function showReveal(container, trick, rating, card, onNext) {
  const verdictCls = { 1: 'r-again', 2: 'r-hard', 3: 'r-good', 4: 'r-easy' }[rating];
  const verdictIcon = rating === RATING.AGAIN ? '✗' : '✓';
  container.innerHTML = `
    <div class="reveal">
      <div class="verdict ${verdictCls}">${verdictIcon} ${RATING_NAMES[rating]} — next review in ${formatMs(card.due - now())}</div>
      <div class="reveal-name">${esc(trick.name)}</div>
      ${renderTrickCard(trick, save, { showProblems: rating === RATING.AGAIN })}
      <div class="ex-actions"><button class="btn primary" id="btn-next">Continue <kbd>⏎</kbd></button></div>
    </div>`;
  container.querySelector('#btn-next').addEventListener('click', onNext);
  wireProblemChecks(() => {});
  ctrl = { key(e) { if (e.key === 'Enter') { onNext(); return true; } return false; } };
}

// --- stats ------------------------------------------------------------------------------------

function renderStats() {
  const t = now();
  const cards = Object.values(save.cards);
  const learned = Object.keys(save.learned).length;
  const due = dueCount(save, t);
  const streak = streakDays(save.reviewLog, t);
  const recent = save.reviewLog.slice(-100);
  const retention = recent.length
    ? Math.round((recent.filter((r) => r.rating > RATING.AGAIN).length / recent.length) * 100)
    : null;
  const states = { learning: 0, review: 0 };
  for (const c of cards) if (states[c.state] !== undefined) states[c.state] += 1;
  const solvedCount = Object.keys(save.solved).length;

  const worldRows = WORLDS.map((w) => {
    const s = worldStats(w);
    const pct = Math.round((s.learned / s.total) * 100);
    return `<div class="stat-world"><span class="stat-world-name">${w.icon} ${esc(w.name)}</span>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="stat-world-n">${s.learned}/${s.total}</span></div>`;
  });

  // 8-week heatmap of review counts
  const dayCounts = new Map();
  for (const r of save.reviewLog) {
    const d = Math.floor(r.at / 86400000);
    dayCounts.set(d, (dayCounts.get(d) || 0) + 1);
  }
  const today = Math.floor(t / 86400000);
  const cells = [];
  for (let i = 55; i >= 0; i--) {
    const n = dayCounts.get(today - i) || 0;
    const lvl = n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : 3;
    cells.push(`<span class="hm hm-${lvl}" title="${n} reviews"></span>`);
  }

  app.innerHTML = `<div class="screen">
    ${topbar('', '📊 Stats')}
    <div class="tiles">
      <div class="tile"><div class="tile-n">${streak}🔥</div><div class="tile-l">day streak</div></div>
      <div class="tile"><div class="tile-n">${learned}/${ALL_TRICKS.length}</div><div class="tile-l">tricks learned</div></div>
      <div class="tile"><div class="tile-n">${due}</div><div class="tile-l">due now</div></div>
      <div class="tile"><div class="tile-n">${save.reviewLog.length}</div><div class="tile-l">total reviews</div></div>
      <div class="tile"><div class="tile-n">${retention === null ? '—' : retention + '%'}</div><div class="tile-l">recall (last 100)</div></div>
      <div class="tile"><div class="tile-n">${solvedCount}</div><div class="tile-l">problems checked off</div></div>
    </div>
    <div class="group-title">Last 8 weeks</div>
    <div class="heatmap">${cells.join('')}</div>
    <div class="group-title">Mastery by world</div>
    <div class="stat-worlds">${worldRows.join('')}</div>
  </div>`;
  wireTopbar('');
  ctrl = { key(e) { if (e.key === 'Escape') { location.hash = ''; return true; } return false; } };
}

route();
