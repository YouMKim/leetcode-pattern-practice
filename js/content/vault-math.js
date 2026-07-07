// World: Math & Number Theory

export const MATH_TRICKS = [
  {
    id: 'math/boyer-moore',
    name: 'Boyer-Moore majority vote',
    when: 'Find the element occurring more than n/2 times — one pass, no memory',
    code: [
      'candidate, count = None, 0',
      'for x in nums:',
      '    if count == 0:',
      '        candidate = {{x}}          # adopt a new candidate',
      '    count += 1 if x == candidate else {{-1}}',
      'return candidate',
    ],
    bigO: { time: 'O(n)', space: 'O(1)' },
    gotchas: [
      'Correct ONLY if a majority (> n/2) is guaranteed — else verify with a second pass',
      'Intuition: every non-candidate cancels one candidate vote; a true majority survives',
      'n/3 variant: track TWO candidates with two counters',
    ],
    quiz: [
      {
        q: 'Without a guaranteed majority, the returned candidate is…',
        options: [
          'Still the most frequent element',
          'Possibly wrong — a verification pass is required',
          'Always the last element',
          'None',
        ],
        answer: 1,
        why: 'Cancellation only proves survival, not majority — recount to confirm.',
      },
    ],
    problems: [
      { title: 'Majority Element', diff: 'E', slug: 'majority-element' },
      { title: 'Majority Element II', diff: 'M', slug: 'majority-element-ii' },
      { title: 'Online Majority Element In Subarray', diff: 'H', slug: 'online-majority-element-in-subarray' },
    ],
  },
  {
    id: 'math/fast-pow',
    name: 'Fast power (binary exponentiation)',
    when: 'Compute xⁿ in log n multiplications — square the base, halve the exponent',
    code: [
      'def fast_pow(x, n):',
      '    if n < 0:',
      '        x, n = {{1 / x}}, -n',
      '    res = 1',
      '    while n:',
      '        if n & 1:',
      '            res {{*= x}}          # odd bit: take a factor',
      '        x *= x                   # square',
      '        n {{>>= 1}}               # halve the exponent',
      '    return res',
    ],
    bigO: { time: 'O(log n)', space: 'O(1)' },
    gotchas: [
      'Built-in pow(x, n, mod) already does this WITH modular reduction — use it',
      'Negative exponents: invert the base first',
    ],
    quiz: [
      {
        q: 'Multiplications to compute x^1000 this way?',
        options: ['~10-20', '~100', '~500', '1000'],
        answer: 0,
        why: 'log₂(1000) ≈ 10 squarings plus a few odd-bit factors.',
      },
    ],
    problems: [
      { title: 'Pow(x, n)', diff: 'M', slug: 'powx-n' },
      { title: 'Super Pow', diff: 'M', slug: 'super-pow' },
      { title: 'Count Good Numbers', diff: 'M', slug: 'count-good-numbers' },
    ],
  },
  {
    id: 'math/gcd',
    name: 'Euclid: gcd & lcm',
    when: 'Greatest common divisor by repeated remainder — and lcm rides along',
    code: [
      'def gcd(a, b):',
      '    while b:',
      '        a, b = b, {{a % b}}',
      '    return a',
      '',
      'lcm = a * b {{// gcd(a, b)}}',
      '# or: from math import gcd, lcm',
    ],
    bigO: { time: 'O(log min(a,b))', space: 'O(1)' },
    gotchas: [
      'math.gcd / math.lcm exist — writing it is for when they ask you to',
      'gcd of string patterns: gcd of the LENGTHS decides the repeat unit',
    ],
    quiz: [
      {
        q: 'gcd(48, 18) via Euclid steps to…',
        options: ['2', '3', '6', '9'],
        answer: 2,
        why: '48%18=12 → 18%12=6 → 12%6=0 → gcd is 6.',
      },
    ],
    problems: [
      { title: 'Greatest Common Divisor of Strings', diff: 'E', slug: 'greatest-common-divisor-of-strings' },
      { title: 'Ugly Number', diff: 'E', slug: 'ugly-number' },
      { title: 'Fraction Addition and Subtraction', diff: 'M', slug: 'fraction-addition-and-subtraction' },
    ],
  },
  {
    id: 'math/sieve',
    name: 'Sieve of Eratosthenes',
    when: 'All primes below n — cross out multiples instead of testing divisibility',
    code: [
      'is_prime = [True] * n',
      'is_prime[0] = is_prime[1] = False',
      'for p in range(2, {{int(n ** 0.5) + 1}}):',
      '    if is_prime[p]:',
      '        for m in range({{p * p}}, n, p):   # start at p² — smaller done',
      '            is_prime[m] = {{False}}',
    ],
    bigO: { time: 'O(n log log n)', space: 'O(n)' },
    gotchas: [
      'Outer loop stops at √n; inner starts at p² — both halve the work',
      'Slice assignment is even faster: is_prime[p*p::p] = [False] * len(...)',
    ],
    quiz: [
      {
        q: 'Why can the inner loop start at p·p?',
        options: [
          'Smaller multiples are prime',
          'Every smaller multiple k·p (k<p) was already crossed out by k’s own pass',
          'It cannot — that is a bug',
          'To avoid overflow',
        ],
        answer: 1,
        why: '2p, 3p… were handled when sieving 2, 3, … — p² is the first fresh one.',
      },
    ],
    problems: [
      { title: 'Count Primes', diff: 'M', slug: 'count-primes' },
      { title: 'Prime Arrangements', diff: 'E', slug: 'prime-arrangements' },
      { title: 'Closest Prime Numbers in Range', diff: 'M', slug: 'closest-prime-numbers-in-range' },
    ],
  },
  {
    id: 'math/mod-habits',
    name: 'Modular arithmetic habits',
    when: 'Counting problems say "answer may be huge, return it modulo 10⁹+7"',
    code: [
      'MOD = {{10 ** 9 + 7}}',
      'total = (total + ways) {{% MOD}}      # reduce as you go',
      'prod = (a * b) % MOD',
      'big = pow(base, exp, {{MOD}})          # 3-arg pow: modular fast power',
    ],
    bigO: { time: 'O(1) per reduction', space: 'O(1)' },
    gotchas: [
      'Reduce after EVERY add/multiply — Python won’t overflow but will slow down on huge ints',
      'Python’s % is always non-negative for positive MOD — no C-style negative surprises',
      'Division needs modular inverse: pow(x, MOD-2, MOD) (Fermat) — rare but asked',
    ],
    quiz: [
      {
        q: 'pow(2, 10**18, MOD) is fast because…',
        options: [
          'Python caches powers',
          '3-arg pow does binary exponentiation with reduction at every step',
          'It approximates',
          'It is actually slow',
        ],
        answer: 1,
        why: 'Built-in modular fast power: O(log exp) multiplications on small numbers.',
      },
    ],
    problems: [
      { title: 'Number of Dice Rolls With Target Sum', diff: 'M', slug: 'number-of-dice-rolls-with-target-sum' },
      { title: 'Count Good Numbers', diff: 'M', slug: 'count-good-numbers' },
      { title: 'Unique Paths', diff: 'M', slug: 'unique-paths' },
    ],
  },
];
