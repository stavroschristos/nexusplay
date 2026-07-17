import { Star, Gamepad2, Heart, Sparkles } from 'lucide-react';

const SHELVES = [
  { key: 'all_time_favorites', label: 'All-Time Favorites', icon: Star, accent: 'text-amber-400' },
  { key: 'currently_playing', label: 'Currently Playing', icon: Gamepad2, accent: 'text-emerald-400' },
  { key: 'life_changing_games', label: 'Games That Changed My Life', icon: Heart, accent: 'text-rose-400' },
  { key: 'anticipated_games', label: 'Most Anticipated', icon: Sparkles, accent: 'text-fuchsia-400' },
];

export default function GameShelfShowcase({ user }) {
  const shelves = SHELVES.map((s) => ({ ...s, items: user?.[s.key] || [] })).filter((s) => s.items.length > 0);
  if (shelves.length === 0) return null;
  return (
    <div className="space-y-5">
      {shelves.map((s) => (
        <div key={s.key}>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <s.icon className={`w-4 h-4 ${s.accent}`} /> {s.label}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {s.items.map((g, i) => (
              <div key={g + i} className="rounded-xl border border-border bg-card/50 px-3 py-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold text-sm shrink-0">{i + 1}</div>
                <span className="text-sm font-medium truncate">{g}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}