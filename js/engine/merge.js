// Merge two saves (e.g. localStorage vs cloud) without losing progress
// from either device. Pure logic, node-testable.

function newer(a, b) {
  const ar = a.lastReview || 0;
  const br = b.lastReview || 0;
  if (ar !== br) return ar > br ? a : b;
  return (a.reps || 0) >= (b.reps || 0) ? a : b;
}

export function mergeSaves(local, cloud) {
  const a = local || {};
  const b = cloud || {};

  // cards: per trick, keep the more recently reviewed one
  const cards = { ...(a.cards || {}) };
  for (const [id, card] of Object.entries(b.cards || {})) {
    cards[id] = cards[id] ? newer(cards[id], card) : card;
  }

  // learned: union, keeping the EARLIEST learn time
  const learned = { ...(a.learned || {}) };
  for (const [id, t] of Object.entries(b.learned || {})) {
    learned[id] = learned[id] ? Math.min(learned[id], t) : t;
  }

  // solved problems: union
  const solved = { ...(b.solved || {}), ...(a.solved || {}) };

  // review log: union, dedupe by (id, at), chronological, capped
  const seen = new Set();
  const reviewLog = [...(a.reviewLog || []), ...(b.reviewLog || [])]
    .filter((r) => {
      const key = `${r.id}@${r.at}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((x, y) => x.at - y.at);
  if (reviewLog.length > 5000) reviewLog.splice(0, reviewLog.length - 5000);

  return { version: 1, cards, learned, solved, reviewLog };
}
