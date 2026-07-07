// World: List & Array tricks (Python toolbelt)

export const LIST_TRICKS = [
  {
    id: 'list/slicing',
    name: 'Slicing & negative indexing',
    when: 'Grab a subarray, the last k elements, or a reversed copy in one expression',
    code: [
      'arr = [1, 2, 3, 4, 5]',
      'last = arr{{[-1]}}            # last element',
      'first_three = arr{{[:3]}}     # [1, 2, 3]',
      'last_two = arr[-2:]          # [4, 5]',
      'rev = arr{{[::-1]}}           # reversed COPY',
    ],
    bigO: { time: 'O(k) for a slice of length k', space: 'O(k) — slices copy' },
    gotchas: [
      'Slices COPY — arr[::-1] allocates a whole new list',
      'arr[a:b] excludes index b (half-open, like range)',
      "Out-of-range slices don't raise: [1,2][5:] == []",
    ],
    quiz: [
      {
        q: 'What does arr[::-1] cost in extra space?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answer: 2,
        why: 'Every slice builds a new list — reversed() or two pointers avoid the copy.',
      },
    ],
    problems: [
      { title: 'Reverse String', diff: 'E', slug: 'reverse-string' },
      { title: 'Rotate Array', diff: 'M', slug: 'rotate-array' },
      { title: 'Merge Sorted Array', diff: 'E', slug: 'merge-sorted-array' },
    ],
  },
  {
    id: 'list/sort-key',
    name: 'Sort with a key function',
    when: 'Order items by a custom criterion — second field, length, count descending',
    code: [
      'pairs.sort(key={{lambda p: p[1]}})       # by second field',
      'words.sort(key=len, {{reverse=True}})    # longest first',
      '# by count desc, then alphabetically asc:',
      'items.sort(key=lambda x: ({{-count[x]}}, x))',
    ],
    bigO: { time: 'O(n log n)', space: 'O(n) (Timsort)' },
    gotchas: [
      '.sort() is in-place and returns None; sorted() returns a new list',
      'Negate a numeric key field for descending on that field only',
      'Python sort is STABLE — equal keys keep their input order',
    ],
    quiz: [
      {
        q: 'What does nums.sort() return?',
        options: ['the sorted list', 'None', 'an iterator', 'a sorted copy'],
        answer: 1,
        why: 'In-place methods return None — a classic bug in one-liners.',
      },
    ],
    problems: [
      { title: 'Merge Intervals', diff: 'M', slug: 'merge-intervals' },
      { title: 'Top K Frequent Elements', diff: 'M', slug: 'top-k-frequent-elements' },
      { title: 'Largest Number', diff: 'M', slug: 'largest-number' },
      { title: 'K Closest Points to Origin', diff: 'M', slug: 'k-closest-points-to-origin' },
    ],
  },
  {
    id: 'list/matrix-init',
    name: 'Matrix init without the aliasing bug',
    when: 'You need an m×n grid of zeros (DP tables, visited grids)',
    code: [
      '# WRONG: m references to ONE row',
      'bad = [[0] * n]{{ * m}}',
      '# RIGHT: a fresh row per iteration',
      'grid = [[0] * n {{for _ in range(m)}}]',
      'grid[0][0] = 1     # only one cell changes',
    ],
    bigO: { time: 'O(m·n)', space: 'O(m·n)' },
    gotchas: [
      '[[0]*n]*m: writing grid[0][0] "writes" every row — they are the same list',
      '[0]*n itself is safe because ints are immutable',
    ],
    quiz: [
      {
        q: 'bad = [[0]*3]*2; bad[0][0] = 9 — what is bad[1][0]?',
        options: ['0', '9', 'None', 'IndexError'],
        answer: 1,
        why: 'Both rows are the same list object.',
      },
    ],
    problems: [
      { title: 'Unique Paths', diff: 'M', slug: 'unique-paths' },
      { title: 'Set Matrix Zeroes', diff: 'M', slug: 'set-matrix-zeroes' },
      { title: 'Game of Life', diff: 'M', slug: 'game-of-life' },
    ],
  },
  {
    id: 'list/enumerate-zip',
    name: 'enumerate & zip',
    when: 'Loop with both index and value, or walk two sequences in lockstep',
    code: [
      'for i, x in {{enumerate(arr)}}:',
      '    print(i, x)',
      'for a, b in {{zip(xs, ys)}}:',
      '    print(a + b)',
      'for prev, cur in zip(s, s[1:]):   # adjacent pairs',
      '    ...',
    ],
    bigO: { time: 'O(n)', space: 'O(1) extra (lazy iterators)' },
    gotchas: [
      'zip stops at the SHORTER sequence — silently',
      'zip(s, s[1:]) is the idiom for adjacent pairs',
      'enumerate(arr, 1) starts the index at 1',
    ],
    quiz: [
      {
        q: 'How many pairs does zip([1,2,3], [4,5]) yield?',
        options: ['2', '3', '5', 'it raises'],
        answer: 0,
        why: 'zip is bounded by the shortest input.',
      },
    ],
    problems: [
      { title: 'Two Sum', diff: 'E', slug: 'two-sum' },
      { title: 'Longest Common Prefix', diff: 'E', slug: 'longest-common-prefix' },
      { title: 'Is Subsequence', diff: 'E', slug: 'is-subsequence' },
    ],
  },
  {
    id: 'list/prefix-sum',
    name: 'Prefix sums',
    when: 'Answer many range-sum queries, or count subarrays hitting a target sum',
    code: [
      'prefix = [0]',
      'for x in arr:',
      '    prefix.append({{prefix[-1] + x}})',
      '# sum of arr[i:j]  (i inclusive, j exclusive):',
      'range_sum = {{prefix[j] - prefix[i]}}',
    ],
    bigO: { time: 'O(n) build, O(1) per query', space: 'O(n)' },
    gotchas: [
      'Seed with 0 so prefix[i] = sum of the first i elements',
      'Pair with a hashmap of {prefix → count} for "subarray sum equals k"',
    ],
    quiz: [
      {
        q: 'With prefix sums, sum(arr[2:7]) is…',
        options: ['prefix[7] - prefix[2]', 'prefix[6] - prefix[2]', 'prefix[7] - prefix[1]', 'prefix[5]'],
        answer: 0,
        why: 'Half-open on both structures: prefix[j] - prefix[i] covers arr[i:j].',
      },
    ],
    problems: [
      { title: 'Range Sum Query - Immutable', diff: 'E', slug: 'range-sum-query-immutable' },
      { title: 'Subarray Sum Equals K', diff: 'M', slug: 'subarray-sum-equals-k' },
      { title: 'Product of Array Except Self', diff: 'M', slug: 'product-of-array-except-self' },
      { title: 'Continuous Subarray Sum', diff: 'M', slug: 'continuous-subarray-sum' },
    ],
  },
  {
    id: 'list/cyclic-sort',
    name: 'Cyclic sort (index placement)',
    when: 'An array holds values 1..n (or 0..n) — every value has a home index; swap it there',
    code: [
      'i = 0',
      'while i < len(nums):',
      '    home = nums[i] - 1              # value v belongs at index v-1',
      '    if nums[i] != nums[{{home}}]:',
      '        nums[i], nums[home] = {{nums[home], nums[i]}}   # send it home',
      '    else:',
      '        {{i += 1}}                    # placed (or duplicate) — move on',
      '# afterwards: nums[i] != i+1 reveals the missing/duplicate',
    ],
    bigO: { time: 'O(n) — each swap places a value forever', space: 'O(1)' },
    gotchas: [
      'Only advance i when no swap happened — the swapped-in value may belong elsewhere',
      'Compare nums[i] != nums[home], not i != home — duplicates loop forever otherwise',
      'The follow-up scan finds missing numbers, duplicates, and first-missing-positive',
    ],
    quiz: [
      {
        q: 'Why is the while loop O(n) despite the swaps?',
        options: [
          'Swaps are O(0)',
          'Every swap puts at least one value in its final home — at most n swaps ever',
          'It is O(n²)',
          'Python optimizes swaps',
        ],
        answer: 1,
        why: 'Each element gets seated once; i only stalls when a seat gets filled.',
      },
    ],
    problems: [
      { title: 'Missing Number', diff: 'E', slug: 'missing-number' },
      { title: 'Find All Numbers Disappeared in an Array', diff: 'E', slug: 'find-all-numbers-disappeared-in-an-array' },
      { title: 'Set Mismatch', diff: 'E', slug: 'set-mismatch' },
      { title: 'First Missing Positive', diff: 'H', slug: 'first-missing-positive' },
    ],
  },
  {
    id: 'list/negation-marking',
    name: 'Negation marking (index as hash)',
    when: 'Values 1..n and O(1) space required — use the SIGN at index v−1 as a "seen" bit',
    code: [
      'for x in nums:',
      '    i = {{abs(x) - 1}}               # abs: x may already be flipped',
      '    if nums[i] > 0:',
      '        nums[i] = {{-nums[i]}}        # mark index i as seen',
      '    else:',
      '        dups.append(abs(x))          # second visit → duplicate',
      '# indices still positive were never visited → missing numbers',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'abs() everywhere — earlier iterations may have negated the value you read',
      'Destructive: restore with abs() at the end if the input must survive',
      'Needs strictly positive values in a known 1..n range',
    ],
    quiz: [
      {
        q: 'This trick fundamentally requires the values to be…',
        options: [
          'Sorted',
          'Positive and bounded by the array length',
          'Unique',
          'Even',
        ],
        answer: 1,
        why: 'Value v must map to a valid index, and the sign must be spare storage.',
      },
    ],
    problems: [
      { title: 'Find All Duplicates in an Array', diff: 'M', slug: 'find-all-duplicates-in-an-array' },
      { title: 'Find All Numbers Disappeared in an Array', diff: 'E', slug: 'find-all-numbers-disappeared-in-an-array' },
      { title: 'First Missing Positive', diff: 'H', slug: 'first-missing-positive' },
    ],
  },
];
