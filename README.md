# 📖 LeetCode Grimoire

A browser game that burns **every useful LeetCode trick** into your memory with real spaced repetition — the sequel to [terminal-skills-game](https://github.com/YouMKim/terminal-skills-game).

**119 tricks · 20 worlds · 5 exercise types · FSRS scheduling · ~400 curated problem links.** All Python, all offline, zero dependencies. The trick taxonomy is cross-checked against the standard pattern lists (the "41 patterns" guides, [seanprashad.com/leetcode-patterns](https://seanprashad.com/leetcode-patterns/), Grokking-style pattern courses).

## How it works

1. **Learn** a trick from its reference card: when to use it, the annotated template, time/space complexity, the gotchas that bite people, and 3–5 curated LeetCode problems to apply it on.
2. A quick practice rep starts its **FSRS clock** (the same algorithm family as Anki — stability/difficulty per card, ~90% target retention).
3. When tricks come **due**, the 🔮 Review queue drills you with a rotating exercise per rep — escalating from recognition to full reproduction:
   - ⌨️ **Cloze** — the template with EVERY key expression blanked out; type them from memory
   - 🧩 **Parsons** — the template's lines shuffled; restore the order
   - 🔥 **Type the whole template** — a blank editor; reproduce the entire snippet from memory (indentation/comments forgiven, content and order graded line by line)
   - ❓ **Quiz** — Big-O and gotcha questions
   - 🔍 **Which trick?** — a problem cue → pick the right pattern (the real interview meta-skill)
4. **Muscle memory is the point**: every OTHER review is a full template type-out (50% of all reps), and 🔥 **Drill modes** let you hammer any single template — or a whole world back-to-back — ungraded, as many times as you want.
5. Grading is **objective**, not self-reported: clean & fast = Easy, clean = Good, needed a retry/hint = Hard, missed = Again (and the card comes back at the end of the session).

Progress lives in localStorage (with JSON export/import for backup). Problem checkboxes track which linked LeetCode problems you've actually solved.

## The curriculum

**The Toolbelt (Python):**
| World | Tricks |
|---|---|
| 📜 List & Array | slicing · sort with key · matrix-init aliasing bug · enumerate/zip · prefix sums · **cyclic sort** · negation marking |
| 🗝️ Dict & Set | defaultdict · Counter · seen-set · complement lookup · compound keys · **prefix-sum + hashmap count** |
| 🔤 Strings | ''.join · 26-slot counts · two-pointer palindrome · split/strip · list(s) mutation · **expand around center** · rolling hash |
| 🥞 Stack & Deque | list-as-stack · matched pairs · **monotonic stack** · deque · min-stack · **monotonic deque (window max)** · nested decode |
| ⛰️ Heaps | heapq · max-heap negation · size-k top-k · tuple priorities · two-heaps median · **k-way merge** · lazy deletion |
| ⚗️ Python Power-ups | itertools · cmp_to_key · SortedList · zip(*m) transpose · inf/divmod idioms |

**The Patterns (algorithms):**
| World | Tricks |
|---|---|
| 🤏 Two Pointers & Windows | opposite ends · fast/slow · fixed window · shrinking window · reader/writer · Dutch flag |
| 🎯 Binary Search | classic · leftmost · **search on the answer** · rotated arrays · bisect · flat-2D indexing |
| 🌳 Trees: DFS & BFS | recursive DFS · **iterative DFS** · BFS levels · grid flood fill · BST bounds · LCA |
| 🔁 Recursive ⇄ Iterative | **inorder left-spine stack** · postorder via reversed preorder · the (node, expanded) frames recipe · graph DFS both ways · stack⇄queue flips DFS⇄BFS |
| 🕸️ Graphs | adjacency · BFS shortest path · **union-find** · toposort · Dijkstra · multi-source BFS · clone-with-map |
| 🔙 Backtracking | choose/explore/un-choose · subsets · permutations · start-index · sort+skip dedupe · N-queens sets |
| 🧮 Dynamic Programming | @cache · rolling 1-D · 2-D grid · knapsack loop order · LIS n log n · state machine · min-coins |
| ⚡ Intervals, Greedy & Bits | merge · sweep line · Kadane · XOR · n&(n−1) · **difference array** · furthest reach |
| 🔗 Linked Lists | dummy head · in-place reversal · Floyd's cycle entry · sorted merge · runner pointer |
| 🌲 Tries | TrieNode template · nested-dict trie · prefix search · wildcard DFS · board+trie pruning |
| 🧊 Matrix & Simulation | spiral bounds · rotate=transpose+flip · coordinate keys · in-place flags · state encoding |

**The Vault (deeper cuts):**
| World | Tricks |
|---|---|
| 🃏 Sorting & Selection | **quickselect** · bucket sort · counting sort · merge-from-the-back · merge sort on lists |
| 🎲 Math & Number Theory | Boyer-Moore vote · fast power · Euclid gcd · sieve · modular habits |
| 🧰 Design & Structures | LRU (OrderedDict) · O(1) swap-pop delete · tree serialization · length-prefix encoding · time-window deque |

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
