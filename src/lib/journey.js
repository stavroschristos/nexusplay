// Early-product analytics: user journey + activation tracking.
// Wraps the AnalyticsEvent entity and records "first" milestones on the user.
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import { markInviteActivated } from '@/lib/invites';

// Map a journey event to an analytics category.
function categoryFor(event) {
  if (['account_created', 'registration_completed', 'onboarding_started', 'onboarding_completed',
       'favorite_games_selected', 'platforms_selected', 'accounts_connected', 'profile_created',
       'avatar_added', 'bio_added', 'favorite_games_added', 'collections_created', 'profile_completion',
       'activated'].includes(event)) {
    return 'auth';
  }
  if (['first_follow', 'first_community', 'first_post', 'first_comment', 'first_like', 'first_message'].includes(event)) {
    return 'social';
  }
  return 'feature_use';
}

export function trackJourney(event_name, properties = {}) {
  trackEvent(event_name, 'other', categoryFor(event_name), properties);
}

// Record a "first X" milestone on the current user (idempotent).
export async function recordFirstAction(user, action) {
  if (!user?.id) return;
  const field = `first_${action}_at`;
  if (user[field]) return; // already recorded
  try {
    await base44.auth.updateMe({ [field]: new Date().toISOString() });
  } catch { /* ignore */ }
  trackJourney(`first_${action}`, { feature: action });
}

// Compute a 0-100 profile completion score from the live user object.
export function computeProfileCompletion(u) {
  if (!u) return 0;
  const checks = [
    !!u.display_name,
    !!u.gamer_tag,
    !!u.avatar_url,
    !!u.bio,
    (u.favorite_games || []).length > 0,
    (u.favorite_genres || []).length > 0,
    (u.platforms_owned || []).length > 0,
    !!u.gaming_personality,
    (u.all_time_favorites || []).length > 0,
    (u.currently_playing || []).length > 0 || !!u.current_game,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

// Persist the computed completion and fire the profile_completion journey event.
export async function syncProfileCompletion(user) {
  if (!user?.id) return 0;
  const pct = computeProfileCompletion(user);
  try {
    await base44.auth.updateMe({ profile_completion: pct });
  } catch { /* ignore */ }
  trackJourney('profile_completion', { pct });
  return pct;
}

// Activation = completed onboarding AND built a gaming identity (completion >= 80)
// AND performed at least one social action. Idempotent.
export async function markActivatedIfNeeded(user) {
  if (!user?.id || user.activated) return false;
  const completion = computeProfileCompletion(user);
  const social = user.first_follow_at || user.first_community_at || user.first_post_at ||
    user.first_comment_at || user.first_like_at || user.first_message_at;
  if (user.has_onboarded && completion >= 80 && social) {
    try {
      await base44.auth.updateMe({ activated: true });
    } catch { /* ignore */ }
    trackJourney('activated', { completion });
    if (user.invite_source && user.invite_source !== 'organic') {
      markInviteActivated(user.invited_by).catch(() => {});
    }
    return true;
  }
  return false;
}