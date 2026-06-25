// Lightweight, dependency-free analytics -> Supabase (PostgREST insert).
// PV = count of event rows; UV = count(distinct device_id).
// The URL + key are public client config. The events table must stay RLS
// insert-only for anon/publishable browser writes.

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://bvajkdxteubiwslgznlt.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_5oJ9TTm8Y2CYXUrJ6C6rpw_0KPIq60N';

const ENDPOINT = `${SUPABASE_URL}/rest/v1/events`;
const DEVICE_KEY = 'ponyrun_device_id';
const APP = 'ponyrun';

export const ANALYTICS_EVENTS = {
  homePlayClick: 'ponyrun_home_play_click',
  gamePageView: 'ponyrun_game_page_view',
  startGame: 'ponyrun_start_game',
  replayGame: 'ponyrun_replay_game',
};

function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export async function trackEvent(name, props = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY || typeof window === 'undefined') return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        device_id: deviceId,
        name,
        path: window.location.pathname,
        referrer: document.referrer || null,
        props: { app: APP, ...props },
      }),
      keepalive: true,
    });
  } catch {
    // Tracking must stay invisible to players.
  }
}
