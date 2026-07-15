import { Trophy } from 'lucide-react';
import { PlatformIcon } from './GameAccountBadge';
import { cn } from '@/lib/utils';

const rarityConfig = {
  Common: 'border-slate-500/40 bg-slate-500/5 text-slate-300',
  Uncommon: 'border-green-500/40 bg-green-500/5 text-green-300',
  Rare: 'border-blue-500/40 bg-blue-500/5 text-blue-300',
  Epic: 'border-purple-500/40 bg-purple-500/5 text-purple-300',
  Legendary: 'border-amber-500/40 bg-amber-500/5 text-amber-300',
};

export default function AchievementCard({ achievement }) {
  const rarity = rarityConfig[achievement.rarity] || rarityConfig.Common;

  return (
    <div className={cn('relative rounded-xl border p-4 overflow-hidden transition-all hover:scale-[1.02]', rarity)}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-current opacity-5 blur-2xl rounded-full" />
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center shrink-0">
          {achievement.icon_url ? (
            <img src={achievement.icon_url} alt="" className="w-full h-full rounded-lg object-cover" />
          ) : (
            <Trophy className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold truncate">{achievement.title}</h4>
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-current/10">
              {achievement.rarity}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <PlatformIcon platform={achievement.platform} className="w-3.5 h-3.5" />
            <span className="text-xs text-muted-foreground">{achievement.game}</span>
          </div>
        </div>
      </div>
    </div>
  );
}