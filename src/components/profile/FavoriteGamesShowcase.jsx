import { Star } from 'lucide-react';

// Rich display of favorite games — shows as cover-art style cards if game entities match, else text pills
export default function FavoriteGamesShowcase({ favoriteGames = [], games = [] }) {
  if (!favoriteGames.length) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Star className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">No favorite games pinned yet.</p>
      </div>
    );
  }

  // Match by title (case-insensitive)
  const byTitle = {};
  games.forEach((g) => { byTitle[g.title?.toLowerCase()] = g; });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {favoriteGames.map((title, i) => {
        const g = byTitle[title?.toLowerCase()];
        return (
          <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-card/50">
            {g?.cover_url ? (
              <img src={g.cover_url} alt={title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/15 to-background flex items-center justify-center p-3">
                <span className="text-xs font-semibold text-center text-foreground/80 line-clamp-3">{title}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[11px] font-medium text-white line-clamp-1">{title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}