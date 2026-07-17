// Profile themes — animated background gradients + accent colors
export const PROFILE_THEMES = {
  nebula: {
    label: 'Nebula',
    accent: '#a855f7',
    banner: 'from-purple-600/40 via-indigo-700/30 to-slate-900',
    glow: 'rgba(168,85,247,0.35)',
    animated: 'theme-nebula',
  },
  aurora: {
    label: 'Aurora',
    accent: '#22d3ee',
    banner: 'from-cyan-500/40 via-emerald-500/25 to-slate-900',
    glow: 'rgba(34,211,238,0.3)',
    animated: 'theme-aurora',
  },
  sunset: {
    label: 'Sunset',
    accent: '#fb923c',
    banner: 'from-orange-500/40 via-rose-600/30 to-slate-900',
    glow: 'rgba(251,146,60,0.3)',
    animated: 'theme-sunset',
  },
  cyber: {
    label: 'Cyber',
    accent: '#e879f9',
    banner: 'from-fuchsia-600/40 via-cyan-600/20 to-slate-950',
    glow: 'rgba(232,121,249,0.35)',
    animated: 'theme-cyber',
  },
  ocean: {
    label: 'Ocean',
    accent: '#3b82f6',
    banner: 'from-blue-600/40 via-teal-700/25 to-slate-900',
    glow: 'rgba(59,130,246,0.3)',
    animated: 'theme-ocean',
  },
  forest: {
    label: 'Forest',
    accent: '#22c55e',
    banner: 'from-emerald-600/40 via-green-800/25 to-slate-900',
    glow: 'rgba(34,197,94,0.3)',
    animated: 'theme-forest',
  },
  ember: {
    label: 'Ember',
    accent: '#ef4444',
    banner: 'from-red-600/40 via-orange-800/30 to-slate-900',
    glow: 'rgba(239,68,68,0.3)',
    animated: 'theme-ember',
  },
  void: {
    label: 'Void',
    accent: '#94a3b8',
    banner: 'from-slate-700/40 via-slate-800/30 to-slate-950',
    glow: 'rgba(148,163,184,0.25)',
    animated: 'theme-void',
  },
};

export function getTheme(name) {
  return PROFILE_THEMES[name] || PROFILE_THEMES.nebula;
}

export const THEME_NAMES = Object.keys(PROFILE_THEMES);