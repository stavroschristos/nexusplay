import { Link } from 'react-router-dom';
import { Star, Flame, Gamepad2 } from 'lucide-react';

export default function TrendingGameCard({ game, reviewCount = 0, avgRating = 0 }) {
  return (
    <Link to={`/games/${game.id}`} className="block rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:ring-1 hover:ring-primary/30 transition-all group">
      <div className="aspect-video bg-secondary/30 overflow-hidden relative">
        {game.cover_url ? (
          <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        {reviewCount > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs font-bold text-orange-400">{reviewCount}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{game.title}</p>
        {game.genres?.length > 0 && <p className="text-xs text-muted-foreground truncate mt-0.5">{game.genres.slice(0, 2).join(', ')}</p>}
        {avgRating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-amber-400">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}