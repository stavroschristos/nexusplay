// First-session onboarding progress system.
// Defines the "Complete Your Gaming Identity" checklist and computes progress
// from the live user object + related data so it self-updates as the user acts.

import { base44 } from '@/api/base44Client';

export const CHECKLIST_STEPS = [
  {
    key: 'username',
    label: 'Create your username',
    link: '/settings',
    icon: '✍️',
    reward: 10,
    check: (u) => Boolean(u?.display_name && u.display_name.trim()),
  },
  {
    key: 'avatar',
    label: 'Add profile picture',
    link: '/settings',
    icon: '📸',
    reward: 10,
    check: (u) => Boolean(u?.avatar_url),
  },
  {
    key: 'bio',
    label: 'Add gaming bio',
    link: '/settings',
    icon: '📝',
    reward: 10,
    check: (u) => Boolean(u?.bio && u.bio.trim()),
  },
  {
    key: 'games',
    label: 'Choose favorite games',
    link: '/settings',
    icon: '🎮',
    reward: 15,
    check: (u) => Array.isArray(u?.favorite_games) && u.favorite_games.length > 0,
  },
  {
    key: 'genres',
    label: 'Select favorite genres',
    link: '/settings',
    icon: '🎯',
    reward: 10,
    check: (u) => Array.isArray(u?.favorite_genres) && u.favorite_genres.length >= 2,
  },
  {
    key: 'accounts',
    label: 'Connect gaming accounts',
    link: '/settings',
    icon: '🔗',
    reward: 15,
    check: (_u, data) => (data?.accountsCount || 0) > 0,
  },
  {
    key: 'community',
    label: 'Join your first community',
    link: '/communities',
    icon: '👥',
    reward: 10,
    check: (_u, data) => (data?.communitiesCount || 0) > 0,
  },
  {
    key: 'follow',
    label: 'Follow your first gamer',
    link: '/explore',
    icon: '🤝',
    reward: 10,
    check: (_u, data) => (data?.followingCount || 0) > 0,
  },
  {
    key: 'post',
    label: 'Create your first post',
    link: '/home',
    icon: '✨',
    reward: 10,
    check: (_u, data) => (data?.postsCount || 0) > 0,
  },
  {
    key: 'customize',
    label: 'Customize your profile',
    link: '/settings',
    icon: '🎨',
    reward: 10,
    check: (u, data) => (u?.profile_theme && u.profile_theme !== 'nebula') || (data?.setupCount || 0) > 0 || (data?.topListCount || 0) > 0,
  },
];

const TOTAL_REWARD = CHECKLIST_STEPS.reduce((s, st) => s + st.reward, 0);

/**
 * Compute checklist progress.
 * @param {object} user - current user
 * @param {object} data - counts: { accountsCount, communitiesCount, followingCount, postsCount, setupCount, topListCount }
 */
export function computeProgress(user, data = {}) {
  const completed = {};
  let earned = 0;
  let done = 0;
  for (const step of CHECKLIST_STEPS) {
    const isDone = step.check(user, data) ? true : false;
    completed[step.key] = isDone;
    if (isDone) { earned += step.reward; done += 1; }
  }
  const percent = Math.round((done / CHECKLIST_STEPS.length) * 100);
  return {
    completed,
    doneCount: done,
    totalCount: CHECKLIST_STEPS.length,
    percent,
    xpEarned: earned,
    xpTotal: TOTAL_REWARD,
    isComplete: done === CHECKLIST_STEPS.length,
  };
}

// Milestone rewards unlocked at progress thresholds.
export const PROGRESS_MILESTONES = [
  { at: 20, label: 'Getting Started', badge: '🌱' },
  { at: 50, label: 'Halfway Hero', badge: '⚡' },
  { at: 80, label: 'Rising Gamer', badge: '🔥' },
  { at: 100, label: 'Identity Unlocked', badge: '🏆', xp: 100 },
];

export function currentMilestone(percent) {
  let m = null;
  for (const milestone of PROGRESS_MILESTONES) {
    if (percent >= milestone.at) m = milestone;
  }
  return m;
}

export function nextMilestone(percent) {
  return PROGRESS_MILESTONES.find((m) => percent < m.at) || null;
}

// Fetch the data counts needed to compute progress for the current user.
export async function fetchProgressData(userId) {
  if (!userId) return {};
  try {
    const [accounts, communities, follows, posts, setups, topLists] = await Promise.all([
      base44.entities.GameAccount.filter({ created_by_id: userId }).catch(() => []),
      base44.entities.CommunityMember.filter({ created_by_id: userId }).catch(() => []),
      base44.entities.Follow.filter({ follower_id: userId }).catch(() => []),
      base44.entities.Post.filter({ created_by_id: userId }, '-created_date', 1).catch(() => []),
      base44.entities.GamingSetup.filter({ created_by_id: userId }).catch(() => []),
      base44.entities.TopList.filter({ created_by_id: userId }).catch(() => []),
    ]);
    return {
      accountsCount: accounts.length,
      communitiesCount: communities.length,
      followingCount: follows.length,
      postsCount: posts.length,
      setupCount: setups.length,
      topListCount: topLists.length,
    };
  } catch {
    return {};
  }
}