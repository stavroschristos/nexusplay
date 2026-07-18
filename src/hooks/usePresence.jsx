import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const HEARTBEAT_MS = 60000;
export const OFFLINE_AFTER_MS = 5 * 60 * 1000;

async function upsert(userId, name, patch) {
  try {
    const existing = await base44.entities.Presence.filter({ user_id: userId });
    const now = new Date().toISOString();
    if (existing[0]) {
      await base44.entities.Presence.update(existing[0].id, { ...patch, last_seen: now, user_name: name });
    } else {
      await base44.entities.Presence.create({ user_id: userId, user_name: name, status: 'online', last_seen: now, ...patch });
    }
  } catch {}
}

export function usePresence() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.id) return;
    const name = user.display_name || user.full_name;
    upsert(user.id, name, { status: 'online' });
    const heartbeat = setInterval(() => upsert(user.id, name, {}), HEARTBEAT_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') upsert(user.id, name, { status: 'offline' });
      else upsert(user.id, name, { status: 'online' });
    };
    const onPageHide = () => upsert(user.id, name, { status: 'offline' });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      upsert(user.id, name, { status: 'offline' });
    };
  }, [user?.id]);
}

export async function updateMyPresence(patch) {
  try {
    const me = await base44.auth.me();
    if (!me?.id) return;
    const name = me.display_name || me.full_name;
    await upsert(me.id, name, patch);
  } catch {}
}