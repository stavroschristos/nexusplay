import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCardGrid } from '@/components/shared/Skeleton';
import GamerCard from '@/components/explore/GamerCard';
import GameCard from '@/components/shared/GameCard';
import CommunityCard from '@/components/explore/CommunityCard';
import PostCard from '@/components/feed/PostCard';
import { createNotification } from '@/lib/notifications';
import { Search as SearchIcon, Users, Gamepad2, Hash, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'gamers', label: 'Gamers', icon: Users },
  { key: 'games', label: 'Games', icon: Gamepad2 },
  { key: 'communities', label: 'Communities', icon: Hash },
  { key: 'posts', label: 'Posts', icon: MessageSquare },
];

export default function Search() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('gamers');
  const [gamers, setGamers] = useState([]);
  const [games, setGames] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.functions.invoke('publicUsers', { action: 'list' }).then((r) => r.data.users || []),
      base44.entities.Game.list('-created_date', 100),
      base44.entities.Community.list('-members_count', 100),
      base44.entities.Post.filter({ hidden: { $ne: true } }, '-created_date', 100),
      base44.entities.Follow.filter({ follower_id: currentUser?.id }),
    ]).then(([u, g, c, p, follows]) => {
      setGamers(u.filter((x) => x.id !== currentUser?.id && (x.privacy_profile || 'public') !== 'private'));
      setGames(g || []);
      setCommunities(c || []);
      setPosts(p || []);
      const map = {};
      u.forEach((x) => { map[x.id] = x; });
      setAuthors(map);
      setFollowingIds(new Set(follows.map((f) => f.following_id)));
    }).finally(() => setLoading(false));
  }, [currentUser?.id]);

  const toggleFollow = async (userId) => {
    const newSet = new Set(followingIds);
    const willFollow = !newSet.has(userId);
    try {
      if (!willFollow) {
        const existing = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: userId });
        if (existing[0]) await base44.entities.Follow.delete(existing[0].id);
        newSet.delete(userId);
        toast({ title: 'Unfollowed' });
      } else {
        await base44.entities.Follow.create({ follower_id: currentUser.id, following_id: userId });
        newSet.add(userId);
        await createNotification({
          recipientId: userId, type: 'follow',
          content: `${currentUser?.display_name || 'Someone'} started following you`,
          link: `/profile/${currentUser?.id}`, icon: '🤝',
          actorId: currentUser?.id, actorName: currentUser?.display_name || currentUser?.full_name,
        });
        toast({ title: 'Following' });
      }
      setFollowingIds(newSet);
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  const query = q.trim().toLowerCase();
  const has = (text) => (text || '').toLowerCase().includes(query);

  const filteredGamers = useMemo(() => {
    if (!query) return gamers;
    return gamers.filter((u) => has(u.display_name) || has(u.gamer_tag) || has(u.bio));
  }, [gamers, query]);

  const filteredGames = useMemo(() => {
    if (!query) return games;
    return games.filter((g) => has(g.title) || has(g.developer) || has(g.publisher) || (g.genres || []).some(has));
  }, [games, query]);

  const filteredCommunities = useMemo(() => {
    if (!query) return communities;
    return communities.filter((c) => has(c.name) || has(c.description) || has(c.category));
  }, [communities, query]);

  const filteredPosts = useMemo(() => {
    if (!query) return posts;
    return posts.filter((p) => has(p.content) || has(p.game_title));
  }, [posts, query]);

  const counts = {
    gamers: filteredGamers.length,
    games: filteredGames.length,
    communities: filteredCommunities.length,
    posts: filteredPosts.length,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <PageHeader icon={SearchIcon} title="Search" subtitle="Find gamers, games, communities, and posts" />

      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across NexusPlay..." className="pl-10 rounded-full bg-card/50" aria-label="Search NexusPlay" autoFocus />
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all', tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}>
            <t.icon className="w-4 h-4" /> {t.label}
            {counts[t.key] > 0 && <span className="text-xs opacity-80">{counts[t.key]}</span>}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {loading ? (
          <SkeletonCardGrid count={4} />
        ) : tab === 'gamers' ? (
          filteredGamers.length === 0 ? <EmptyState icon={Users} title="No gamers found" description="Try a different name or gamer tag." /> : (
            <div className="grid sm:grid-cols-2 gap-3 stagger">
              {filteredGamers.slice(0, 30).map((u) => (
                <GamerCard key={u.id} user={u} isFollowing={followingIds.has(u.id)} onToggleFollow={toggleFollow} showReasons={false} />
              ))}
            </div>
          )
        ) : tab === 'games' ? (
          filteredGames.length === 0 ? <EmptyState icon={Gamepad2} title="No games found" description="Try a different title or genre." /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger">
              {filteredGames.slice(0, 30).map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          )
        ) : tab === 'communities' ? (
          filteredCommunities.length === 0 ? <EmptyState icon={Hash} title="No communities found" description="Try a different keyword or category." /> : (
            <div className="grid sm:grid-cols-2 gap-3 stagger">
              {filteredCommunities.slice(0, 30).map((c) => <CommunityCard key={c.id} community={c} />)}
            </div>
          )
        ) : (
          filteredPosts.length === 0 ? <EmptyState icon={MessageSquare} title="No posts found" description="No posts match your search yet." /> : (
            <div className="space-y-4 stagger">
              {filteredPosts.slice(0, 30).map((p) => <PostCard key={p.id} post={p} author={authors[p.created_by_id]} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}