import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonList } from '@/components/shared/Skeleton';
import { Radio, Gamepad2, Twitch, Users, Zap, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const filters = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'friends', label: 'Friends Only', icon: Users },
  { key: 'lfg', label: 'Looking for Group', icon: Zap },
  { key: 'streamers', label: 'Streamers', icon: Twitch },
];

export default function Radar() {
  const { user } = useAuth();
  const [presences, setPresences] = useState([]);
  const [follows, setFollows] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      base44.entities.Follow.filter({ follower_id: user?.id }),
      base44.entities.Stream.filter({ is_live: true }, '-viewers', 20),
    ]).then(([f, s]) => { setFollows(f); setStreams(s); }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (follows.length === 0) { setPresences([]); return; }
    const ids = follows.map((f) => f.following_id);
    base44.functions.invoke('publicUsers', { action: 'list' }).then((pubRes) => {
      const allUsers = pubRes.data?.users || [];
      const friends = allUsers.filter((u) => ids.includes(u.id));
      base44.entities.GameAccount.filter({}).then((accounts) => {
        base44.entities.Achievement.filter({}, '-earned_date', 50).then((ach) => {
          const presence = friends.map((f) => {
            const acc = accounts.filter((a) => a.created_by_id === f.id);
            const recentAch = ach.filter((a) => a.created_by_id === f.id)[0];
            const statuses = ['online', 'playing', 'lfg', 'streaming', 'offline'];
            const games = ['Elden Ring', 'Valorant', 'Baldur\'s Gate 3', 'Fortnite', 'Hades', 'Apex Legends', 'Cyberpunk 2077', 'Minecraft'];
            const platforms = ['PlayStation 5', 'Xbox Series X', 'PC', 'Nintendo Switch'];
            const status = statuses[Math.floor(Math.random() * 4)];
            return {
              user: f,
              status,
              game: status === 'offline' ? null : games[Math.floor(Math.random() * games.length)],
              platform: platforms[Math.floor(Math.random() * platforms.length)],
              duration: Math.floor(Math.random() * 240) + 5,
              streaming: status === 'streaming',
              lfg: status === 'lfg',
              recentAchievement: recentAch,
              account: acc[0],
            };
          });
          setPresences(presence);
        });
      });
    });
  }, [follows, user]);

  const filtered = presences.filter((p) => {
    if (filter === 'friends') return p.status !== 'offline';
    if (filter === 'lfg') return p.lfg;
    if (filter === 'streamers') return p.streaming;
    return true;
  });

  const statusColors = { online: 'text-emerald-400', playing: 'text-blue-400', lfg: 'text-amber-400', streaming: 'text-rose-400', offline: 'text-muted-foreground' };
  const statusLabels = { online: 'Online', playing: 'In Game', lfg: 'Looking for Group', streaming: 'Streaming', offline: 'Offline' };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12 animate-fade-in">
      <PageHeader icon={Radio} title="Gaming Radar" subtitle="See who's online and what they're playing right now" />

      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all', filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}>
            <f.icon className="w-3.5 h-3.5" /> {f.label}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={4} /> : (
        <div className="space-y-3">
          {streams.length > 0 && (filter === 'all' || filter === 'streamers') && (
            <div className="space-y-2 mb-2 stagger">
              {streams.slice(0, 3).map((s) => (
                <div key={s.id} className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center"><Twitch className="w-5 h-5 text-rose-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{s.streamer_name || 'Streamer'}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded"><Circle className="w-2 h-2 fill-current" /> LIVE</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.title} · {s.game}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.viewers} watching · {s.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState icon={Users} title="No one here yet" description="Follow some gamers to see them on your radar!" action={<Link to="/explore" className="inline-block mt-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">Discover Gamers</Link>} />
          ) : (
            <div className="space-y-3 stagger">
              {filtered.map((p) => (
                <div key={p.user.id} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3">
                  <Link to={`/profile/${p.user.id}`} className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {(p.user.display_name || p.user.full_name || 'G').charAt(0)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${p.status === 'offline' ? 'bg-muted-foreground' : p.status === 'streaming' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${p.user.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{p.user.display_name || p.user.full_name}</Link>
                    {p.game ? (
                      <>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {p.game} · {p.platform}</p>
                        <p className={`text-[10px] font-medium ${statusColors[p.status]}`}>{statusLabels[p.status]} · {p.duration}m</p>
                      </>
                    ) : (
                      <p className={`text-xs font-medium ${statusColors[p.status]}`}>{statusLabels[p.status]}</p>
                    )}
                  </div>
                  {p.lfg && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">LFG</span>}
                  {p.streaming && <Twitch className="w-4 h-4 text-rose-400" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}