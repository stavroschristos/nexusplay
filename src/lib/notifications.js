// Central notification creation utility.
// Respects each recipient's per-type notification preferences and tracks analytics.

import { base44 } from '@/api/base44Client';

// Map a notification type to the user preference flag that gates it.
const TYPE_TO_PREF = {
  like: 'notif_likes',
  comment: 'notif_comments',
  reply: 'notif_comments',
  follow: 'notif_followers',
  friend_request: 'notif_followers',
  friend_accept: 'notif_followers',
  repost: 'notif_likes',
  reaction: 'notif_likes',
  mention: 'notif_comments',
  message: 'notif_messages',
  achievement: 'notif_achievements',
  trophy: 'notif_achievements',
  milestone: 'notif_achievements',
  challenge: 'notif_challenges',
  compatibility: 'notif_recommendations',
  community_invite: 'notif_communities',
  community_announcement: 'notif_communities',
  trending: 'notif_communities',
  featured: 'notif_recommendations',
  recommendation: 'notif_recommendations',
  announcement: null, // always delivered
  system: null,
};

const TYPE_TO_CATEGORY = {
  like: 'social', comment: 'social', reply: 'social', follow: 'social',
  friend_request: 'social', friend_accept: 'social', repost: 'social',
  reaction: 'social', mention: 'social',
  achievement: 'gaming', trophy: 'gaming', milestone: 'gaming', challenge: 'gaming',
  compatibility: 'gaming',
  community_invite: 'community', community_announcement: 'community', trending: 'community',
  message: 'messaging',
  featured: 'system', announcement: 'system', system: 'system', recommendation: 'system',
};

// Fetch a recipient's preference flags. Cached-lightly per session.
let prefCache = {};
export function clearNotifPrefCache() { prefCache = {}; }

async function getPrefs(recipientId) {
  if (prefCache[recipientId]) return prefCache[recipientId];
  try {
    const users = await base44.entities.User.filter({ id: recipientId });
    const u = users[0];
    const prefs = u ? {
      notif_followers: u.notif_followers !== false,
      notif_likes: u.notif_likes !== false,
      notif_comments: u.notif_comments !== false,
      notif_messages: u.notif_messages !== false,
      notif_achievements: u.notif_achievements !== false,
      notif_communities: u.notif_communities !== false,
      notif_challenges: u.notif_challenges !== false,
      notif_recommendations: u.notif_recommendations !== false,
    } : null;
    prefCache[recipientId] = prefs;
    return prefs;
  } catch {
    return null;
  }
}

/**
 * Create a notification for a recipient, respecting their preferences.
 * @param {object} opts
 * @param {string} opts.recipientId - user who receives the notification
 * @param {string} opts.type - notification type
 * @param {string} opts.content - message text
 * @param {string} [opts.title] - optional headline
 * @param {string} [opts.link] - navigation link
 * @param {string} [opts.icon] - emoji hint
 * @param {string} [opts.actorId] - triggering user id
 * @param {string} [opts.actorName] - triggering user display name
 * @param {object} [opts.metadata] - extra context
 * @param {boolean} [opts.force] - bypass preference check (admin/system)
 */
export async function createNotification(opts) {
  const { recipientId, type, content, title, link, icon, actorId, actorName, metadata, force } = opts;
  if (!recipientId || !type || !content) return null;
  // Never notify yourself for your own action
  if (actorId && actorId === recipientId && !force) return null;

  const prefKey = TYPE_TO_PREF[type];
  if (prefKey && !force) {
    const prefs = await getPrefs(recipientId);
    if (prefs && prefs[prefKey] === false) return null; // user disabled this type
  }

  try {
    const notif = await base44.entities.Notification.create({
      recipient_id: recipientId,
      type,
      category: TYPE_TO_CATEGORY[type] || 'system',
      content,
      title: title || null,
      link: link || null,
      icon: icon || null,
      actor_id: actorId || null,
      actor_name: actorName || null,
      metadata: metadata || null,
      read: false,
      opened: false,
    });
    try {
      base44.analytics.track({ eventName: 'notif_sent', properties: { type, category: TYPE_TO_CATEGORY[type] || 'system' } });
    } catch {}
    return notif;
  } catch {
    return null;
  }
}

/**
 * Broadcast a notification to many recipients (used for featured/announcements).
 * @param {string[]} recipientIds
 * @param {object} notifOpts - same as createNotification minus recipientId
 */
export async function broadcastNotification(recipientIds, notifOpts) {
  const list = Array.isArray(recipientIds) ? recipientIds : [];
  const results = [];
  // batch in chunks to avoid huge parallel fanout
  for (let i = 0; i < list.length; i += 25) {
    const chunk = list.slice(i, i + 25);
    await Promise.all(chunk.map((rid) => createNotification({ ...notifOpts, recipientId: rid, force: true })));
  }
  return results;
}

/** Mark a single notification read (and record open for engagement tracking). */
export async function markNotificationRead(notif, markOpened = false) {
  if (!notif || notif.read) return notif;
  try {
    const patch = { read: true, read_at: new Date().toISOString() };
    if (markOpened) patch.opened = true;
    return await base44.entities.Notification.update(notif.id, patch);
  } catch {
    return notif;
  }
}

/** Mark all unread notifications for the current user as read. */
export async function markAllNotificationsRead(unreadList) {
  if (!unreadList || unreadList.length === 0) return;
  try {
    await base44.entities.Notification.updateMany(
      { id: { $in: unreadList.map((n) => n.id) } },
      { $set: { read: true, read_at: new Date().toISOString() } }
    );
  } catch {}
}

/** Record that a notification was opened (click engagement). */
export async function trackNotificationOpen(notifId) {
  try {
    base44.analytics.track({ eventName: 'notif_opened', properties: { notif_id: notifId } });
    await base44.entities.Notification.update(notifId, { opened: true });
  } catch {}
}