import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/profile/GameAccountBadge';
import CompatibilityScore from '@/components/shared/CompatibilityScore';
import CompatibilityBreakdown from '@/components/explore/CompatibilityBreakdown';
import { UserPlus, UserCheck, Trophy, Gamepad2 } from 'lucide-react';

export default function GamerCard({ user, accounts = [], breakdown, isFollowing, onToggleFollow, showReasons = true }) {
  const initials = (user.display_name || user.full_name || user.email || 'G').charAt(0).toUpperCase();

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${user.id}`} className="shrink-0">
          <Avatar className="w-14 h-14 ring-2 ring-primary/20">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Link>

        <Link to={`/profile/${user.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user.display_name || user.full_name || 'Gamer'}</p>
          {user.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>}
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {user.achievement_score > 0 && (
              <span className="text-xs text-amber-400 font-medium flex items-center gap-0.5">
                <Trophy className="w-3 h-3" /> {user.achievement_score}
              </span>
            )}
            {user.platinum_count > 0 && <span className="text-xs text-cyan-400 font-medium">{user.platinum_count}P</span>}
            {user.level > 1 && <span className="text-xs text-primary font-medium">Lv {user.level}</span>}
          </div>
        </Link>

        {breakdown && breakdown.score > 0 && <CompatibilityScore score={breakdown.score} size="sm" />}
      </div>

      {accounts.length > 0 && (
        <div className="flex items-center gap-2">
          {accounts.slice(0, 5).map((a) => <PlatformIcon key={a.id} platform={a.platform} className="w-4 h-4" />)}
          {accounts.length > 5 && <span className="text-xs text-muted-foreground">+{accounts.length - 5}</span>}
        </div>
      )}

      {user.favorite_games?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Gamepad2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {user.favorite_games.slice(0, 3).map((g, i) => (
            <span key={i} className="text-xs text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-full truncate max-w-[120px]">{g}</span>
          ))}
        </div>
      )}

      {showReasons && breakdown && breakdown.reasons.length > 0 && (
        <div className="rounded-xl bg-secondary/20 border border-border/50 p-3">
          <CompatibilityBreakdown breakdown={breakdown} userB={user} compact />
        </div>
      )}

      <Button onClick={() => onToggleFollow?.(user.id)} variant={isFollowing ? 'secondary' : 'default'} size="sm" className="w-full rounded-full">
        {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
      </Button>
    </div>
  );
}