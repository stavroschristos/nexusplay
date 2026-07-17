import { cn } from '@/lib/utils';
import { Gamepad2, Tag, Layers, Target, Clock, Trophy, Check } from 'lucide-react';

const ICON_MAP = {
  games: Gamepad2,
  genres: Tag,
  franchises: Layers,
  playstyle: Target,
  habits: Clock,
  achievements: Trophy,
};

export default function CompatibilityBreakdown({ breakdown, userB, compact = false }) {
  if (!breakdown || breakdown.score === 0) {
    return <p className="text-sm text-muted-foreground">Update your profile to see compatibility with other gamers.</p>;
  }

  const nameB = userB?.display_name || userB?.full_name || 'this gamer';

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="text-muted-foreground">You and </span>
        <span className="font-semibold text-foreground">{nameB}</span>
        <span className="text-muted-foreground"> have </span>
        <span className="font-bold text-primary text-base">{breakdown.score}% compatibility</span>
        <span className="text-muted-foreground">.</span>
      </p>

      {!compact && breakdown.reasons.length > 0 && (
        <div className="space-y-1.5">
          {breakdown.reasons.slice(0, 5).map((r, i) => {
            const Icon = ICON_MAP[r.icon] || Check;
            return (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3 h-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{r.label}</span>
                  {r.detail && <span className="text-muted-foreground"> — {r.detail}</span>}
                </div>
                <span className={cn('text-xs font-bold shrink-0', r.weight >= 15 ? 'text-primary' : 'text-muted-foreground')}>+{r.weight}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}