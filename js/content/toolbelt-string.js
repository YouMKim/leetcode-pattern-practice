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
];
