import { Trophy, Clock, Gamepad2, Target, Star, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

function StatItem({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function GamingStats({ user, achievements }) {
  const platinumCount = achievements?.filter((a) => a.rarity === 'Legendary' || a.title?.toLowerCase().includes('platinum')).length || user?.platinum_count || 0;
  const rareCount = achievements?.filter((a) => a.rarity === 'Epic' || a.rarity === 'Legendary').length || user?.rare_achievements || 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatItem icon={Gamepad2} label="Games Played" value={user?.total_games_played || 0} color="bg-blue-500/15 text-blue-400" />
      <StatItem icon={Clock} label="Hours Played" value={(user?.total_hours_played || 0).toLocaleString()} color="bg-emerald-500/15 text-emerald-400" />
      <StatItem icon={Trophy} label="Achievement Score" value={(user?.achievement_score || 0).toLocaleString()} color="bg-amber-500/15 text-amber-400" />
      <StatItem icon={Award} label="Platinum Trophies" value={platinumCount} color="bg-purple-500/15 text-purple-400" />
      <StatItem icon={Target} label="Completion" value={`${user?.completion_percentage || 0}%`} color="bg-rose-500/15 text-rose-400" />
      <StatItem icon={Star} label="Rare Achievements" value={rareCount} color="bg-cyan-500/15 text-cyan-400" />
    </div>
  );
}