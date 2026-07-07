// World: Heap tricks (Python toolbelt)

export const HEAP_TRICKS = [
  {
    id: 'heap/basics',
    name: 'heapq essentials',
    when: 'Repeated access to the smallest element while items keep arriving',
    code: [
      'import heapq',
      'heap = [5, 2, 8]',
      '{{heapq.heapify}}(heap)          # O(n), in place',
      'heapq.heappush(heap, {{1}})',
      'smallest = {{heapq.heappop}}(heap)',
      'top = heap[0]                   # peek only — not sorted!',
    ],
    bigO: { time: 'push/pop O(log n) · heapify O(n) · peek O(1)', space: 'O(n)' },
    gotchas: [
      'heapq is a MIN-heap. Always. No flag to change it.',
      'heap[0] is the only meaningful index — the rest is heap order, not sorted order',
      'heapify is O(n); pushing n items one by one is O(n log n)',
    ],
    quiz: [
      {
        q: 'Building a heap from n items with heapify costs…',
        options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
        answer: 0,
        why: 'Sift-down from the bottom amortizes to linear — a classic interview fact.',
      },
    ],
    problems: [
      { title: 'Kth Largest Element in a Stream', diff: 'E', slug: 'kth-largest-element-in-a-stream' },
      { title: 'Last Stone Weight', diff: 'E', slug: 'last-stone-weight' },
      { title: 'Kth Largest Element in an Array', diff: 'M', slug: 'kth-largest-element-in-an-array' },
    ],
  },
  {
    id: 'heap/max-heap',
    name: 'Max-heap via negation',
    when: 'Repeated access to the LARGEST element as items stream in',
    code: [
      'heap = []',
      'for num in nums:',
      '    heapq.heappush(heap, {{-num}})',
      'largest = {{-heapq.heappop(heap)}}',
    ],
    bigO: { time: 'O(log n) per push/pop', space: 'O(n)' },
    gotchas: [
      'Negate going IN and coming OUT — forgetting one side is the classic bug',
      'For "k largest overall", a size-k MIN-heap is usually better (see the size-k trick)',
    ],
    quiz: [
      {
        q: 'How do you get max-heap behavior from heapq?',
        options: [
          'heapq.heapify(heap, reverse=True)',
          'Push negated values, negate on pop',
          'Use heapq.maxheap()',
          'Sort the list first',
        ],
        answer: 1,
        why: 'heapq has no max mode — negation is the standard workaround.',
      },
    ],
    problems: [
      { title: 'Last Stone Weight', diff: 'E', slug: 'last-stone-weight' },
      { title: 'Kth Largest Element in an Array', diff: 'M', slug: 'kth-largest-element-in-an-array' },
      { title: 'Task Scheduler', diff: 'M', slug: 'task-scheduler' },
      { title: 'Find Median from Data Stream', diff: 'H', slug: 'find-median-from-data-stream' },
    ],
  },
  {
    id: 'heap/size-k',
    name: 'Size-k heap for top-k',
    when: 'Keep only the k best of a huge (even infinite) stream — tiny memory',
    code: [
      'heap = []',
      'for x in nums:',
      '    heapq.heappush(heap, x)',
      '    if len(heap) {{> k}}:',
      '        {{heapq.heappop(heap)}}    # evict the smallest survivor',
      '# heap[0] is now the kth largest',
    ],
    bigO: { time: 'O(n log k)', space: 'O(k)' },
    gotchas: [
      'A MIN-heap of size k keeps the k LARGEST (evict the smallest); mirror for k smallest',
      'heapq.nlargest(k, nums) / nsmallest do this in one call',
      'O(n log k) beats full-sort O(n log n) when k ≪ n',
    ],
    quiz: [
      {
        q: 'Space used to find the top-k of a stream this way?',
        options: ['O(1)', 'O(k)', 'O(n)', 'O(n log k)'],
        answer: 1,
        why: 'Only k survivors are ever held — that is the whole point.',
      },
    ],
    problems: [
      { title: 'Kth Largest Element in a Stream', diff: 'E', slug: 'kth-largest-element-in-a-stream' },
      { title: 'K Closest Points to Origin', diff: 'M', slug: 'k-closest-points-to-origin' },
      { title: 'Top K Frequent Elements', diff: 'M', slug: 'top-k-frequent-elements' },
    ],
  },
  {
    id: 'heap/tuple-priority',
    name: 'Tuples as priority entries',
    when: 'Prioritize by a score but carry a payload along with it',
    code: [
      'heapq.heappush(heap, {{(dist, node)}})   # priority FIRST',
      'd, node = heapq.heappop(heap)',
      '# payloads not comparable? insert a tiebreaker:',
      'heapq.heappush(heap, (cost, {{i}}, task))',
    ],
    bigO: { time: 'O(log n) per op', space: 'O(n)' },
    gotchas: [
      'Tuples compare element-by-element — the first field IS the priority',
      'If priorities tie, Python compares payloads — crash if they are not comparable; a unique counter in the middle fixes it',
    ],
    quiz: [
      {
        q: "Which pops first: (2, 'b') or (2, 'a')?",
        options: ["(2, 'b')", "(2, 'a')", 'Whichever was pushed first', 'TypeError'],
        answer: 1,
        why: "Equal first fields fall through to the second: 'a' < 'b'.",
      },
    ],
    problems: [
      { title: 'Network Delay Time', diff: 'M', slug: 'network-delay-time' },
      { title: 'K Closest Points to Origin', diff: 'M', slug: 'k-closest-points-to-origin' },
      { title: 'Merge K Sorted Lists', diff: 'H', slug: 'merge-k-sorted-lists' },
      { title: 'Cheapest Flights Within K Stops', diff: 'M', slug: 'cheapest-flights-within-k-stops' },
    ],
  },
  {
    id: 'heap/two-heaps',
    name: 'Two heaps (streaming median)',
    when: 'Track the median of a growing stream — split it into halves',
    code: [
      'small, large = [], []      # max-heap (negated) | min-heap',
      'heapq.heappush(small, {{-num}})',
      '# rebalance: top of small flows to large',
      'heapq.heappush(large, {{-heapq.heappop(small)}})',
      'if len(large) > len(small):',
      '    heapq.heappush(small, -heapq.heappop(large))',
      'median = {{-small[0]}}      # odd count case',
    ],
    bigO: { time: 'O(log n) insert, O(1) median', space: 'O(n)' },
    gotchas: [
      'small is a NEGATED max-heap holding the lower half',
      'Push-then-rebalance keeps both invariants without case analysis',
      'Sizes stay within 1; even count → average the two tops',
    ],
    quiz: [
      {
        q: 'After this setup, reading the median costs…',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 0,
        why: 'The median lives at the heap tops — peeking is constant.',
      },
    ],
    problems: [
      { title: 'Find Median from Data Stream', diff: 'H', slug: 'find-median-from-data-stream' },
      { title: 'Sliding Window Median', diff: 'H', slug: 'sliding-window-median' },
      { title: 'IPO', diff: 'H', slug: 'ipo' },
    ],
  },
  {
    id: 'heap/k-way-merge',
    name: 'K-way merge (heads in a heap)',
    when: 'Merge k sorted sources — keep one head per source in a small heap',
    code: [
      'heap = []',
      'for li, lst in enumerate(lists):    # seed: first element of each list',
      '    if lst:',
      '        heapq.heappush(heap, (lst[0], li, {{0}}))',
      'while heap:',
      '    val, li, i = heapq.heappop(heap)',
      '    out.append(val)',
      '    if i + 1 < len(lists[li]):',
      '        nxt = lists[li][{{i + 1}}]',
      '        heapq.heappush(heap, {{(nxt, li, i + 1)}})',
    ],
    bigO: { time: 'O(N log k) — N total elements', space: 'O(k)' },
    gotchas: [
      'The heap never holds more than k entries — one head per source',
      'The list index li in the tuple doubles as a tiebreaker for equal values',
      'Same shape: kth smallest in a sorted matrix, smallest range over k lists',
    ],
    quiz: [
      {
        q: 'Merging k lists of n elements each with this trick costs…',
        options: ['O(nk log k)', 'O(nk²)', 'O(nk log nk)', 'O(nk)'],
        answer: 0,
        why: 'Every one of the nk elements passes through a k-sized heap once.',
      },
    ],
    problems: [
      { title: 'Merge K Sorted Lists', diff: 'H', slug: 'merge-k-sorted-lists' },
      { title: 'Kth Smallest Element in a Sorted Matrix', diff: 'M', slug: 'kth-smallest-element-in-a-sorted-matrix' },
      { title: 'Find K Pairs with Smallest Sums', diff: 'M', slug: 'find-k-pairs-with-smallest-sums' },
      { title: 'Smallest Range Covering Elements from K Lists', diff: 'H', slug: 'smallest-range-covering-elements-from-k-lists' },
    ],
  },
  {
    id: 'heap/lazy-deletion',
    name: 'Lazy deletion',
    when: 'You must "remove" arbitrary items from a heap — heaps can’t; so mark and skip instead',
    code: [
      'removed = defaultdict(int)          # value -> pending removals',
      'def remove(x):',
      '    removed[x] {{+= 1}}               # don’t touch the heap',
      'def top():',
      '    while heap and removed[heap[0]] > 0:',
      '        removed[{{heap[0]}}] -= 1',
      '        {{heapq.heappop(heap)}}        # discard the ghost NOW',
      '    return heap[0]',
    ],
    bigO: { time: 'amortized O(log n) per op', space: 'O(n)' },
    gotchas: [
      'Purge ghosts only when they surface at the top — never search the heap',
      'Track heap "true size" separately if emptiness matters',
      'The alternative is SortedList — lazy deletion keeps you in the stdlib',
    ],
    quiz: [
      {
        q: 'Why not delete from the middle of a heap directly?',
        options: [
          'heapq has no API for it — finding the item alone is O(n)',
          'It corrupts hashing',
          'You can, in O(log n)',
          'Python heaps are immutable',
        ],
        answer: 0,
        why: 'Heaps only maintain order at the top; arbitrary removal breaks the invariant cheaply only via mark-and-skip.',
      },
    ],
    problems: [
      { title: 'Sliding Window Median', diff: 'H', slug: 'sliding-window-median' },
      { title: 'Design a Number Container System', diff: 'M', slug: 'design-a-number-container-system' },
      { title: 'Smallest Number in Infinite Set', diff: 'M', slug: 'smallest-number-in-infinite-set' },
    ],
  },
];
