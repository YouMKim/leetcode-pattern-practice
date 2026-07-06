# 📖 LeetCode Grimoire

A browser game that burns **every useful LeetCode trick** into your memory with real spaced repetition — the sequel to [terminal-skills-game](https://github.com/YouMKim/terminal-skills-game).

**65 tricks · 13 worlds · 4 exercise types · FSRS scheduling · ~230 curated problem links.** All Python, all offline, zero dependencies.

## How it works

1. **Learn** a trick from its reference card: when to use it, the annotated template, time/space complexity, the gotchas that bite people, and 3–5 curated LeetCode problems to apply it on.
2. A quick practice rep starts its **FSRS clock** (the same algorithm family as Anki — stability/difficulty per card, ~90% target retention).
3. When tricks come **due**, the 🔮 Review queue drills you with a rotating exercise per rep:
   - ⌨️ **Cloze** — the template with a key expression blanked out; type it from memory (the hidden blank rotates every review)
   - 🧩 **Parsons** — the template's lines shuffled; restore the order
   - ❓ **Quiz** — Big-O and gotcha questions
   - 🔍 **Which trick?** — a problem cue → pick the right pattern (the real interview meta-skill)
4. Grading is **objective**, not self-reported: clean & fast = Easy, clean = Good, needed a retry/hint = Hard, missed = Again (and the card comes back at the end of the session).

Progress lives in localStorage (with JSON export/import for backup). Problem checkboxes track which linked LeetCode problems you've actually solved.

## The curriculum

**The Toolbelt (Python):**
| World | Tricks |
|---|---|
| 📜 List & Array | slicing/negative indexing · sort with key · matrix-init aliasing bug · enumerate/zip · prefix sums |
| 🗝️ Dict & Set | defaultdict grouping · Counter · seen-set · complement lookup (two-sum) · hashable compound keys |
| 🔤 Strings | ''.join building · 26-slot count array · two-pointer palindrome · split/strip · list(s) mutation |
| 🥞 Stack & Deque | list-as-stack · matched pairs · **monotonic stack** · deque · min-stack |
| ⛰️ Heaps | heapq essentials · max-heap negation · size-k top-k · tuple priorities · two-heaps median |

**The Patterns (algorithms):**
| World | Tricks |
|---|---|
| 🤏 Two Pointers & Windows | opposite ends · fast/slow · fixed window · shrinking window · reader/writer |
| 🎯 Binary Search | classic · leftmost/bisect_left · **search on the answer** · rotated arrays · bisect module |
| 🌳 Trees: DFS & BFS | recursive DFS · **iterative DFS** · BFS level-order · grid flood fill · BST bounds |
| 🕸️ Graphs | adjacency building · BFS shortest path · **union-find** · Kahn's toposort · Dijkstra |
| 🔙 Backtracking | choose/explore/un-choose · subsets · permutations · start-index combinations · sort+skip dedupe |
| 🧮 Dynamic Programming | @cache memoization · rolling 1-D · 2-D grid (LCS) · 0/1 knapsack loop order · LIS in O(n log n) |
| ⚡ Intervals, Greedy & Bits | interval merge · sweep line · Kadane · XOR cancellation · n&(n−1) |
| 🔗 Linked Lists | dummy head · in-place reversal · Floyd's cycle entry · sorted merge · runner pointer |

## Play

**Locally** (ES modules need a server):

```sh
cd leetcode-grimoire
python3 -m http.server 8000
# open http://localhost:8000
```

Or deploy to GitHub Pages — it's a static site; the included workflow tests and deploys the `gh-pages` branch on every push to `main`.

## Project layout

```
index.html · css/style.css
js/
  main.js            routing, screens, exercise controllers
  state.js           localStorage save + export/import
  engine/
    fsrs.js          compact FSRS v4.5 scheduler (pure, node-testable)
    cloze.js         {{blank}} template parsing + grading
    parsons.js       line-shuffle puzzles
    session.js       due queue, exercise rotation, objective grading
  ui/cards.js        HTML renderers
  content/           13 world files + schema validation — ADD TRICKS HERE
tests/
  smoke.mjs          engine math + full content validation (node tests/smoke.mjs)
  dom-smoke.mjs      end-to-end learn/review flows against a fake DOM
```

Adding a trick = one object in a `js/content/*.js` file (template with `{{blanks}}`, Big-O, gotchas, quiz, problem links). The schema validator in the test suite catches malformed content in CI.

## Ideas for later

- Per-trick "explain it back" mode (type the when-to-use from memory)
- Import solved-problem history from LeetCode
- Trick dependencies (union-find suggests learning adjacency lists first)
- A daily-challenge mode mixing due reviews with one new trick
