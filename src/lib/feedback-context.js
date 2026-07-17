import { featureKeyFromPath } from '@/lib/analytics';

export const APP_VERSION = '1.0.0-alpha';

// Persist a per-session id so multiple feedback events share context.
export function getSessionId() {
  try {
    let id = sessionStorage.getItem('nexusplay_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('nexusplay_session_id', id);
    }
    return id;
  } catch {
    return 'sess_unknown';
  }
}

// Lightweight user-agent parsing (no dependencies).
export function parseUA() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  let browser = 'Unknown';
  let os = 'Unknown';
  let device_type = 'Desktop';

  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome|Chromium|CriOS/i.test(ua)) browser = 'Chrome';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';

  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  if (/Mobi|Android/i.test(ua)) device_type = 'Mobile';
  else if (/iPad|Tablet/i.test(ua)) device_type = 'Tablet';

  return { browser, os, device_type };
}

// Gather all automatic context for a feedback submission.
export function collectFeedbackContext(user) {
  const { browser, os, device_type } = parseUA();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isAdmin = user?.role === 'admin';
  return {
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    page_path: path,
    feature_key: featureKeyFromPath(path),
    browser,
    os,
    device_type,
    app_version: APP_VERSION,
    session_id: getSessionId(),
    user_name: user?.display_name || user?.full_name || user?.email || '',
    user_type: user?.is_alpha_tester ? 'alpha_tester' : isAdmin ? 'admin' : 'regular_user',
    is_alpha_tester: !!user?.is_alpha_tester,
  };
}