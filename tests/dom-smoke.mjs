// Integration smoke: boot the whole app against a mini fake DOM and play
// through learn + review flows with simulated clicks/keys.
// Run: node tests/dom-smoke.mjs

let failures = 0;
let count = 0;
function ok(cond, label) {
  count++;
  if (!cond) { failures++; console.error(`✗ ${label}`); }
}

// --- mini fake DOM -----------------------------------------------------------

const registry = new Map(); // id -> El
const winHandlers = { keydown: [], hashchange: [] };

class El {
  constructor(tag = 'div', attrs = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.dataset = {};
    this.value = '';
    this.textContent = '';
    this.style = {};
    this.children = [];
    this._html = '';
    this._handlers = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (k.startsWith('data-')) {
        this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
      }
    }
  }
  get className() { return this.attrs.class || ''; }
  set innerHTML(html) {
    this._html = html;
    this.children = [];
    // flat parse: every opening tag with its attributes becomes a child stub
    for (const m of html.matchAll(/<(\w+)((?:\s+[\w-]+="[^"]*")*)\s*\/?\s*>/g)) {
      const attrs = {};
      for (const am of m[2].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[am[1]] = am[2];
      const el = new El(m[1], attrs);
      this.children.push(el);
      if (attrs.id) registry.set(attrs.id, el);
    }
  }
  get innerHTML() { return this._html; }
  hasClass(c) { return this.className.split(/\s+/).includes(c); }
  querySelectorAll(sel) {
    if (sel.startsWith('.')) return this.children.filter((c) => c.hasClass(sel.slice(1)));
    if (sel.startsWith('#')) return this.children.filter((c) => c.attrs.id === sel.slice(1));
    return [];
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  addEventListener(type, fn) { (this._handlers[type] ||= []).push(fn); }
  fire(type, ev = {}) {
    ev.preventDefault ||= () => {};
    ev.target ||= this;
    for (const fn of this._handlers[type] || []) fn(ev);
  }
  click() { this.fire('click'); }
  focus() {}
  appendChild(c) { this.children.push(c); return c; }
  remove() {}
}

const appEl = new El('div', { id: 'app' });
registry.set('app', appEl);

globalThis.document = {
  getElementById: (id) => registry.get(id) || null,
  createElement: (tag) => new El(tag),
};
globalThis.window = {
  addEventListener: (type, fn) => { (winHandlers[type] ||= []).push(fn); },
};
globalThis.location = {
  _hash: '',
  get hash() { return this._hash; },
  set hash(v) {
    v = v.startsWith('#') ? v : v ? '#' + v : '';
    if (this._hash === v) return;
    this._hash = v;
    for (const fn of winHandlers.hashchange) fn({});
  },
};
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
};
globalThis.alert = () => {};
globalThis.confirm = () => true;

function pressGlobal(key) {
  for (const fn of winHandlers.keydown) fn({ key, preventDefault() {}, target: null });
}

// --- boot the app ---------------------------------------------------------------

const { RATING } = await import('../js/engine/fsrs.js');
await import('../js/main.js');

ok(appEl.innerHTML.includes('LEETCODE GRIMOIRE'), 'home renders title');
ok(appEl.querySelectorAll('.world-card').length === 13, 'home shows 13 worlds');

// --- learn flow: heap/max-heap ----------------------------------------------------

location.hash = 'world/heap';
ok(appEl.querySelectorAll('.trick-row').length === 5, 'heap world lists 5 tricks');

location.hash = 'trick/heap/1'; // Max-heap via negation
ok(appEl.innerHTML.includes('Max-heap via negation'), 'trick view renders');
ok(!!registry.get('btn-learn'), 'learn button present');

registry.get('btn-learn').click(); // start practice (cloze, blank 0 = "-num")
const input = registry.get('cloze-input');
ok(!!input, 'cloze exercise shows input');
input.value = '-num';
input.fire('keydown', { key: 'Enter' });

const saveAfterLearn = JSON.parse(storage.get('leetcode-grimoire-save-v1'));
const card = saveAfterLearn.cards['heap/max-heap'];
ok(!!card, 'learn creates an FSRS card');
ok(card.state === 'review', 'clean fast answer graduates immediately');
ok(card.reps === 1, 'card has one rep');
ok(!!saveAfterLearn.learned['heap/max-heap'], 'trick marked learned');
ok(registry.get('trick-view').innerHTML.includes('next review in'), 'reveal shows next interval');

registry.get('btn-next').click();
ok(location.hash === '#world/heap', 'continue returns to world');
ok(appEl.innerHTML.includes('in '), 'world row shows next-due status');

// --- wrong answer path: learn another trick and fail twice --------------------------

location.hash = 'trick/heap/0'; // heapq essentials
registry.get('btn-learn').click();
const input2 = registry.get('cloze-input');
input2.value = 'wrong-answer';
input2.fire('keydown', { key: 'Enter' });
ok(registry.get('trick-view').innerHTML.includes('not quite'), 'wrong answer shows retry message');
const input2b = registry.get('cloze-input');
input2b.value = 'still-wrong';
input2b.fire('keydown', { key: 'Enter' });

const save2 = JSON.parse(storage.get('leetcode-grimoire-save-v1'));
ok(save2.cards['heap/basics'].state === 'learning', 'two misses → Again → learning state');
registry.get('btn-next').click();

// --- review session -----------------------------------------------------------------

// Force both cards due now.
{
  const s = JSON.parse(storage.get('leetcode-grimoire-save-v1'));
  for (const c of Object.values(s.cards)) c.due = Date.now() - 1000;
  storage.set('leetcode-grimoire-save-v1', JSON.stringify(s));
}
// Reload the app state by re-navigating (save is module state — simulate fresh visit)
// The app keeps `save` in memory; our direct storage edit isn't visible to it.
// Instead: drive the in-memory path — set due via the app's own save by another review.
// Simpler: use location routing only for what the in-memory save knows.
// The learning-state card (heap/basics) is due in ~10 min, not now, so review
// via the in-memory app sees only what's genuinely due. To make the session
// testable we re-import the module fresh below.

delete globalThis.__grimoire; // (no-op, clarity)
location._hash = '#review';
// Re-fire route via hashchange handlers registered by the loaded module:
for (const fn of winHandlers.hashchange) fn({});

// The in-memory save still has heap/max-heap due far in the future and
// heap/basics due in ~10min, so the review screen should say nothing is due.
ok(appEl.innerHTML.includes('Nothing due') || appEl.innerHTML.includes('ex-head'), 'review screen renders');

// --- fresh import with a doctored save: full session walkthrough ---------------------

{
  // Build a save where two tricks are due NOW with different rep counts.
  const now = Date.now();
  const doctored = {
    version: 1,
    cards: {
      'heap/max-heap': { state: 'review', S: 4, D: 5, due: now - 5000, lastReview: now - 4 * 86400000, reps: 4, lapses: 0 },
      'dp/memoization': { state: 'review', S: 4, D: 5, due: now - 9000, lastReview: now - 4 * 86400000, reps: 2, lapses: 0 },
    },
    learned: { 'heap/max-heap': now - 8 * 86400000, 'dp/memoization': now - 8 * 86400000 },
    solved: {},
    reviewLog: [],
  };
  storage.set('leetcode-grimoire-save-v1', JSON.stringify(doctored));
}

// Fresh module instance sees the doctored save.
registry.clear();
registry.set('app', appEl);
winHandlers.keydown.length = 0;
winHandlers.hashchange.length = 0;
location._hash = '#review';
await import('../js/main.js?fresh=1');

ok(registry.get('session-count').textContent.includes('2 left'), 'session counter shows queue');

// Card 1: dp/memoization (older due first), reps=2 → quiz (rotation index 2).
const sessionEl = registry.get('session');
ok(sessionEl.innerHTML.includes('Quiz'), 'first exercise is the quiz (rotation by reps)');
// Its quiz: "Naive fib is O(2ⁿ). With @cache it becomes…" answer index 2.
pressGlobal('3');
ok(sessionEl.innerHTML.includes('Continue'), 'quiz answered → reveal');
pressGlobal('Enter');

// Card 2: heap/max-heap, reps=4 → cloze (4 % 4 = 0).
const clz = registry.get('cloze-input');
ok(!!clz, 'second exercise is cloze');
clz.value = '-num';
clz.fire('keydown', { key: 'Enter' });
pressGlobal('Enter'); // continue past reveal

ok(appEl.innerHTML.includes('Session complete'), 'session summary shown');
const finalSave = JSON.parse(storage.get('leetcode-grimoire-save-v1'));
ok(finalSave.reviewLog.length === 2, 'two reviews logged');
ok(finalSave.cards['dp/memoization'].reps === 3, 'dp card rep incremented');
ok(finalSave.cards['heap/max-heap'].due > Date.now(), 'reviewed card scheduled into the future');

pressGlobal('Enter');
ok(location.hash === '' || location.hash === '#', 'summary Enter goes home');

// --- stats screen ---------------------------------------------------------------------

location.hash = 'stats';
ok(appEl.innerHTML.includes('day streak'), 'stats renders streak tile');
ok(appEl.innerHTML.includes('Mastery by world'), 'stats renders world bars');

// --- report ------------------------------------------------------------------------------

if (failures) {
  console.error(`\n${failures}/${count} integration checks FAILED`);
  process.exit(1);
} else {
  console.log(`all ${count} integration checks passed ✔`);
}
