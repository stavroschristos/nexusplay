import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Users, Gamepad2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Smart recommendations based on the user's onboarding selections (genres/games).
// Recommends games to follow, communities to join, and gamers with similar
// tastes. Shown to new users on the home dashboard.
export default function SmartRecommendations({ user }) {
  const [data, setData] = useState(null);
  const genres = user?.favorite_genres || [];
  const games = user?.favorite_games || [];

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.Game.list('-created_date', 50).catch(() => []),
      base44.entities.Community.list('-members_count', 30).catch(() => []),
      base44.entities.User.list('-created_date', 50).catch(() => []),
    ]).then(([allGames, allComms, allUsers]) => {
      // Games matching favorite genres
      const matchedGames = allGames.filter((g) => (g.genres || []).some((gg) => genres.includes(gg))).slice(0, 4);
      // Communities whose category maps to a genre or are general
      const genreSet = new Set(genres.map((g) => g.toLowerCase()));
      const matchedComms = allComms.filter((c) => {
        const cat = (c.category || '').toLowerCase();
        return cat === 'genre' || genreSet.has(cat) || c.category === 'Game';
      }).slice(0, 3);
      // Gamers sharing genres
      const matchedGamers = allUsers
        .filter((u) => u.id !== user.id && (u.favorite_genres || []).some((g) => genres.includes(g)))
        .slice(0, 3);
      setData({ games: matchedGames, communities: matchedComms, gamers: matchedGamers, allGames, allComms });
    });
  }, [user?.id]);

  if (!data) return null;
  const hasAny = data.games.length > 0 || data.communities.length > 0 || data.gamers.length > 0;
  if (!hasAny || genres.length === 0) return null;

  const genreText = genres.slice(0, 2).join(' & ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Recommended for you</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Because you selected <span className="text-primary font-medium">{genreText}</span>, here are games, communities and gamers you may enjoy.
      </p>

      {data.games.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> Games to follow</p>
          <div className="grid grid-cols-2 gap-2">
            {data.games.map((g) => (
              <Link key={g.id} to={`/games/${g.id}`} className="flex items-center gap-2 p-2 rounded-xl border border-border bg-secondary/20 hover:border-primary/40 transition-colors group">
                {g.cover_url ? <img src={g.cover_url} alt="" className="w-9 h-12 rounded object-cover shrink-0" /> : <div className="w-9 h-12 rounded bg-secondary grid place-items-center"><Gamepad2 className="w-4 h-4 text-muted-foreground" /></div>}
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-primary">{g.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{(g.genres || []).slice(0, 2).join(', ')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.communities.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Communities to join</p>
          <div className="space-y-1.5">
            {data.communities.map((c) => (
              <Link key={c.id} to={`/communities/${c.id}`} className="flex items-center gap-2.5 p-2 rounded-xl border border-border bg-secondary/20 hover:border-primary/40 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-primary/15 grid place-items-center text-primary text-xs font-bold shrink-0">{(c.name || 'C').charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate group-hover:text-primary">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.members_count || 0} members · {c.category}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.gamers.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Gamers with similar taste</p>
          <div className="space-y-1.5">
            {data.gamers.map((u) => (
              <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-2.5 p-2 rounded-xl border border-border bg-secondary/20 hover:border-primary/40 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary/15 grid place-items-center text-primary text-xs font-bold shrink-0">{(u.display_name || u.full_name || 'G').charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate group-hover:text-primary">{u.display_name || u.full_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{(u.favorite_genres || []).slice(0, 3).join(', ')}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}