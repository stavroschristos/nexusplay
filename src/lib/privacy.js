// Privacy & identity helpers for NexusPlay.
// Core principle: email addresses are private account data and are NEVER used
// for public display, avatars, search, or compatibility. Public identity is built
// from display_name / gamer_tag / full_name only.

const PRIVACY_FIELDS = [
  { key: 'privacy_profile', label: 'Profile information', description: 'Your avatar, bio, banner, and gaming identity' },
  { key: 'privacy_activity', label: 'Gaming activity', description: 'Recent activity and milestones' },
  { key: 'privacy_achievements', label: 'Achievement history', description: 'Your earned achievements' },
  { key: 'privacy_trophies', label: 'Trophy showcase', description: 'Pinned / showcased trophies' },
  { key: 'privacy_library', label: 'Game library', description: 'Favorite games, franchises, and collections' },
  { key: 'privacy_stats', label: 'Playtime statistics', description: 'Hours played, completion %, level' },
  { key: 'privacy_friends', label: 'Friends list', description: 'Who you follow and who follows you' },
  { key: 'privacy_communities', label: 'Communities joined', description: 'Communities you are a member of' },
  { key: 'privacy_current_game', label: 'Current game status', description: 'The game you are playing now' },
  { key: 'privacy_streaming', label: 'Streaming status', description: 'Whether you are live streaming' },
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', hint: 'Anyone on NexusPlay' },
  { value: 'friends', label: 'Friends only', hint: 'People you mutually follow' },
  { value: 'private', label: 'Private', hint: 'Only you' },
];

const DM_OPTIONS = [
  { value: 'everyone', label: 'Everyone', hint: 'Any gamer can message you' },
  { value: 'friends', label: 'Friends only', hint: 'Only mutual follows can message you' },
  { value: 'none', label: 'No one', hint: 'Pause incoming messages' },
];

// Public display name — NEVER falls back to email.
export function displayName(user) {
  return user?.display_name || user?.gamer_tag || user?.full_name || 'Gamer';
}

// Gamer tag for compact UI — NEVER falls back to email.
export function gamerTag(user) {
  return user?.gamer_tag || user?.display_name || user?.full_name || 'Gamer';
}

// Avatar initials — derived from public identity only, NEVER from email.
export function userInitials(user) {
  const name = user?.display_name || user?.gamer_tag || user?.full_name || 'G';
  return name.charAt(0).toUpperCase();
}

// Search match — only against public identity fields, NEVER email.
export function matchesSearch(user, query) {
  if (!query) return true;
  const q = String(query).toLowerCase();
  const haystack = [
    user?.display_name,
    user?.gamer_tag,
    user?.full_name,
    user?.bio,
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
}

/**
 * Decide whether a viewer may see a given privacy-protected aspect of an owner.
 * @param owner       the profile owner record
 * @param settingKey  one of PRIVACY_FIELDS keys or 'privacy_profile'
 * @param viewer       { id, isFriend, isAdmin }
 */
export function canView(owner, settingKey, viewer = {}) {
  if (!owner) return false;
  // Self always sees their own data.
  if (viewer.id && viewer.id === owner.id) return true;
  // Authorized admins may view when necessary.
  if (viewer.isAdmin) return true;
  const setting = owner[settingKey] || 'public';
  if (setting === 'public') return true;
  if (setting === 'friends') return !!viewer.isFriend;
  return false; // private
}

// Whether a viewer is allowed to start a DM with the owner.
export function canMessage(owner, viewer = {}) {
  if (!owner) return false;
  if (viewer.id && viewer.id === owner.id) return false;
  if (viewer.isAdmin) return true;
  const perm = owner.dm_permission || 'everyone';
  if (perm === 'everyone') return true;
  if (perm === 'friends') return !!viewer.isFriend;
  return false; // none
}

// Whether a user should be excluded entirely from public discovery lists.
export function isDiscoverable(owner) {
  if (!owner) return false;
  return (owner.privacy_profile || 'public') !== 'private';
}

export { PRIVACY_FIELDS, PRIVACY_OPTIONS, DM_OPTIONS };