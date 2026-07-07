// World: Python Power-ups — stdlib weapons most people don't know they have

export const PYTHON_TRICKS = [
  {
    id: 'python/itertools',
    name: 'itertools arsenal',
    when: 'You are hand-rolling nested loops for combinations, permutations or cartesian products',
    code: [
      'from itertools import product, permutations, combinations, accumulate',
      'list(product("ab", "12"))            # a1 a2 b1 b2 (cartesian)',
      'list({{permutations}}(nums, 2))       # ordered pairs',
      'list({{combinations}}(nums, 2))       # unordered pairs, i < j',
      'prefix = list({{accumulate}}(nums))   # running sums in one call',
    ],
    bigO: { time: 'output-sized (lazy iterators)', space: 'O(1) until materialized' },
    gotchas: [
      'These are lazy — wrap in list() only when you need everything at once',
      'product(range(2), repeat=n) enumerates all n-bit choices — subsets!',
      'In interviews, say you COULD write the backtracking version — then use the library',
    ],
    quiz: [
      {
        q: 'combinations([1,2,3], 2) yields how many items?',
        options: ['3', '6', '9', '8'],
        answer: 0,
        why: 'C(3,2) = 3 unordered pairs; permutations would give 6.',
      },
    ],
    problems: [
      { title: 'Letter Combinations of a Phone Number', diff: 'M', slug: 'letter-combinations-of-a-phone-number' },
      { title: 'Combinations', diff: 'M', slug: 'combinations' },
      { title: 'Range Sum Query - Immutable', diff: 'E', slug: 'range-sum-query-immutable' },
    ],
  },
  {
    id: 'python/cmp-to-key',
    name: 'cmp_to_key custom comparator',
    when: 'The sort order depends on comparing PAIRS (a+b vs b+a) — no simple key exists',
    code: [
      'from functools import {{cmp_to_key}}',
      'def compare(a, b):',
      '    if a + b > b + a:                # concatenation order',
      '        return {{-1}}                  # a first',
      '    return 1',
      'nums.sort(key={{cmp_to_key(compare)}})',
    ],
    bigO: { time: 'O(n log n) comparisons', space: 'O(n)' },
    gotchas: [
      'Return negative = a first, positive = b first, 0 = equal — C-style',
      'Largest Number is THE canonical use: "3"+"30" vs "30"+"3"',
      'Prefer a key function when one exists — comparators are the escape hatch',
    ],
    quiz: [
      {
        q: 'A comparator returning -1 means…',
        options: ['b sorts first', 'a sorts first', 'they are equal', 'skip both'],
        answer: 1,
        why: 'Negative = "a is smaller" = a comes earlier in ascending sort.',
      },
    ],
    problems: [
      { title: 'Largest Number', diff: 'M', slug: 'largest-number' },
      { title: 'Sort the People', diff: 'E', slug: 'sort-the-people' },
      { title: 'Custom Sort String', diff: 'M', slug: 'custom-sort-string' },
    ],
  },
  {
    id: 'python/sortedlist',
    name: 'SortedList (sortedcontainers)',
    when: 'You need a sorted collection with O(log n) insert AND delete — Python has no TreeMap, but LeetCode preinstalls this',
    code: [
      'from sortedcontainers import {{SortedList}}',
      'sl = SortedList()',
      'sl.add(x)                        # O(log n), stays sorted',
      'sl.remove(x)                     # O(log n)',
      'i = sl.{{bisect_left}}(x)         # rank queries',
      'smallest, largest = sl[0], sl{{[-1]}}',
    ],
    bigO: { time: 'O(log n) add/remove/index', space: 'O(n)' },
    gotchas: [
      'bisect.insort on a plain list is O(n) per insert — SortedList fixes exactly that',
      'Preinstalled on LeetCode; in real projects: pip install sortedcontainers',
      'Supports indexing sl[k] — kth smallest for free',
    ],
    quiz: [
      {
        q: 'Sliding-window median wants add+remove per step. Best structure in Python?',
        options: ['list + insort', 'SortedList', 'heapq alone', 'dict'],
        answer: 1,
        why: 'Both operations are O(log n); a heap cannot delete arbitrary values cheaply.',
      },
    ],
    problems: [
      { title: 'Sliding Window Median', diff: 'H', slug: 'sliding-window-median' },
      { title: 'Count of Smaller Numbers After Self', diff: 'H', slug: 'count-of-smaller-numbers-after-self' },
      { title: 'My Calendar I', diff: 'M', slug: 'my-calendar-i' },
      { title: 'Contains Duplicate III', diff: 'H', slug: 'contains-duplicate-iii' },
    ],
  },
  {
    id: 'python/zip-transpose',
    name: 'zip(*matrix) transpose',
    when: 'You need columns of a grid, or a transpose, without index gymnastics',
    code: [
      'cols = list({{zip(*grid)}})          # rows become tuples of columns',
      'for col in zip(*grid):',
      '    process(col)',
      '# rotate 90° clockwise in one line:',
      'rotated = [list(row) for row in zip(*{{grid[::-1]}})]',
    ],
    bigO: { time: 'O(rows·cols)', space: 'O(rows·cols)' },
    gotchas: [
      'The * unpacks rows as separate arguments — zip then walks them in lockstep',
      'Yields TUPLES — wrap in list() if you need mutability',
      'zip(*g[::-1]) rotates clockwise; zip(*g) then reverse rotates counter-clockwise',
    ],
    quiz: [
      {
        q: 'zip(*[[1,2],[3,4]]) yields…',
        options: ['(1,2),(3,4)', '(1,3),(2,4)', '(4,3),(2,1)', 'an error'],
        answer: 1,
        why: 'Rows in, columns out — the transpose.',
      },
    ],
    problems: [
      { title: 'Transpose Matrix', diff: 'E', slug: 'transpose-matrix' },
      { title: 'Rotate Image', diff: 'M', slug: 'rotate-image' },
      { title: 'Longest Common Prefix', diff: 'E', slug: 'longest-common-prefix' },
    ],
  },
  {
    id: 'python/idioms',
    name: 'inf / divmod / chained comparisons',
    when: 'Small idioms that clean up nearly every solution',
    code: [
      'best = {{float("inf")}}              # sentinel that any real value beats',
      'q, r = {{divmod(total, size)}}        # quotient and remainder together',
      'if 0 <= r < rows and 0 <= c < cols:  # chained bounds check',
      '    ...',
      'a, b = b, {{a + b}}                   # tuple swap/step (fibonacci)',
    ],
    bigO: { time: 'O(1)', space: 'O(1)' },
    gotchas: [
      "float('inf') survives min()/max() seeding; math.inf is the same thing",
      'divmod(i, cols) converts a flat index to (row, col) in one call',
      'Chained comparisons evaluate once per operand — and read like math',
    ],
    quiz: [
      {
        q: 'divmod(17, 5) returns…',
        options: ['(3, 2)', '(2, 3)', '3.4', '(5, 2)'],
        answer: 0,
        why: '17 // 5 = 3 and 17 % 5 = 2, as a tuple.',
      },
    ],
    problems: [
      { title: 'Coin Change', diff: 'M', slug: 'coin-change' },
      { title: 'Search a 2D Matrix', diff: 'M', slug: 'search-a-2d-matrix' },
      { title: 'Excel Sheet Column Title', diff: 'E', slug: 'excel-sheet-column-title' },
    ],
  },
  {
    id: 'python/min-max-key',
    name: 'min/max with key (argmax)',
    when: 'The most frequent / closest / longest item — argmax in one call, no sort',
    code: [
      'most_common = max(freq, key={{freq.get}})    # argmax over a dict',
      'closest = min(points, key=lambda p: {{p[0]**2 + p[1]**2}})',
      'longest = max(words, key={{len}})',
      'smallest_pair = min(pairs)                  # tuples compare lexicographically',
    ],
    bigO: { time: 'O(n) — beats sorting for a single winner', space: 'O(1)' },
    gotchas: [
      'max(d) maxes the KEYS; max(d, key=d.get) maxes by VALUE — huge difference',
      'One winner? min/max with key. Top k? heapq.nlargest. Everything? sort.',
      'Ties: returns the FIRST winner encountered',
    ],
    quiz: [
      {
        q: "freq = {'a': 3, 'z': 1}; max(freq) returns…",
        options: ["'a'", "'z'", '3', "('z', 1)"],
        answer: 1,
        why: "Plain max iterates the KEYS — 'z' > 'a'. You wanted key=freq.get.",
      },
    ],
    problems: [
      { title: 'Top K Frequent Elements', diff: 'M', slug: 'top-k-frequent-elements' },
      { title: 'Sort Characters By Frequency', diff: 'M', slug: 'sort-characters-by-frequency' },
      { title: 'Majority Element', diff: 'E', slug: 'majority-element' },
    ],
  },
  {
    id: 'python/circular-mod',
    name: 'Negative-safe % for circular arrays',
    when: 'Wrap around array ends — Python’s % is always non-negative, unlike C/Java',
    code: [
      'prev = (i - 1) {{% n}}               # -1 % n == n-1 in Python!',
      'nxt = (i + 1) % n',
      '# circular scan: walk the array twice, index by mod',
      'for k in range({{2 * n}}):',
      '    i = k % n',
      '    ...',
    ],
    bigO: { time: 'O(1) per wrap', space: 'O(1)' },
    gotchas: [
      'Python: -1 % 5 == 4 (non-negative). C/Java: -1 % 5 == -1 — port carefully',
      'The 2n scan handles "circular next greater element" with the plain monotonic stack',
      'Rotating by k: index (i + k) % n, or slice tricks nums[-k:] + nums[:-k]',
    ],
    quiz: [
      {
        q: 'In Python, (-1) % 5 evaluates to…',
        options: ['-1', '4', '1', 'ValueError'],
        answer: 1,
        why: 'Python’s modulo takes the sign of the DIVISOR — perfect for circular indexing.',
      },
    ],
    problems: [
      { title: 'Next Greater Element II', diff: 'M', slug: 'next-greater-element-ii' },
      { title: 'Rotate Array', diff: 'M', slug: 'rotate-array' },
      { title: 'Gas Station', diff: 'M', slug: 'gas-station' },
    ],
  },
];
