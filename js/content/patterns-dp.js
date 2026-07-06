// World: Dynamic Programming

export const DP_TRICKS = [
  {
    id: 'dp/memoization',
    name: '@cache memoization',
    when: 'A recursive solution keeps recomputing the same states — cache and it collapses to polynomial',
    code: [
      'from functools import {{cache}}',
      '',
      '@cache',
      'def ways(n):                 # climbing stairs',
      '    if n <= 2:',
      '        return n',
      '    return {{ways(n - 1) + ways(n - 2)}}',
    ],
    bigO: { time: 'O(states × work per state)', space: 'O(states)' },
    gotchas: [
      'Arguments must be hashable — tuples, not lists',
      '@cache is @lru_cache(maxsize=None) — Python 3.9+',
      'COUNT the distinct states first: that count IS your time complexity',
    ],
    quiz: [
      {
        q: 'Naive fib is O(2ⁿ). With @cache it becomes…',
        options: ['O(2ⁿ) still', 'O(n²)', 'O(n)', 'O(log n)'],
        answer: 2,
        why: 'n distinct states, O(1) work each once cached.',
      },
    ],
    problems: [
      { title: 'Climbing Stairs', diff: 'E', slug: 'climbing-stairs' },
      { title: 'House Robber', diff: 'M', slug: 'house-robber' },
      { title: 'Longest Common Subsequence', diff: 'M', slug: 'longest-common-subsequence' },
      { title: 'Target Sum', diff: 'M', slug: 'target-sum' },
    ],
  },
  {
    id: 'dp/rolling-1d',
    name: '1-D DP → rolling variables',
    when: 'The recurrence only looks back a fixed number of steps — shrink the whole table to two variables',
    code: [
      '# house-robber shape: dp[i] = max(dp[i-1], dp[i-2] + x)',
      'prev2, prev1 = 0, 0',
      'for x in nums:',
      '    prev2, prev1 = prev1, {{max(prev1, prev2 + x)}}',
      'return prev1',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'Write the full dp[] array version FIRST, then roll it up',
      'Tuple assignment updates both without a temp variable',
      'Rolling only works when the lookback window is fixed',
    ],
    quiz: [
      {
        q: 'Rolling variables reduce space from O(n) to…',
        options: ['O(log n)', 'O(1)', 'O(k)', 'It stays O(n)'],
        answer: 1,
        why: 'Only the last two values are ever read — keep exactly those.',
      },
    ],
    problems: [
      { title: 'Climbing Stairs', diff: 'E', slug: 'climbing-stairs' },
      { title: 'Min Cost Climbing Stairs', diff: 'E', slug: 'min-cost-climbing-stairs' },
      { title: 'House Robber', diff: 'M', slug: 'house-robber' },
      { title: 'House Robber II', diff: 'M', slug: 'house-robber-ii' },
    ],
  },
  {
    id: 'dp/grid-2d',
    name: '2-D DP with padding (LCS shape)',
    when: 'Two sequences (or a grid) where each cell depends on top / left / diagonal neighbors',
    code: [
      'dp = [[0] * (n + 1) for _ in range(m + 1)]   # padded row+col of 0s',
      'for i in range(1, m + 1):',
      '    for j in range(1, n + 1):',
      '        if a[i - 1] == b[j - 1]:',
      '            dp[i][j] = dp[i - 1][j - 1] {{+ 1}}',
      '        else:',
      '            dp[i][j] = {{max(dp[i - 1][j], dp[i][j - 1])}}',
      'return dp[m][n]',
    ],
    bigO: { time: 'O(m·n)', space: 'O(m·n), reducible to two rows' },
    gotchas: [
      'The padding row/col of zeros erases all base-case if-statements',
      'dp indices run one AHEAD of string indices — a[i-1] pairs with dp[i]',
      'Only the previous row is read? Keep two rows and halve nothing but memory',
    ],
    quiz: [
      {
        q: 'Why pad dp with an extra row and column of zeros?',
        options: [
          'Python needs it',
          'Empty-prefix base cases become free — no boundary ifs',
          'It speeds up the loops',
          'To store the answer',
        ],
        answer: 1,
        why: 'dp[0][j] = dp[i][0] = 0 encodes "empty string matches nothing" automatically.',
      },
    ],
    problems: [
      { title: 'Longest Common Subsequence', diff: 'M', slug: 'longest-common-subsequence' },
      { title: 'Unique Paths', diff: 'M', slug: 'unique-paths' },
      { title: 'Minimum Path Sum', diff: 'M', slug: 'minimum-path-sum' },
      { title: 'Edit Distance', diff: 'M', slug: 'edit-distance' },
    ],
  },
  {
    id: 'dp/knapsack',
    name: '0/1 knapsack loop order',
    when: 'Pick each item AT MOST ONCE toward a capacity or target',
    code: [
      'dp = [0] * (target + 1)',
      'dp[0] = 1                        # ways to make sum 0',
      'for x in nums:                   # items on the OUTSIDE',
      '    for t in range(target, {{x - 1}}, {{-1}}):   # capacity DESCENDS',
      '        dp[t] += dp[t - x]',
    ],
    bigO: { time: 'O(n · target)', space: 'O(target)' },
    gotchas: [
      'DESCENDING capacity is what prevents using an item twice in the same row',
      'Unbounded (coin change): ascend instead — reuse is then intentional',
      'range stops BEFORE x-1, so t reaches exactly x — dp[t-x] stays valid',
    ],
    quiz: [
      {
        q: 'For UNBOUNDED knapsack (coin change), the inner loop runs…',
        options: [
          'Descending, same as 0/1',
          'Ascending — reusing the item is the point',
          'In any order',
          'Over items instead',
        ],
        answer: 1,
        why: 'Ascending lets dp[t-x] already include item x — exactly what reuse means.',
      },
    ],
    problems: [
      { title: 'Partition Equal Subset Sum', diff: 'M', slug: 'partition-equal-subset-sum' },
      { title: 'Target Sum', diff: 'M', slug: 'target-sum' },
      { title: 'Coin Change II', diff: 'M', slug: 'coin-change-ii' },
      { title: 'Last Stone Weight II', diff: 'M', slug: 'last-stone-weight-ii' },
    ],
  },
  {
    id: 'dp/lis-bisect',
    name: 'LIS in O(n log n) (patience trick)',
    when: 'Longest increasing subsequence — beat the O(n²) table',
    code: [
      'import bisect',
      'tails = []       # tails[k] = smallest tail of an inc. run of length k+1',
      'for x in nums:',
      '    i = bisect.{{bisect_left}}(tails, x)',
      '    if i == len(tails):',
      '        tails{{.append(x)}}         # extends the longest run',
      '    else:',
      '        tails[i] = {{x}}            # a better (smaller) tail',
      'return len(tails)',
    ],
    bigO: { time: 'O(n log n)', space: 'O(n)' },
    gotchas: [
      'tails is NOT an actual subsequence — only its LENGTH is guaranteed right',
      'bisect_left → strictly increasing; bisect_right → non-decreasing allowed',
      'Replacing (not inserting) keeps future options maximally open — the greedy insight',
    ],
    quiz: [
      {
        q: 'To allow equal elements (non-decreasing LIS), switch to…',
        options: ['bisect_right', 'bisect_left', 'insort', 'reverse the array'],
        answer: 0,
        why: 'bisect_right places an equal element AFTER its twin, extending the run.',
      },
    ],
    problems: [
      { title: 'Longest Increasing Subsequence', diff: 'M', slug: 'longest-increasing-subsequence' },
      { title: 'Maximum Length of Pair Chain', diff: 'M', slug: 'maximum-length-of-pair-chain' },
      { title: 'Russian Doll Envelopes', diff: 'H', slug: 'russian-doll-envelopes' },
    ],
  },
];
