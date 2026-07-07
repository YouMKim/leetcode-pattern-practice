// World: Dict & Set tricks (Python toolbelt)

export const DICT_TRICKS = [
  {
    id: 'dict/defaultdict',
    name: 'defaultdict grouping',
    when: 'Group items into buckets without checking "is the key there yet?"',
    code: [
      'from collections import defaultdict',
      'groups = {{defaultdict(list)}}',
      'for word in words:',
      '    key = {{tuple(sorted(word))}}    # anagram signature',
      '    groups[key]{{.append(word)}}',
    ],
    bigO: { time: 'O(1) avg per access', space: 'O(n)' },
    gotchas: [
      'READING a missing key creates it — even `if groups[k]:` inserts an entry',
      'defaultdict(int) is an instant counter: d[k] += 1 just works',
    ],
    quiz: [
      {
        q: "groups = defaultdict(list); groups['new'] returns…",
        options: ['KeyError', 'None', '[]', '0'],
        answer: 2,
        why: 'The factory (list) runs on first access and stores the result.',
      },
    ],
    problems: [
      { title: 'Group Anagrams', diff: 'M', slug: 'group-anagrams' },
      { title: 'Valid Anagram', diff: 'E', slug: 'valid-anagram' },
      { title: 'Time Based Key-Value Store', diff: 'M', slug: 'time-based-key-value-store' },
    ],
  },
  {
    id: 'dict/counter',
    name: 'Counter',
    when: 'Frequency counts, "top k most common", or multiset comparison in one line',
    code: [
      'from collections import Counter',
      'freq = {{Counter(nums)}}',
      'top2 = freq{{.most_common(2)}}     # [(elem, count), ...]',
      'is_anagram = Counter(s) {{== Counter(t)}}',
    ],
    bigO: { time: 'O(n) build; most_common(k) O(n log k)', space: 'O(u) unique elements' },
    gotchas: [
      'Missing keys read as 0 — no KeyError (dict subclass)',
      'c1 - c2 drops zero/negative counts (multiset subtraction)',
      'most_common() with no argument sorts everything: O(u log u)',
    ],
    quiz: [
      {
        q: "Counter('aab')['z'] evaluates to…",
        options: ['KeyError', '0', 'None', '-1'],
        answer: 1,
        why: 'Counter returns 0 for missing elements instead of raising.',
      },
    ],
    problems: [
      { title: 'Valid Anagram', diff: 'E', slug: 'valid-anagram' },
      { title: 'Top K Frequent Elements', diff: 'M', slug: 'top-k-frequent-elements' },
      { title: 'Find All Anagrams in a String', diff: 'M', slug: 'find-all-anagrams-in-a-string' },
      { title: 'Task Scheduler', diff: 'M', slug: 'task-scheduler' },
    ],
  },
  {
    id: 'dict/seen-set',
    name: 'The seen-set',
    when: 'Detect duplicates or test membership while streaming — O(1) per check',
    code: [
      'seen = {{set()}}',
      'for x in nums:',
      '    if x {{in seen}}:',
      '        return True',
      '    seen{{.add(x)}}',
      'return False',
    ],
    bigO: { time: 'O(n)', space: 'O(n)' },
    gotchas: [
      "Lists can't go in a set — convert to tuple first",
      'x in set is O(1) avg; x in list is O(n) — the classic TLE fix',
    ],
    quiz: [
      {
        q: '`x in container` is O(1) average for which container?',
        options: ['list', 'tuple', 'set', 'str'],
        answer: 2,
        why: 'Sets and dicts hash; lists/tuples/strings scan linearly.',
      },
    ],
    problems: [
      { title: 'Contains Duplicate', diff: 'E', slug: 'contains-duplicate' },
      { title: 'Longest Consecutive Sequence', diff: 'M', slug: 'longest-consecutive-sequence' },
      { title: 'Happy Number', diff: 'E', slug: 'happy-number' },
      { title: 'Linked List Cycle', diff: 'E', slug: 'linked-list-cycle' },
    ],
  },
  {
    id: 'dict/complement',
    name: 'Complement lookup',
    when: 'Find a pair hitting a target in ONE pass — store what you have, look up what you need',
    code: [
      'idx = {}',
      'for i, x in enumerate(nums):',
      '    need = {{target - x}}',
      '    if need {{in idx}}:',
      '        return [idx[need], i]',
      '    idx[x] = {{i}}',
    ],
    bigO: { time: 'O(n)', space: 'O(n)' },
    gotchas: [
      'Insert AFTER checking — otherwise x can pair with itself',
      'Same skeleton solves "subarray sum = k" with prefix sums as keys',
    ],
    quiz: [
      {
        q: 'Why insert into the map only after the lookup?',
        options: [
          'It is faster',
          'So an element cannot match itself',
          'dicts forbid self-reference',
          'To keep insertion order',
        ],
        answer: 1,
        why: 'With target 8 and x=4, inserting first would "find" the same 4.',
      },
    ],
    problems: [
      { title: 'Two Sum', diff: 'E', slug: 'two-sum' },
      { title: 'Contains Duplicate II', diff: 'E', slug: 'contains-duplicate-ii' },
      { title: 'Subarray Sum Equals K', diff: 'M', slug: 'subarray-sum-equals-k' },
    ],
  },
  {
    id: 'dict/tuple-key',
    name: 'Hashable compound keys',
    when: 'Key a dict or set by a coordinate, a pair, or an entire state',
    code: [
      'visited.add({{(row, col)}})       # tuple, not list',
      'memo[{{(i, j)}}] = best',
      'pair_key = {{frozenset}}([a, b])   # unordered pair',
    ],
    bigO: { time: 'O(1) avg per op', space: 'O(size of key) to hash' },
    gotchas: [
      'Tuples are hashable only if everything inside them is',
      'frozenset makes (a,b) and (b,a) the SAME key — on purpose',
      'A list as a key raises TypeError: unhashable type',
    ],
    quiz: [
      {
        q: 'Which of these can be a dict key?',
        options: ['[1, 2]', '{1, 2}', '(1, 2)', "{'a': 1}"],
        answer: 2,
        why: 'Only immutable/hashable types qualify — tuple yes; list, set, dict no.',
      },
    ],
    problems: [
      { title: 'Number of Islands', diff: 'M', slug: 'number-of-islands' },
      { title: 'Detect Squares', diff: 'M', slug: 'detect-squares' },
      { title: 'Longest Increasing Path in a Matrix', diff: 'H', slug: 'longest-increasing-path-in-a-matrix' },
    ],
  },
  {
    id: 'dict/prefix-count',
    name: 'Prefix-sum + hashmap count',
    when: 'Count subarrays summing to k — pair the running sum with a map of sums already seen',
    code: [
      'count = 0',
      'prefix = 0',
      'seen = {0: 1}                       # empty prefix — crucial seed!',
      'for x in nums:',
      '    prefix += x',
      '    count += seen.get({{prefix - k}}, 0)   # earlier prefix that closes a k-sum',
      '    seen[prefix] = seen.get(prefix, 0) {{+ 1}}',
    ],
    bigO: { time: 'O(n)', space: 'O(n)' },
    gotchas: [
      'Seed {0: 1} or every subarray starting at index 0 goes uncounted',
      'Count AFTER looking up, insert AFTER counting — order matters with k = 0',
      'Variants: remainders mod k, count of odd elements, ones-vs-zeros balance',
    ],
    quiz: [
      {
        q: 'What does the {0: 1} seed represent?',
        options: [
          'A dummy value',
          'The empty prefix — so subarrays starting at index 0 can close against it',
          'The first element',
          'It prevents KeyError only',
        ],
        answer: 1,
        why: 'prefix − k == 0 means "the subarray from the very start sums to k".',
      },
    ],
    problems: [
      { title: 'Subarray Sum Equals K', diff: 'M', slug: 'subarray-sum-equals-k' },
      { title: 'Contiguous Array', diff: 'M', slug: 'contiguous-array' },
      { title: 'Continuous Subarray Sum', diff: 'M', slug: 'continuous-subarray-sum' },
      { title: 'Path Sum III', diff: 'M', slug: 'path-sum-iii' },
    ],
  },
];
