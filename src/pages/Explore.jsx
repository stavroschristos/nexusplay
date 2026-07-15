import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/profile/GameAccountBadge';
import { Loader2, Search, UserPlus, UserCheck, Users } from 'lucide-react';

export default function Explore() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [accountsMap, setAccountsMap] = useState({});
  const [followingIds, setFollowingIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list(),
      base44.entities.GameAccount.list('-created_date', 200),
      base44.entities.Follow.filter({ follower_id: currentUser?.id }),
    ]).then(([allUsers, allAccounts, follows]) => {
      const others = allUsers.filter((u) => u.id !== currentUser?.id);
      setUsers(others);
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
    }
    setFollowingIds(newSet);
  };

  const filtered = users.filter((u) => {
    const name = (u.display_name || u.full_name || u.email || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">Discover Gamers</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search gamers..."
          className="pl-10 rounded-full bg-card/50"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">No gamers found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => {
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
                  <p className="font-semibold text-sm truncate">{u.display_name || u.full_name || 'Gamer'}</p>
                  {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                  {accs.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      {accs.slice(0, 4).map((a) => (
                        <PlatformIcon key={a.id} platform={a.platform} className="w-3.5 h-3.5" />
                      ))}
                      <span className="text-xs text-muted-foreground">{accs.length} accounts</span>
                    </div>
                  )}
                </Link>
                <Button
                  onClick={() => toggleFollow(u.id)}
                  variant={isFollowing ? 'secondary' : 'default'}
                  size="sm"
                  className="rounded-full shrink-0"
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span className="hidden sm:inline ml-1">{isFollowing ? 'Following' : 'Follow'}</span>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}