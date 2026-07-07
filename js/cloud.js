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
// (and persists + re-renders). Called once at boot.
export async function initCloud(getSave, setSave) {
  if (!cloudConfigured()) return;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  status = 'out';
  emit();

  client.auth.onAuthStateChange(async (_event, session) => {
    const wasUser = user;
    user = session ? session.user : null;
    if (user && (!wasUser || wasUser.id !== user.id)) {
      // fresh sign-in: pull cloud save, merge with local, push the union back
      status = 'syncing';
      emit();
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
    } else if (!user) {
      status = 'out';
      emit();
    }
  });
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
