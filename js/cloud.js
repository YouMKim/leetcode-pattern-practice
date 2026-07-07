// Cloud sync via Supabase: Google/GitHub OAuth + one RLS-guarded JSONB save
// per user (table: grimoire_saves). Degrades to local-only when no anon key
// is configured. supabase-js loads lazily from the CDN only when enabled.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';
import { mergeSaves } from './engine/merge.js';

let client = null;
let user = null;
let status = 'off'; // off | out | syncing | synced | error
let pushTimer = null;
const listeners = [];

export function cloudConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
    && typeof window !== 'undefined' && Boolean(window.location);
}

export function cloudState() {
  return { status, email: user ? user.email : null };
}

export function onCloudChange(fn) {
  listeners.push(fn);
}

function emit() {
  for (const fn of listeners) fn(cloudState());
}

// getSave() returns the current in-memory save; setSave(merged) replaces it
// (and persists + re-renders). Called once at boot; resolves once the
// initial session state is known (so the app can decide gate vs home
// without flashing the wrong screen).
export async function initCloud(getSave, setSave) {
  if (!cloudConfigured()) return;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  status = 'out';
  emit();

  let resolveReady;
  const ready = new Promise((r) => { resolveReady = r; });

  client.auth.onAuthStateChange((_event, session) => {
    const wasId = user ? user.id : null;
    user = session ? session.user : null;
    if (user && wasId !== user.id) {
      status = 'syncing';
      emit();
      // supabase calls inside this callback can deadlock — defer them
      setTimeout(() => pullMergePush(getSave, setSave), 0);
    } else if (!user) {
      status = 'out';
      emit();
    }
    if (resolveReady) { resolveReady(); resolveReady = null; }
  });

  await ready; // initial session restored (or confirmed absent)
}

// Sign-in (or fresh boot with a session): pull cloud save, merge with
// local so neither device loses progress, push the union back up.
async function pullMergePush(getSave, setSave) {
  try {
    const { data, error } = await client
      .from('grimoire_saves').select('data').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    const merged = data && data.data ? mergeSaves(getSave(), data.data) : getSave();
    setSave(merged);
    await pushNow(merged);
  } catch {
    status = 'error';
    emit();
  }
}

export function signIn(provider) {
  if (!client) return;
  client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
}

export async function signOut() {
  if (client) await client.auth.signOut();
}

// Debounced: call after every persist; batches rapid review answers.
export function schedulePush(save) {
  if (!client || !user) return;
  status = 'syncing';
  emit();
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushNow(save), 2500);
}

async function pushNow(save) {
  if (!client || !user) return;
  const { error } = await client.from('grimoire_saves').upsert({
    user_id: user.id,
    data: save,
    updated_at: new Date().toISOString(),
  });
  status = error ? 'error' : 'synced';
  emit();
}
