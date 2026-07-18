import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonList } from '@/components/shared/Skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radio, Gamepad2, Twitch, Users, Zap, Circle, Pencil, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateMyPresence, OFFLINE_AFTER_MS } from '@/hooks/usePresence';

const PLATFORMS = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Riot', 'Battle.net', 'PC'];

const filters = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'friends', label: 'Online', icon: Users },
  { key: 'lfg', label: 'Looking for Group', icon: Zap },
  { key: 'streamers', label: 'Streamers', icon: Twitch },
];

const statusColors = { online: 'text-emerald-400', playing: 'text-blue-400', lfg: 'text-amber-400', streaming: 'text-rose-400', offline: 'text-muted-foreground' };
const statusLabels = { online: 'Online', playing: 'In Game', lfg: 'Looking for Group', streaming: 'Streaming', offline: 'Offline' };
const dotColors = { online: 'bg-emerald-500', playing: 'bg-blue-500', lfg: 'bg-amber-500', streaming: 'bg-rose-500', offline: 'bg-muted-foreground' };

export default function Radar() {
  const { user } = useAuth();
  const [follows, setFollows] = useState([]);
  const [presences, setPresences] = useState([]);
  const [users, setUsers] = useState({});
  const [lfgByUser, setLfgByUser] = useState({});
  const [streams, setStreams] = useState([]);
  const [accounts, setAccounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(false);
  const [gameInput, setGameInput] = useState('');
  const [platformInput, setPlatformInput] = useState('');
  const [saving, setSaving] = useState(false);
  const loadRef = useRef();

  const load = async () => {
    try {
      const [f, pubRes, allPresence, lfg, s, acc] = await Promise.all([
        base44.entities.Follow.filter({ follower_id: user?.id }),
        base44.functions.invoke('publicUsers', { action: 'list' }),
        base44.entities.Presence.filter({}),
        base44.entities.LFG.filter({}),
        base44.entities.Stream.filter({ is_live: true }, '-viewers', 20),
        base44.entities.GameAccount.filter({}),
      ]);
      setFollows(f || []);
      const uMap = {};
      (pubRes.data?.users || []).forEach((u) => { uMap[u.id] = u; });
      setUsers(uMap);
      setPresences(allPresence || []);
      const lMap = {};
      (lfg || []).forEach((l) => { lMap[l.created_by_id] = true; });
      setLfgByUser(lMap);
      setStreams(s || []);
      const aMap = {};
      (acc || []).forEach((a) => { if (!aMap[a.created_by_id]) aMap[a.created_by_id] = a; });
      setAccounts(aMap);
    } catch {}
  };

  loadRef.current = load;

  useEffect(() => {
    setLoading(true);
    loadRef.current().finally(() => setLoading(false));
    const poll = setInterval(() => loadRef.current(), 30000);
    return () => clearInterval(poll);
  }, [user?.id]);

  const presenceByUser = {};
  presences.forEach((p) => { presenceByUser[p.user_id] = p; });
  const streamByUser = {};
  streams.forEach((s) => { if (s.created_by_id) streamByUser[s.created_by_id] = s; });

  const compute = (id) => {
    const u = users[id];
    const p = presenceByUser[id];
    const liveStream = streamByUser[id];
    const hasOpenLFG = !!lfgByUser[id];
    const acc = accounts[id];
    const now = Date.now();
    const lastSeenMs = p?.last_seen ? new Date(p.last_seen).getTime() : 0;
    const isOnline = !!p && p.status === 'online' && (now - lastSeenMs) < OFFLINE_AFTER_MS;
    let status;
    if (liveStream) status = 'streaming';
    else if (hasOpenLFG) status = 'lfg';
    else if (isOnline && p.current_game) status = 'playing';
    else if (isOnline) status = 'online';
    else status = 'offline';
    const game = liveStream?.game || p?.current_game || null;
    const platform = p?.platform || acc?.platform || liveStream?.platform || null;
    const mins = lastSeenMs ? Math.max(0, Math.floor((now - lastSeenMs) / 60000)) : 0;
    return { user: u, status, game, platform, mins, streaming: !!liveStream, lfg: hasOpenLFG, isOnline, lastSeenMs };
  };

  const followedIds = follows.map((f) => f.following_id);
  const radar = followedIds.map(compute).filter((r) => r.user);

  const myPresence = presenceByUser[user?.id];
  const myStatus = user?.id ? compute(user.id).status : 'offline';

  const filtered = radar.filter((p) => {
    if (filter === 'friends') return p.status !== 'offline';
    if (filter === 'lfg') return p.lfg;
    if (filter === 'streamers') return p.streaming;
    return true;
  });

  const startEdit = () => {
    setGameInput(myPresence?.current_game || '');
    setPlatformInput(myPresence?.platform || accounts[user.id]?.platform || '');
    setEditing(true);
  };

  const saveNowPlaying = async () => {
    setSaving(true);
    try {
      const game = gameInput.trim();
      const platform = platformInput;
      await updateMyPresence({ current_game: game, platform });
      setPresences((prev) => {
        const exists = prev.find((p) => p.user_id === user.id);
        if (exists) return prev.map((p) => p.user_id === user.id ? { ...p, current_game: game, platform, last_seen: new Date().toISOString() } : p);
        return [...prev, { user_id: user.id, status: 'online', current_game: game, platform, last_seen: new Date().toISOString() }];
      });
      setEditing(false);
    } finally { setSaving(false); }
  };

  const stopNowPlaying = async () => {
    setSaving(true);
    try {
      await updateMyPresence({ current_game: '', platform: '' });
      setPresences((prev) => prev.map((p) => p.user_id === user.id ? { ...p, current_game: '', platform: '' } : p));
    } finally { setSaving(false); }
  };

  const onlineCount = radar.filter((p) => p.status !== 'offline').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12 animate-fade-in">
      <PageHeader icon={Radio} title="Gaming Radar" subtitle={`${onlineCount} of ${radar.length} friends online right now`} />

      <Card className="p-4 mb-5 bg-primary/5 border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Your status</p>
            <p className={cn('text-sm font-semibold flex items-center gap-2', statusColors[myStatus])}>
              <span className={cn('w-2 h-2 rounded-full', dotColors[myStatus])} />
              {statusLabels[myStatus]}{myPresence?.current_game ? ` · ${myPresence.current_game}` : ''}
            </p>
          </div>
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <Input value={gameInput} onChange={(e) => setGameInput(e.target.value)} placeholder="Now playing…" className="h-8 w-36 text-sm" aria-label="Game" />
              <select value={platformInput} onChange={(e) => setPlatformInput(e.target.value)} className="h-8 text-sm rounded-md bg-card border border-border px-2" aria-label="Platform">
                <option value="">Platform</option>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <Button size="sm" onClick={saveNowPlaying} disabled={saving}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={startEdit}>
                <Pencil className="w-3.5 h-3.5" /> {myPresence?.current_game ? 'Update' : 'Set Now Playing'}
              </Button>
              {myPresence?.current_game && (
                <Button size="sm" variant="ghost" onClick={stopNowPlaying} disabled={saving} aria-label="Stop now playing">
                  <Square className="w-3.5 h-3.5" /> Stop
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

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
            <EmptyState icon={Users} title="No one here yet" description={radar.length === 0 ? "Follow some gamers to see them on your radar!" : "No friends match this filter right now."} action={radar.length === 0 ? <Link to="/explore" className="inline-block mt-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">Discover Gamers</Link> : null} />
          ) : (
            <div className="space-y-3 stagger">
              {filtered.map((p) => (
                <div key={p.user.id} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 flex items-center gap-3">
                  <Link to={`/profile/${p.user.id}`} className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {(p.user.display_name || p.user.full_name || 'G').charAt(0)}
                    </div>
                    <span className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card', dotColors[p.status])} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${p.user.id}`} className="font-semibold text-sm hover:text-primary transition-colors">{p.user.display_name || p.user.full_name}</Link>
                    {p.game ? (
                      <>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {p.game}{p.platform ? ` · ${p.platform}` : ''}</p>
                        <p className={cn('text-[10px] font-medium', statusColors[p.status])}>{statusLabels[p.status]} · {p.isOnline ? `active ${p.mins}m` : `${p.mins}m ago`}</p>
                      </>
                    ) : (
                      <p className={cn('text-xs font-medium', statusColors[p.status])}>
                        {statusLabels[p.status]}
                        {p.status === 'offline' && p.mins > 0 ? ` · ${p.mins}m ago` : ''}
                      </p>
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