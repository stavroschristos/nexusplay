import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Gamepad2 } from 'lucide-react';

const CATEGORY_ICONS = {
  Game: Gamepad2,
  Genre: Gamepad2,
  Console: Gamepad2,
  'Achievement Hunting': Gamepad2,
  Speedrunning: Gamepad2,
  Competitive: Gamepad2,
  Retro: Gamepad2,
  Indie: Gamepad2,
  Other: Users,
};

export default function CommunityCard({ community }) {
  const Icon = CATEGORY_ICONS[community.category] || Users;
  const initials = (community.name || 'C').charAt(0).toUpperCase();

  return (
    <Link to={`/communities/${community.id}`} className="block rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 hover:ring-1 hover:ring-primary/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/40 flex items-center justify-center shrink-0">
          {community.icon_url ? (
            <img src={community.icon_url} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <Avatar className="w-full h-full">
              <AvatarImage src={community.icon_url} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{community.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{community.category}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-primary">{formatCount(community.members_count || 0)}</p>
          <p className="text-xs text-muted-foreground">members</p>
        </div>
      </div>
      {community.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{community.description}</p>}
    </Link>
  );
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}