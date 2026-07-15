import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GameCard({ game, size = 'md' }) {
  const sizes = {
    sm: 'w-32',
    md: 'w-44',
  };

  return (
    <Link to={`/games/${game.id}`} className={cn('group block shrink-0', sizes[size])}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary border border-border transition-all group-hover:scale-[1.03] group-hover:ring-2 group-hover:ring-primary/50">
        {game.cover_url ? (
          <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
            <Gamepad2 className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-xs font-medium line-clamp-3">{game.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-xs font-medium text-white line-clamp-2">{game.title}</span>
        </div>
      </div>
      <p className="text-xs font-medium mt-1.5 truncate group-hover:text-primary transition-colors">{game.title}</p>
      {game.genres?.length > 0 && (
        <p className="text-[10px] text-muted-foreground truncate">{game.genres.slice(0, 2).join(' · ')}</p>
      )}
    </Link>
  );
}

export function GameChip({ title }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground">
      <Gamepad2 className="w-3 h-3" />
      {title}
    </span>
  );
}