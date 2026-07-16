import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Gamepad2, Monitor, Eye, Trophy, TrendingUp, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';

function StatCard({ icon: Icon, label, value, color = 'primary' }) {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-heading leading-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export default function AdminGaming() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [games, accounts, follows, achievements, posts, events] = await Promise.all([
          base44.entities.Game.list('-created_date', 500),
          base44.entities.GameAccount.list('-created_date', 500),
          base44.entities.GameFollow.list('-created_date', 500),
          base44.entities.Achievement.list('-created_date', 500),
          base44.entities.Post.list('-created_date', 500),
          base44.entities.AnalyticsEvent.list('-created_date', 1000),
        ]);

        // Most popular games (by follows)
        const followCounts = {};
        follows.forEach(f => { followCounts[f.game_id] = (followCounts[f.game_id] || 0) + 1; });
        const popularGames = Object.entries(followCounts).sort((a,b) => b[1]-a[1]).slice(0, 8)
          .map(([id, count]) => ({ game: games.find(g => g.id === id), count })).filter(x => x.game);

        // Fallback: games by mentions in posts
        if (popularGames.length === 0) {
          const mentions = {};
          posts.forEach(p => { if (p.game_title) mentions[p.game_title] = (mentions[p.game_title]||0)+1; });
          const top = Object.entries(mentions).sort((a,b) => b[1]-a[1]).slice(0, 8);
          top.forEach(([title, count]) => popularGames.push({ game: { title }, count }));
        }

        // Connected platforms
        const platforms = {};
        accounts.forEach(a => { platforms[a.platform] = (platforms[a.platform] || 0) + 1; });
        const topPlatforms = Object.entries(platforms).sort((a,b) => b[1]-a[1]);

        // Most viewed game pages
        const gameViews = {};
        events.filter(e => e.feature_key === 'games' && e.properties?.path?.startsWith('/games/')).forEach(e => {
          const id = e.properties.path.split('/games/')[1];
          gameViews[id] = (gameViews[id] || 0) + 1;
        });
        const viewedGames = Object.entries(gameViews).sort((a,b) => b[1]-a[1]).slice(0, 8)
          .map(([id, count]) => ({ game: games.find(g => g.id === id), count })).filter(x => x.game);

        // Most earned achievements
        const achCounts = {};
        achievements.forEach(a => { achCounts[a.title] = (achCounts[a.title] || 0) + 1; });
        const topAchievements = Object.entries(achCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);

        // Trending games (recent follows + posts in last 7 days)
        const weekAgo = Date.now() - 604800000;
        const recentFollows = follows.filter(f => new Date(f.created_date).getTime() > weekAgo);
        const recentMentions = posts.filter(p => new Date(p.created_date).getTime() > weekAgo && p.game_title);
        const trending = {};
        recentFollows.forEach(f => { const g = games.find(gx => gx.id === f.game_id); if (g) trending[g.title] = (trending[g.title]||0)+1; });
        recentMentions.forEach(p => { trending[p.game_title] = (trending[p.game_title]||0)+1; });
        const trendingGames = Object.entries(trending).sort((a,b) => b[1]-a[1]).slice(0, 6);

        // Trending genres
        const genres = {};
        games.forEach(g => { (g.genres || []).forEach(ge => genres[ge] = (genres[ge]||0)+1); });
        recentMentions.forEach(p => {
          const g = games.find(gx => gx.title === p.game_title);
          if (g) (g.genres || []).forEach(ge => genres[ge] = (genres[ge]||0)+1);
        });
        const trendingGenres = Object.entries(genres).sort((a,b) => b[1]-a[1]).slice(0, 6);

        setData({ popularGames, topPlatforms, viewedGames, topAchievements, trendingGames, trendingGenres, totalGames: games.length, totalAccounts: accounts.length, totalFollows: follows.length, totalAchievements: achievements.length });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Gamepad2} label="Total Games" value={data.totalGames} color="primary" />
        <StatCard icon={Eye} label="Game Follows" value={data.totalFollows} color="chart-2" />
        <StatCard icon={Monitor} label="Linked Accounts" value={data.totalAccounts} color="chart-4" />
        <StatCard icon={Trophy} label="Achievements" value={data.totalAchievements} color="chart-5" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary" /> Most Popular Games</h3>
          <div className="space-y-2">
            {data.popularGames.map(({ game, count }, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="truncate flex-1">{game.title}</span>
                <span className="text-muted-foreground text-xs ml-2">{count} follows</span>
              </div>
            ))}
            {data.popularGames.length === 0 && <p className="text-xs text-muted-foreground">No data yet.</p>}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> Most Connected Platforms</h3>
          <div className="space-y-2">
            {data.topPlatforms.map(([plat, count]) => (
              <div key={plat} className="flex items-center justify-between text-sm py-1">
                <span className="truncate">{plat}</span>
                <span className="text-muted-foreground text-xs">{count} accounts</span>
              </div>
            ))}
            {data.topPlatforms.length === 0 && <p className="text-xs text-muted-foreground">No linked accounts yet.</p>}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Most Viewed Game Pages</h3>
          <div className="space-y-2">
            {data.viewedGames.map(({ game, count }, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="truncate flex-1">{game.title}</span>
                <span className="text-muted-foreground text-xs ml-2">{count} views</span>
              </div>
            ))}
            {data.viewedGames.length === 0 && <p className="text-xs text-muted-foreground">No page views tracked yet.</p>}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Most Earned Achievements</h3>
          <div className="space-y-2">
            {data.topAchievements.map(([title, count], i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="truncate flex-1">{title}</span>
                <span className="text-muted-foreground text-xs ml-2">{count} users</span>
              </div>
            ))}
            {data.topAchievements.length === 0 && <p className="text-xs text-muted-foreground">No achievements earned yet.</p>}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Trending Games (7d)</h3>
          <div className="space-y-2">
            {data.trendingGames.map(([title, count], i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="truncate flex-1">{title}</span>
                <span className="text-muted-foreground text-xs ml-2">{count} activity</span>
              </div>
            ))}
            {data.trendingGames.length === 0 && <p className="text-xs text-muted-foreground">No trending data this week.</p>}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Trending Genres</h3>
          <div className="space-y-2">
            {data.trendingGenres.map(([genre, count], i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span className="truncate flex-1">{genre}</span>
                <span className="text-muted-foreground text-xs ml-2">{count}</span>
              </div>
            ))}
            {data.trendingGenres.length === 0 && <p className="text-xs text-muted-foreground">No genre data yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}