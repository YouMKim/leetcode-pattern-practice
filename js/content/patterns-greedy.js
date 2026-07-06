// World: Intervals, Greedy & Bits

export const GREEDY_TRICKS = [
  {
    id: 'greedy/merge-intervals',
    name: 'Sort-by-start interval merge',
    when: 'Collapse overlapping ranges into disjoint ones',
    code: [
      'intervals.sort(key=lambda iv: {{iv[0]}})     # by START',
      'merged = [intervals[0]]',
      'for s, e in intervals[1:]:',
      '    if s {{<= merged[-1][1]}}:                # overlaps the last',
      '        merged[-1][1] = {{max(merged[-1][1], e)}}',
      '    else:',
      '        merged.append([s, e])',
    ],
    bigO: { time: 'O(n log n)', space: 'O(n)' },
    gotchas: [
      'Sort by START for merging; sort by END for max-non-overlapping counting',
      'max() on the endpoint — a fully-contained interval must not SHRINK the merge',
      'Decide up front whether touching ([1,2],[2,3]) counts as overlap',
    ],
    quiz: [
      {
        q: 'For "pick the most non-overlapping intervals", sort by…',
        options: ['start', 'end', 'length', 'midpoint'],
        answer: 1,
        why: 'Greedy by earliest END leaves maximum room — the classic exchange argument.',
      },
    ],
    problems: [
      { title: 'Merge Intervals', diff: 'M', slug: 'merge-intervals' },
      { title: 'Insert Interval', diff: 'M', slug: 'insert-interval' },
      { title: 'Non-overlapping Intervals', diff: 'M', slug: 'non-overlapping-intervals' },
      { title: 'Meeting Rooms', diff: 'E', slug: 'meeting-rooms' },
    ],
  },
  {
    id: 'greedy/sweep-line',
    name: 'Sweep line (+1/−1 events)',
    when: 'Maximum simultaneous overlap — rooms needed, ongoing meetings, passengers aboard',
    code: [
      'events = []',
      'for s, e in intervals:',
      '    events.append((s, {{1}}))      # interval opens',
      '    events.append((e, {{-1}}))     # interval closes',
      'events.sort()',
      'cur = best = 0',
      'for _, delta in events:',
      '    cur += delta',
      '    best = max(best, cur)',
    ],
    bigO: { time: 'O(n log n)', space: 'O(n)' },
    gotchas: [
      'Tie order: at equal time, (t,−1) sorts before (t,+1) — touching intervals do not overlap, for free',
      'Alternative: sort starts and ends separately and walk two pointers',
      'Works for "car pooling"-style capacity checks with ±passenger counts',
    ],
    quiz: [
      {
        q: 'Meeting Rooms II (min rooms) equals…',
        options: [
          'The number of intervals',
          'The maximum number of simultaneously open intervals',
          'Total duration / day length',
          'The number of merges',
        ],
        answer: 1,
        why: 'Each simultaneous meeting needs its own room — the sweep peak is the answer.',
      },
    ],
    problems: [
      { title: 'Meeting Rooms II', diff: 'M', slug: 'meeting-rooms-ii' },
      { title: 'Car Pooling', diff: 'M', slug: 'car-pooling' },
      { title: 'Minimum Number of Arrows to Burst Balloons', diff: 'M', slug: 'minimum-number-of-arrows-to-burst-balloons' },
    ],
  },
  {
    id: 'greedy/kadane',
    name: "Kadane's algorithm",
    when: 'Maximum-sum contiguous subarray in one pass',
    code: [
      'best = cur = nums[0]',
      'for x in nums[1:]:',
      '    cur = {{max(x, cur + x)}}     # extend the run, or restart at x',
      '    best = max(best, cur)',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'max(x, cur+x): restart whenever the running sum is dead weight',
      'All-negative arrays work BECAUSE we seed with nums[0], not 0',
      'Max PRODUCT needs both a running max and min — negatives flip them',
    ],
    quiz: [
      {
        q: 'Seeding best = cur = 0 breaks which input?',
        options: ['All positive', 'All negative', 'Single element', 'Sorted'],
        answer: 1,
        why: 'With all negatives the answer is the largest element, but a 0 seed would return 0.',
      },
    ],
    problems: [
      { title: 'Maximum Subarray', diff: 'M', slug: 'maximum-subarray' },
      { title: 'Maximum Product Subarray', diff: 'M', slug: 'maximum-product-subarray' },
      { title: 'Best Time to Buy and Sell Stock', diff: 'E', slug: 'best-time-to-buy-and-sell-stock' },
    ],
  },
  {
    id: 'greedy/xor',
    name: 'XOR cancellation',
    when: 'Find the element WITHOUT a pair — duplicates annihilate, zero extra memory',
    code: [
      'lonely = 0',
      'for x in nums:',
      '    lonely {{^= x}}              # a ^ a = 0, a ^ 0 = a',
      '',
      '# missing number in 0..n:',
      'res = len(nums)',
      'for i, x in enumerate(nums):',
      '    res ^= {{i ^ x}}',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'a^a=0, a^0=a, and order never matters — that is the whole engine',
      'The missing-number variant XORs indices against values; everything pairs off except the gap',
    ],
    quiz: [
      {
        q: '5 ^ 5 ^ 3 evaluates to…',
        options: ['0', '3', '5', '13'],
        answer: 1,
        why: 'The 5s cancel to 0, and 0 ^ 3 = 3.',
      },
    ],
    problems: [
      { title: 'Single Number', diff: 'E', slug: 'single-number' },
      { title: 'Missing Number', diff: 'E', slug: 'missing-number' },
      { title: 'Single Number III', diff: 'M', slug: 'single-number-iii' },
    ],
  },
  {
    id: 'greedy/bit-basics',
    name: 'n & (n−1) and friends',
    when: 'Count set bits, test powers of two, isolate the lowest one-bit',
    code: [
      'is_pow2 = n > 0 and n & {{(n - 1)}} == 0',
      '',
      'count = 0',
      'while n:',
      '    n &= {{n - 1}}               # clears the LOWEST set bit',
      '    count += 1',
      '',
      'lowest_bit = n & {{-n}}',
    ],
    bigO: { time: 'O(number of set bits)', space: 'O(1)' },
    gotchas: [
      'n & (n−1) clears exactly the lowest set bit — powers of two have only one',
      'n & −n isolates that bit (two’s complement magic)',
      'Python ints never overflow — mask with 0xFFFFFFFF to simulate 32-bit',
    ],
    quiz: [
      {
        q: 'The loop `while n: n &= n - 1` runs how many times for n = 7?',
        options: ['1', '2', '3', '7'],
        answer: 2,
        why: '7 is 0b111 — three set bits, one cleared per iteration.',
      },
    ],
    problems: [
      { title: 'Number of 1 Bits', diff: 'E', slug: 'number-of-1-bits' },
      { title: 'Counting Bits', diff: 'E', slug: 'counting-bits' },
      { title: 'Power of Two', diff: 'E', slug: 'power-of-two' },
      { title: 'Reverse Bits', diff: 'E', slug: 'reverse-bits' },
    ],
  },
];
