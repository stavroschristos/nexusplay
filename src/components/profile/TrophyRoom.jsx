import { Trophy } from 'lucide-react';
import { PlatformIcon } from './GameAccountBadge';
import { cn } from '@/lib/utils';

const rarityConfig = {
  Common: { glow: 'shadow-slate-500/20', border: 'border-slate-500/40', grad: 'from-slate-500/20' },
  Uncommon: { glow: 'shadow-green-500/20', border: 'border-green-500/40', grad: 'from-green-500/20' },
  Rare: { glow: 'shadow-blue-500/30', border: 'border-blue-500/40', grad: 'from-blue-500/20' },
  Epic: { glow: 'shadow-purple-500/30', border: 'border-purple-500/40', grad: 'from-purple-500/20' },
  Legendary: { glow: 'shadow-amber-500/40', border: 'border-amber-500/50', grad: 'from-amber-500/30' },
};

export default function TrophyRoom({ achievements }) {
  const legendary = achievements?.filter((a) => a.rarity === 'Legendary');
  const epic = achievements?.filter((a) => a.rarity === 'Epic');
  const showcase = [...(legendary || []), ...(epic || [])].slice(0, 8);

  if (!showcase || showcase.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
        <p className="text-sm text-muted-foreground">No trophies in the showcase yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Log Epic or Legendary achievements to fill your trophy room.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {showcase.map((a) => {
        const config = rarityConfig[a.rarity] || rarityConfig.Common;
        return (
          <div
            key={a.id}
            className={cn(
              'relative aspect-square rounded-2xl border overflow-hidden bg-gradient-to-br to-transparent shadow-lg transition-all hover:scale-105',
              config.border, config.grad
            )}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-black/30 backdrop-blur flex items-center justify-center mb-2">
                {a.icon_url ? (
                  <img src={a.icon_url} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Trophy className="w-6 h-6 text-amber-300" />
                )}
              </div>
              <p className="text-xs font-semibold line-clamp-2">{a.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{a.game}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <PlatformIcon platform={a.platform} className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase text-muted-foreground">{a.rarity}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}