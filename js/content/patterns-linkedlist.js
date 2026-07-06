// World: Linked Lists

export const LINKEDLIST_TRICKS = [
  {
    id: 'linkedlist/dummy',
    name: 'Dummy head node',
    when: 'Any edit that might touch the head — a sentinel makes no node special',
    code: [
      'dummy = ListNode(0, {{head}})',
      'prev = dummy',
      'while prev.next:',
      '    if prev.next.val == target:',
      '        prev.next = {{prev.next.next}}    # unlink',
      '    else:',
      '        prev = prev.next',
      'return {{dummy.next}}',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'Return dummy.next, NEVER head — the original head may have been deleted',
      'Kills every "but what if it is the head?" special case',
    ],
    quiz: [
      {
        q: 'Why return dummy.next instead of head?',
        options: [
          'They are always the same',
          'head might have been removed — dummy.next tracks the true head',
          'dummy.next is faster',
          'head is out of scope',
        ],
        answer: 1,
        why: 'Deleting the first node leaves head dangling; the sentinel never moves.',
      },
    ],
    problems: [
      { title: 'Remove Linked List Elements', diff: 'E', slug: 'remove-linked-list-elements' },
      { title: 'Merge Two Sorted Lists', diff: 'E', slug: 'merge-two-sorted-lists' },
      { title: 'Remove Nth Node From End of List', diff: 'M', slug: 'remove-nth-node-from-end-of-list' },
      { title: 'Swap Nodes in Pairs', diff: 'M', slug: 'swap-nodes-in-pairs' },
    ],
  },
  {
    id: 'linkedlist/reverse',
    name: 'In-place reversal',
    when: 'Reverse a chain (or a sublist) without allocating anything — a core building block',
    code: [
      'prev = None',
      'cur = head',
      'while cur:',
      '    nxt = {{cur.next}}        # save BEFORE breaking the link',
      '    cur.next = {{prev}}        # flip the pointer',
      '    prev = cur',
      '    cur = nxt',
      'return {{prev}}                # the new head',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'Save nxt FIRST — flipping cur.next first loses the rest of the list',
      'The loop ends with cur = None, so prev holds the new head',
      'Memorize this cold — palindrome check, reorder-list, and k-group all build on it',
    ],
    quiz: [
      {
        q: 'After the loop, the new head is…',
        options: ['head', 'cur', 'prev', 'nxt'],
        answer: 2,
        why: 'cur walked off the end (None); prev is the last real node.',
      },
    ],
    problems: [
      { title: 'Reverse Linked List', diff: 'E', slug: 'reverse-linked-list' },
      { title: 'Reverse Linked List II', diff: 'M', slug: 'reverse-linked-list-ii' },
      { title: 'Reorder List', diff: 'M', slug: 'reorder-list' },
      { title: 'Reverse Nodes in k-Group', diff: 'H', slug: 'reverse-nodes-in-k-group' },
    ],
  },
  {
    id: 'linkedlist/floyd',
    name: "Floyd's cycle: find the ENTRY",
    when: 'Not just "is there a cycle" — locate where it starts, still O(1) space',
    code: [
      'slow = fast = head',
      'while fast and fast.next:',
      '    slow, fast = slow.next, fast.next.next',
      '    if slow is fast:              # phase 1: they met',
      '        slow = {{head}}            # reset ONE pointer to head',
      '        while slow is not fast:',
      '            slow, fast = {{slow.next, fast.next}}   # SAME speed now',
      '        return slow               # the cycle entry',
      'return None',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'Phase 2 moves BOTH pointers one step — the distance math guarantees they meet at the entry',
      'Works on arrays too: treat values as next-pointers (Find the Duplicate Number)',
    ],
    quiz: [
      {
        q: 'In phase 2 the pointers move at speeds…',
        options: ['1 and 2', '1 and 1', '2 and 2', '1 and 3'],
        answer: 1,
        why: 'Head-to-entry distance equals meeting-point-to-entry (mod cycle) — equal steps collide at the entry.',
      },
    ],
    problems: [
      { title: 'Linked List Cycle', diff: 'E', slug: 'linked-list-cycle' },
      { title: 'Linked List Cycle II', diff: 'M', slug: 'linked-list-cycle-ii' },
      { title: 'Find the Duplicate Number', diff: 'M', slug: 'find-the-duplicate-number' },
    ],
  },
  {
    id: 'linkedlist/merge',
    name: 'Merge two sorted lists',
    when: 'Zip two sorted chains into one — the heart of merge sort and k-way merges',
    code: [
      'dummy = tail = ListNode()',
      'while l1 and l2:',
      '    if l1.val <= l2.val:',
      '        tail.next, l1 = l1, {{l1.next}}',
      '    else:',
      '        tail.next, l2 = l2, l2.next',
      '    tail = {{tail.next}}',
      'tail.next = {{l1 or l2}}          # attach whichever remains',
      'return dummy.next',
    ],
    bigO: { time: 'O(n + m)', space: 'O(1)' },
    gotchas: [
      '`l1 or l2` attaches the leftover tail — no cleanup loop needed',
      'For k lists: merge pairs (O(N log k)) or pop from a heap of heads',
    ],
    quiz: [
      {
        q: 'After the while loop, `tail.next = l1 or l2` works because…',
        options: [
          'Both lists are empty',
          'At most one list still has nodes, already sorted',
          'or concatenates lists',
          'It is a null check only',
        ],
        answer: 1,
        why: 'The loop drains one list; the survivor is sorted and ≥ everything merged so far.',
      },
    ],
    problems: [
      { title: 'Merge Two Sorted Lists', diff: 'E', slug: 'merge-two-sorted-lists' },
      { title: 'Merge K Sorted Lists', diff: 'H', slug: 'merge-k-sorted-lists' },
      { title: 'Sort List', diff: 'M', slug: 'sort-list' },
    ],
  },
  {
    id: 'linkedlist/runner',
    name: 'Runner: n-ahead pointer',
    when: 'Find or delete the nth node from the END in a single pass',
    code: [
      'dummy = ListNode(0, head)',
      'fast = slow = dummy',
      'for _ in range({{n + 1}}):        # give fast an n+1 head start',
      '    fast = fast.next',
      'while fast:',
      '    slow, fast = slow.next, fast.next',
      'slow.next = {{slow.next.next}}    # slow sits just BEFORE the target',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'The n+1 gap (starting from dummy) parks slow just BEFORE the node to remove',
      'One pass, no length precomputation — the interviewer is checking for exactly this',
    ],
    quiz: [
      {
        q: 'Why n+1 steps of head start rather than n?',
        options: [
          'Off-by-one superstition',
          'So slow stops at the node BEFORE the target — you need its predecessor to unlink',
          'Because of the dummy',
          'n would crash',
        ],
        answer: 1,
        why: 'Deletion always happens from the predecessor: slow.next = slow.next.next.',
      },
    ],
    problems: [
      { title: 'Remove Nth Node From End of List', diff: 'M', slug: 'remove-nth-node-from-end-of-list' },
      { title: 'Middle of the Linked List', diff: 'E', slug: 'middle-of-the-linked-list' },
      { title: 'Rotate List', diff: 'M', slug: 'rotate-list' },
    ],
  },
];
