import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Radio, Gamepad2, Trophy, Flame, Users, Sparkles, TrendingUp, Target, ChevronRight, Circle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function HomeDashboard({ onRefresh }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.Follow.filter({ follower_id: user.id }),
      base44.entities.Game.list('-created_date', 5),
      base44.entities.Community.list('-members_count', 5),
      base44.entities.Challenge.list('-created_date', 5),
      base44.entities.UserChallenge.filter({ created_by_id: user.id, completed: false }),
      base44.entities.Achievement.filter({}, '-earned_date', 20),
      base44.entities.Stream.filter({ is_live: true }, '-viewers', 5),
      base44.entities.Notification.filter({ read: false }),
    ]).then(([follows, games, comms, challenges, activeCh, ach, streams, notifs]) => {
      base44.entities.User.list().then((allUsers) => {
        const friendIds = follows.map((f) => f.following_id);
        const friends = allUsers.filter((u) => friendIds.includes(u.id));
        const statuses = ['online', 'playing', 'lfg', 'streaming', 'offline'];
        const games2 = ['Elden Ring', 'Valorant', 'Baldur\'s Gate 3', 'Hades', 'Apex Legends'];
        const platforms = ['PlayStation 5', 'PC', 'Xbox Series X'];
        const friendPresence = friends.slice(0, 6).map((f) => {
          const status = statuses[Math.floor(Math.random() * 4)];
          return { user: f, status, game: games2[Math.floor(Math.random() * games2.length)], platform: platforms[Math.floor(Math.random() * platforms.length)] };
        });
        const recentAchievers = friends.slice(0, 3).map((f) => ({ user: f, game: games2[Math.floor(Math.random() * games2.length)] }));
        setData({ friendPresence, recentAchievers, games, comms, challenges, activeCh, streams, notifs, friendCount: friends.length });
      });
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-28" />)}
      </div>
    );
  }
  if (!data) return null;

  const statusColors = { online: 'bg-emerald-500', playing: 'bg-blue-500', lfg: 'bg-amber-500', streaming: 'bg-rose-500', offline: 'bg-muted-foreground' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold font-heading mb-1 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Your Gaming Universe</h2>
        <p className="text-sm text-muted-foreground mb-4">What's happening in your gaming world right now.</p>
      </div>

      {data.friendPresence.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Friends Online</h3>
            <Link to="/radar" className="text-xs text-primary flex items-center gap-0.5">Radar <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {data.friendPresence.filter((p) => p.status !== 'offline').slice(0, 4).map((p, i) => (
              <Link key={i} to={`/profile/${p.user.id}`} className="flex items-center gap-2.5 py-1.5 group">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{(p.user.display_name || p.user.full_name || 'G').charAt(0)}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColors[p.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{p.user.display_name || p.user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.game} · {p.platform}</p>
                </div>
                {p.status === 'lfg' && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">LFG</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.streams.length > 0 && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><span className="flex items-center gap-1 text-rose-400 text-xs font-bold"><Circle className="w-2 h-2 fill-current" /> LIVE</span> Streams from Friends</h3>
          <div className="space-y-2">
            {data.streams.slice(0, 2).map((s) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm">{(s.streamer_name || 'S').charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.streamer_name || 'Streamer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.title} · {s.game}</p>
                </div>
                <span className="text-xs text-muted-foreground">{s.viewers} 👁</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recentAchievers.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Recent Achievements</h3>
          <div className="space-y-2">
            {data.recentAchievers.map((a, i) => (
              <Link key={i} to={`/profile/${a.user.id}`} className="flex items-center gap-2.5 py-1.5 group">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center"><Trophy className="w-4 h-4 text-amber-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm group-hover:text-primary transition-colors"><span className="font-medium">{a.user.display_name || a.user.full_name}</span> <span className="text-muted-foreground">unlocked a trophy in</span> {a.game}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/games" className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 hover:border-primary/50 transition-colors group">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <h3 className="text-sm font-semibold">Trending Games</h3>
          <p className="text-xs text-muted-foreground mt-1">{data.games.length} trending now</p>
        </Link>
        <Link to="/communities" className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 hover:border-primary/50 transition-colors group">
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <h3 className="text-sm font-semibold">Communities</h3>
          <p className="text-xs text-muted-foreground mt-1">Find your people</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Daily Challenges</h3>
          <Link to="/challenges" className="text-xs text-primary flex items-center gap-0.5">All <ChevronRight className="w-3 h-3" /></Link>
        </div>
        {data.challenges.length === 0 ? <p className="text-xs text-muted-foreground">No active challenges.</p> : (
          <div className="space-y-2">
            {data.challenges.slice(0, 2).map((c) => {
              const active = data.activeCh.find((uc) => uc.challenge_id === c.id);
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="text-lg">{c.badge_icon || '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{active ? `${active.progress}/${c.target}` : `+${c.xp_reward} XP`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Link to="/assistant" className="block rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-4 hover:from-primary/20 hover:to-accent/20 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">AI Gaming Assistant</h3>
            <p className="text-xs text-muted-foreground">Get personalized insights and recommendations</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>

      <Link to="/wrapped" className="block rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 hover:from-amber-500/20 hover:to-orange-500/10 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><Flame className="w-5 h-5 text-amber-400" /></div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Gaming Wrapped</h3>
            <p className="text-xs text-muted-foreground">See your year in gaming</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
}