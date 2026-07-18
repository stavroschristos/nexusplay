import { base44 } from '@/api/base44Client';

const APP_VERSION = '1.0.0';

let session_id = sessionStorage.getItem('np_session');
if (!session_id) {
  session_id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessionStorage.setItem('np_session', session_id);
}

let userId = null;
let inFlight = false;
let pending = 0;

function detect() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const device_type = /Mobi|Android|iPhone/.test(ua) ? 'Mobile' : /iPad|Tablet/.test(ua) ? 'Tablet' : 'Desktop';
  return { browser, os, device_type };
}

const FEATURE_MAP = [
  ['/messages', 'messaging'], ['/communities', 'communities'], ['/games', 'games'],
  ['/lfg', 'lfg'], ['/profile', 'profile'], ['/explore', 'explore'], ['/admin', 'admin'],
  ['/notifications', 'notifications'], ['/wrapped', 'wrapped'], ['/radar', 'radar'],
  ['/challenges', 'challenges'], ['/assistant', 'assistant'], ['/onboarding', 'onboarding'],
  ['/settings', 'settings'], ['/home', 'home'],
];

function deriveFeature(path) {
  for (const [prefix, feature] of FEATURE_MAP) if (path.startsWith(prefix)) return feature;
  return path || 'unknown';
}

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = {};
  for (const [k, v] of Object.entries(obj)) {
    const lk = String(k).toLowerCase();
    if (lk.includes('password') || lk.includes('token') || lk.includes('secret') || lk.includes('authorization') || lk.includes('cookie') || lk === 'email') continue;
    cleaned[k] = v;
  }
  return cleaned;
}

export function setLoggerUser(id) { userId = id || null; }

export async function logError(type, error, context = {}) {
  if (inFlight || pending > 5) return; // prevent recursion / flood
  pending++;
  inFlight = true;
  try {
    const d = detect();
    const path = window.location.pathname;
    const err = error instanceof Error ? error : new Error(String(error ?? 'Unknown error'));
    const payload = {
      timestamp: new Date().toISOString(),
      source: context.source || 'frontend',
      severity: context.severity || 'error',
      error_type: type || err.name || 'Error',
      error_message: (err.message || String(error) || 'Unknown error').slice(0, 1000),
      stack_trace: err.stack ? err.stack.split('\n').slice(0, 8).join('\n') : '',
      page_url: window.location.href.slice(0, 500),
      page_path: path,
      feature: context.feature || deriveFeature(path),
      browser: d.browser,
      os: d.os,
      device_type: d.device_type,
      app_version: APP_VERSION,
      session_id,
      user_id: userId || undefined,
      context: sanitize(context.extra || {}),
    };
    await base44.entities.ErrorLog.create(payload);
  } catch (_) { /* never throw from the logger */ }
  finally { inFlight = false; pending--; }
}

export function initErrorLogger() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (e) => {
    logError('window_error', e.error || e.message, { feature: deriveFeature(window.location.pathname) });
  });
  window.addEventListener('unhandledrejection', (e) => {
    logError('unhandled_promise', e.reason, { feature: deriveFeature(window.location.pathname) });
  });
  // Wrap fetch to capture API failures
  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (...args) {
      return origFetch.apply(this, args).catch((err) => {
        logError('fetch_failure', err, { source: 'api', extra: { url: String(args[0]).slice(0, 200) } });
        throw err;
      });
    };
  }
}