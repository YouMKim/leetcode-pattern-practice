// World: String tricks (Python toolbelt)

export const STRING_TRICKS = [
  {
    id: 'string/join',
    name: "Build with ''.join",
    when: 'Assemble a string from many pieces without quadratic blowup',
    code: [
      'parts = []',
      'for token in tokens:',
      '    parts{{.append(token)}}',
      'result = {{"".join(parts)}}',
    ],
    bigO: { time: 'O(total length)', space: 'O(n)' },
    gotchas: [
      's += piece in a loop can be O(n²) — strings are immutable, each += copies',
      "join needs all-str items — wrap numbers with map(str, nums)",
    ],
    quiz: [
      {
        q: 'Why can s += ch in a loop be O(n²)?',
        options: [
          'The GC pauses',
          'Each += copies the whole string so far',
          'It re-hashes s each time',
          "It isn't — Python optimizes it away",
        ],
        answer: 1,
        why: 'Immutable strings mean every concat allocates and copies. (CPython sometimes optimizes, but never rely on it.)',
      },
    ],
    problems: [
      { title: 'Encode and Decode Strings', diff: 'M', slug: 'encode-and-decode-strings' },
      { title: 'Reverse Words in a String', diff: 'M', slug: 'reverse-words-in-a-string' },
      { title: 'Longest Common Prefix', diff: 'E', slug: 'longest-common-prefix' },
    ],
  },
  {
    id: 'string/ord-count',
    name: '26-slot count array',
    when: 'Count lowercase letters lighter and faster than a hashmap',
    code: [
      'counts = [0] * 26',
      'for ch in s:',
      '    counts[{{ord(ch) - ord("a")}}] += 1',
      'sig = {{tuple(counts)}}     # hashable signature',
    ],
    bigO: { time: 'O(n)', space: 'O(26) = O(1)' },
    gotchas: [
      'Only for a known small alphabet — Counter otherwise',
      'tuple(counts) can key a dict; the list itself cannot',
    ],
    quiz: [
      {
        q: "ord('c') - ord('a') equals…",
        options: ['2', '3', '99', 'TypeError'],
        answer: 0,
        why: "Code points are consecutive: a→97, c→99.",
      },
    ],
    problems: [
      { title: 'Valid Anagram', diff: 'E', slug: 'valid-anagram' },
      { title: 'Group Anagrams', diff: 'M', slug: 'group-anagrams' },
      { title: 'Find All Anagrams in a String', diff: 'M', slug: 'find-all-anagrams-in-a-string' },
      { title: 'Permutation in String', diff: 'M', slug: 'permutation-in-string' },
    ],
  },
  {
    id: 'string/two-pointer-palindrome',
    name: 'Two-pointer palindrome scan',
    when: 'Check symmetry in place — skipping junk characters — without building a cleaned copy',
    code: [
      'l, r = 0, {{len(s) - 1}}',
      'while l < r:',
      '    if not s[l].isalnum(): l += 1; continue',
      '    if not s[r].isalnum(): r -= 1; continue',
      '    if s[l].lower() != s[r].lower(): return False',
      '    l, r = {{l + 1, r - 1}}',
      'return True',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      's == s[::-1] also works but costs O(n) extra space',
      'isalnum()/lower() do the cleanup inline — no filtered copy needed',
    ],
    quiz: [
      {
        q: 'Space complexity of s == s[::-1] vs the two-pointer scan?',
        options: ['O(1) vs O(1)', 'O(n) vs O(1)', 'O(n) vs O(n)', 'O(1) vs O(n)'],
        answer: 1,
        why: 'The slice materializes a reversed copy; pointers touch the original only.',
      },
    ],
    problems: [
      { title: 'Valid Palindrome', diff: 'E', slug: 'valid-palindrome' },
      { title: 'Valid Palindrome II', diff: 'E', slug: 'valid-palindrome-ii' },
      { title: 'Longest Palindromic Substring', diff: 'M', slug: 'longest-palindromic-substring' },
      { title: 'Palindromic Substrings', diff: 'M', slug: 'palindromic-substrings' },
    ],
  },
  {
    id: 'string/split-parse',
    name: 'split / strip parsing',
    when: 'Tokenize sentences, CSV-ish fields, or paths in one call',
    code: [
      'words = s{{.split()}}          # splits on ANY whitespace runs',
      'fields = line.split({{","}})',
      'clean = raw{{.strip()}}         # trim both ends',
      'parts = path.split("/")',
    ],
    bigO: { time: 'O(n)', space: 'O(n)' },
    gotchas: [
      "split() with no arg collapses runs and drops empties; split(' ') does neither",
      'strip trims the ENDS only — not interior whitespace',
    ],
    quiz: [
      {
        q: '" a  b ".split() returns…',
        options: ["['a', 'b']", "['', 'a', '', 'b', '']", "[' a', ' b ']", "['a', '', 'b']"],
        answer: 0,
        why: 'No-arg split is the forgiving tokenizer: runs collapse, edges vanish.',
      },
    ],
    problems: [
      { title: 'Reverse Words in a String', diff: 'M', slug: 'reverse-words-in-a-string' },
      { title: 'Simplify Path', diff: 'M', slug: 'simplify-path' },
      { title: 'Length of Last Word', diff: 'E', slug: 'length-of-last-word' },
    ],
  },
  {
    id: 'string/mutable-list',
    name: 'Mutate via list(s)',
    when: 'You must edit characters in place — convert once, edit freely, rebuild once',
    code: [
      'chars = {{list(s)}}',
      'chars[0], chars[-1] = chars[-1], chars[0]   # swap freely',
      's = "".join({{chars}})',
    ],
    bigO: { time: 'O(n)', space: 'O(n)' },
    gotchas: [
      "s[0] = 'x' raises TypeError — Python strings are immutable",
      'Reverse in place with two pointers swapping on the list',
    ],
    quiz: [
      {
        q: "s = 'ab'; s[0] = 'c' does what?",
        options: ["s becomes 'cb'", 'raises TypeError', 'returns a copy', 'silently nothing'],
        answer: 1,
        why: 'Strings are immutable — item assignment is illegal.',
      },
    ],
    problems: [
      { title: 'Reverse String', diff: 'E', slug: 'reverse-string' },
      { title: 'Reverse Words in a String', diff: 'M', slug: 'reverse-words-in-a-string' },
      { title: 'Zigzag Conversion', diff: 'M', slug: 'zigzag-conversion' },
    ],
  },
  {
    id: 'string/expand-center',
    name: 'Expand around center',
    when: 'Find palindromic substrings — grow outward from every possible middle',
    code: [
      'def expand(l, r):                  # returns count/length from this center',
      '    while l >= 0 and r < len(s) and s[l] {{== s[r]}}:',
      '        l -= 1',
      '        {{r += 1}}',
      '    return r - l - 1               # length after overshooting by one',
      '',
      'for i in range(len(s)):',
      '    odd = expand(i, {{i}})           # odd-length: single-char center',
      '    even = expand(i, {{i + 1}})      # even-length: gap center',
    ],
    bigO: { time: 'O(n²)', space: 'O(1)' },
    gotchas: [
      'TWO center types: 2n−1 centers total — forgetting even centers misses "abba"',
      'The loop overshoots by one step; r − l − 1 corrects for it',
      'Beats O(n²)-space DP tables; Manacher gets O(n) but is rarely expected',
    ],
    quiz: [
      {
        q: 'How many palindrome centers does a string of length n have?',
        options: ['n', '2n − 1', 'n²', 'n/2'],
        answer: 1,
        why: 'n character centers plus n−1 gap centers.',
      },
    ],
    problems: [
      { title: 'Longest Palindromic Substring', diff: 'M', slug: 'longest-palindromic-substring' },
      { title: 'Palindromic Substrings', diff: 'M', slug: 'palindromic-substrings' },
      { title: 'Palindrome Partitioning', diff: 'M', slug: 'palindrome-partitioning' },
    ],
  },
  {
    id: 'string/rolling-hash',
    name: 'Rolling hash (Rabin-Karp)',
    when: 'Compare many equal-length substrings — update a hash in O(1) as the window slides',
    code: [
      'BASE, MOD = 26, (1 << 61) - 1',
      'h = 0',
      'for ch in s[:k]:                       # hash of the first window',
      '    h = (h * BASE + val(ch)) % MOD',
      'top = pow(BASE, {{k - 1}}, MOD)          # weight of the outgoing char',
      'for i in range(k, len(s)):',
      '    h = (h - val(s[i - k]) * {{top}}) % MOD   # drop the left char',
      '    h = (h * BASE + {{val(s[i])}}) % MOD       # pull in the right char',
      '    seen.add(h)',
    ],
    bigO: { time: 'O(n) expected', space: 'O(n) for seen hashes' },
    gotchas: [
      'Collisions exist — verify the actual substring on hash hits (or use a huge modulus)',
      'Precompute pow(BASE, k−1, MOD) once, not per step',
      'Shines when the window is long: repeated-DNA, longest duplicate substring',
    ],
    quiz: [
      {
        q: 'Sliding the window updates the hash in…',
        options: ['O(k)', 'O(1)', 'O(log k)', 'O(k²)'],
        answer: 1,
        why: 'Subtract the outgoing weight, multiply, add the incoming char — three ops.',
      },
    ],
    problems: [
      { title: 'Repeated DNA Sequences', diff: 'M', slug: 'repeated-dna-sequences' },
      { title: 'Find the Index of the First Occurrence in a String', diff: 'E', slug: 'find-the-index-of-the-first-occurrence-in-a-string' },
      { title: 'Longest Duplicate Substring', diff: 'H', slug: 'longest-duplicate-substring' },
    ],
  },
];
