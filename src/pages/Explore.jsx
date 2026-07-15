import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlatformIcon } from '@/components/profile/GameAccountBadge';
import PersonalityBadge from '@/components/shared/PersonalityBadge';
import CompatibilityScore, { calculateCompatibility } from '@/components/shared/CompatibilityScore';
import { Loader2, Search, Users, UserPlus, UserCheck, TrendingUp, Trophy, Sparkles, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Explore() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [accountsMap, setAccountsMap] = useState({});
  const [followingIds, setFollowingIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('recommended');

  useEffect(() => {
    Promise.all([
      base44.entities.User.list(),
      base44.entities.GameAccount.list('-created_date', 200),
      base44.entities.Follow.filter({ follower_id: currentUser?.id }),
    ]).then(([allUsers, allAccounts, follows]) => {
      setUsers(allUsers.filter((u) => u.id !== currentUser?.id));
      const accMap = {};
      allAccounts.forEach((a) => {
        if (!accMap[a.created_by_id]) accMap[a.created_by_id] = [];
        accMap[a.created_by_id].push(a);
      });
      setAccountsMap(accMap);
      setFollowingIds(new Set(follows.map((f) => f.following_id)));
    }).finally(() => setLoading(false));
  }, [currentUser?.id]);

  const toggleFollow = async (userId) => {
    const newSet = new Set(followingIds);
    if (newSet.has(userId)) {
      const existing = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: userId });
      if (existing[0]) await base44.entities.Follow.delete(existing[0].id);
      newSet.delete(userId);
    } else {
      await base44.entities.Follow.create({ follower_id: currentUser.id, following_id: userId });
      newSet.add(userId);
      await base44.entities.Notification.create({
        type: 'follow', content: `${currentUser?.display_name || 'Someone'} started following you`, link: `/profile/${currentUser?.id}`,
        actor_id: currentUser?.id, actor_name: currentUser?.display_name || currentUser?.full_name,
      });
    }
    setFollowingIds(newSet);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const withCompat = users.map((u) => ({ user: u, compat: calculateCompatibility(currentUser, u) }));
  const recommended = [...withCompat].sort((a, b) => b.compat - a.compat).slice(0, 12);
  const trending = [...withCompat].sort((a, b) => (b.user.achievement_score || 0) - (a.user.achievement_score || 0)).slice(0, 12);
  const leaderboard = [...users].sort((a, b) => (b.achievement_score || 0) - (a.user?.achievement_score || 0)).slice(0, 20);
  const recentlyJoined = [...users].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 12);

  const filtered = (list) => list.filter(({ user: u }) => {
    const name = (u.display_name || u.full_name || u.email || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const renderUserRow = ({ user: u, compat }) => {
    const initials = (u.display_name || u.full_name || u.email || 'G').charAt(0).toUpperCase();
    const accs = accountsMap[u.id] || [];
    const isFollowing = followingIds.has(u.id);
    return (
      <div key={u.id} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
        <Link to={`/profile/${u.id}`}>
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={u.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <Link to={`/profile/${u.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{u.display_name || u.full_name || 'Gamer'}</p>
            <PersonalityBadge personality={u.gaming_personality} className="!py-0.5 !text-xs" />
          </div>
          {u.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{u.bio}</p>}
          {accs.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {accs.slice(0, 4).map((a) => <PlatformIcon key={a.id} platform={a.platform} className="w-3.5 h-3.5" />)}
              {u.achievement_score > 0 && <span className="text-xs text-amber-400 font-medium">🏆 {u.achievement_score}</span>}
            </div>
          )}
        </Link>
        {compat > 0 && <CompatibilityScore score={compat} size="sm" />}
        <Button onClick={() => toggleFollow(u.id)} variant={isFollowing ? 'secondary' : 'default'} size="sm" className="rounded-full shrink-0">
          {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span className="hidden sm:inline ml-1">{isFollowing ? 'Following' : 'Follow'}</span>
        </Button>
      </div>
    );
  };

  const tabs = [
    { key: 'recommended', label: 'Recommended', icon: Sparkles, list: filtered(recommended) },
    { key: 'trending', label: 'Trending', icon: TrendingUp, list: filtered(trending) },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, list: filtered(leaderboard.map((u) => ({ user: u, compat: 0 }))) },
    { key: 'recent', label: 'Recently Joined', icon: Users, list: filtered(recentlyJoined.map((u) => ({ user: u, compat: 0 }))) },
  ];

  const activeTab = tabs.find((t) => t.key === tab);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">Discover Gamers</h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gamers..." className="pl-10 rounded-full bg-card/50" />
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'leaderboard' ? (
        <div className="space-y-2">
          {activeTab.list.map(({ user: u }, idx) => {
            const initials = (u.display_name || u.full_name || u.email || 'G').charAt(0).toUpperCase();
            const medalColor = idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-muted-foreground';
            return (
              <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/50 hover:ring-1 hover:ring-primary/30 transition-all">
                <span className={cn('w-8 text-center font-bold flex items-center justify-center', medalColor)}>
                  {idx < 3 ? <Medal className="w-5 h-5 mx-auto" /> : idx + 1}
                </span>
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{u.display_name || u.full_name || 'Gamer'}</p>
                  {u.gaming_personality && <p className="text-xs text-muted-foreground truncate">{u.gaming_personality}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-400">{u.achievement_score || 0}</p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : activeTab.list.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">No gamers found.</p>
      ) : (
        <div className="space-y-3">{activeTab.list.map(renderUserRow)}</div>
      )}
    </div>
  );
}