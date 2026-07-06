// World registry: order, names, icons — and a flat trick index.

import { LIST_TRICKS } from './toolbelt-list.js';
import { DICT_TRICKS } from './toolbelt-dict.js';
import { STRING_TRICKS } from './toolbelt-string.js';
import { STACK_TRICKS } from './toolbelt-stack.js';
import { HEAP_TRICKS } from './toolbelt-heap.js';
import { POINTERS_TRICKS } from './patterns-pointers.js';
import { BINSEARCH_TRICKS } from './patterns-binsearch.js';
import { TREES_TRICKS } from './patterns-trees.js';
import { GRAPHS_TRICKS } from './patterns-graphs.js';
import { BACKTRACKING_TRICKS } from './patterns-backtracking.js';
import { DP_TRICKS } from './patterns-dp.js';
import { GREEDY_TRICKS } from './patterns-greedy.js';
import { LINKEDLIST_TRICKS } from './patterns-linkedlist.js';

export const WORLDS = [
  // The Toolbelt — Python weapons
  { id: 'list', name: 'List & Array', icon: '📜', group: 'The Toolbelt', tricks: LIST_TRICKS },
  { id: 'dict', name: 'Dict & Set', icon: '🗝️', group: 'The Toolbelt', tricks: DICT_TRICKS },
  { id: 'string', name: 'Strings', icon: '🔤', group: 'The Toolbelt', tricks: STRING_TRICKS },
  { id: 'stack', name: 'Stack & Deque', icon: '🥞', group: 'The Toolbelt', tricks: STACK_TRICKS },
  { id: 'heap', name: 'Heaps', icon: '⛰️', group: 'The Toolbelt', tricks: HEAP_TRICKS },
  // The Patterns — algorithms
  { id: 'pointers', name: 'Two Pointers & Windows', icon: '🤏', group: 'The Patterns', tricks: POINTERS_TRICKS },
  { id: 'binsearch', name: 'Binary Search', icon: '🎯', group: 'The Patterns', tricks: BINSEARCH_TRICKS },
  { id: 'trees', name: 'Trees: DFS & BFS', icon: '🌳', group: 'The Patterns', tricks: TREES_TRICKS },
  { id: 'graphs', name: 'Graphs', icon: '🕸️', group: 'The Patterns', tricks: GRAPHS_TRICKS },
  { id: 'backtracking', name: 'Backtracking', icon: '🔙', group: 'The Patterns', tricks: BACKTRACKING_TRICKS },
  { id: 'dp', name: 'Dynamic Programming', icon: '🧮', group: 'The Patterns', tricks: DP_TRICKS },
  { id: 'greedy', name: 'Intervals, Greedy & Bits', icon: '⚡', group: 'The Patterns', tricks: GREEDY_TRICKS },
  { id: 'linkedlist', name: 'Linked Lists', icon: '🔗', group: 'The Patterns', tricks: LINKEDLIST_TRICKS },
];

export const ALL_TRICKS = WORLDS.flatMap((w) => w.tricks);

const BY_ID = new Map(ALL_TRICKS.map((t) => [t.id, t]));

export function trickById(id) {
  return BY_ID.get(id) || null;
}

export function worldOf(trickId) {
  const wid = trickId.split('/')[0];
  return WORLDS.find((w) => w.id === wid) || null;
}
