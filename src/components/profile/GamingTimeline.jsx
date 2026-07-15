import { Trophy, Gamepad2, TrendingUp, Clock, Star, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  trophy: Trophy,
  game: Gamepad2,
  rank: TrendingUp,
  hours: Clock,
  complete: Star,
  start: Flag,
};

export default function GamingTimeline({ milestones }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">No milestones yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Add milestones in Settings to build your gaming history.</p>
      </div>
    );
  }

  const sorted = [...milestones].sort((a, b) => b.year - a.year);

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent" />
      {sorted.map((m, i) => {
        const Icon = iconMap[m.icon] || Gamepad2;
        return (
          <div key={m.id || i} className="relative mb-6 last:mb-0">
            <div className="absolute -left-8 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
              <Icon className="w-3 h-3 text-primary-foreground" />
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <span className="text-xs font-bold text-primary">{m.year}</span>
              <h4 className="text-sm font-semibold mt-1">{m.title}</h4>
              {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}