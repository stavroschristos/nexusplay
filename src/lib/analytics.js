import { base44 } from '@/api/base44Client';

const PATH_TO_FEATURE = {
  '/': 'home',
  '/radar': 'radar',
  '/explore': 'explore',
  '/communities': 'communities',
  '/games': 'games',
  '/challenges': 'challenges',
  '/assistant': 'assistant',
  '/messages': 'messages',
  '/wrapped': 'wrapped',
  '/profile': 'profile',
  '/settings': 'settings',
  '/notifications': 'notifications',
  '/lfg': 'lfg',
  '/admin': 'admin',
};

export function featureKeyFromPath(path) {
  if (!path) return 'other';
  if (PATH_TO_FEATURE[path]) return PATH_TO_FEATURE[path];
  if (path.startsWith('/games/')) return 'games';
  if (path.startsWith('/communities/')) return 'communities';
  if (path.startsWith('/profile/')) return 'profile';
  if (path.startsWith('/collections/')) return 'explore';
  return 'other';
}

export async function trackEvent(event_name, feature_key = 'other', category = 'feature_use', properties = {}) {
  try {
    base44.entities.AnalyticsEvent.create({ event_name, feature_key, category, properties });
  } catch (e) {
    // analytics should never break the app
  }
}

export function trackPageView(path) {
  const feature_key = featureKeyFromPath(path);
  trackEvent('page_view', feature_key, 'page_view', { path });
}