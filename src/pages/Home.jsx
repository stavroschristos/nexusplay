import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PostComposer from '@/components/feed/PostComposer';
import PostCard from '@/components/feed/PostCard';
import GameCard from '@/components/shared/GameCard';
import HomeDashboard from '@/components/home/HomeDashboard';
import { Loader2, Sparkles, TrendingUp, Flame, Users, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all');
  const [view, setView] = useState('dashboard');
  const [trendingGames, setTrendingGames] = useState([]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (feedFilter === 'activities') {
        res = await base44.entities.Post.filter({ type: 'activity' }, '-created_date', 20);
      } else {
        res = await base44.entities.Post.list('-created_date', 20);
      }
      setPosts(res);
      const authorIds = [...new Set(res.map((p) => p.created_by_id))];
      const missing = authorIds.filter((id) => id && !authors[id]);
      if (missing.length > 0) {
        const users = await base44.entities.User.list();
        const map = { ...authors };
        users.forEach((u) => { map[u.id] = u; });
        setAuthors(map);
      }
    } finally {
      setLoading(false);
    }
  }, [feedFilter, authors]);

  useEffect(() => {
    base44.entities.Game.list('-created_date', 10).then(setTrendingGames).catch(() => {});
  }, []);

  useEffect(() => {
    loadPosts();
  }, [feedFilter]);

  const handlePosted = (post) => setPosts((p) => [post, ...p]);
  const handleDeleted = (id) => setPosts((p) => p.filter((post) => post.id !== id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="max-w-2xl w-full mx-auto lg:mx-0">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">Gamer Feed</h1>
        </div>

        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-card/50 border border-border">
          <button onClick={() => setView('dashboard')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5', view === 'dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => setView('feed')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all', view === 'feed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            Feed
          </button>
        </div>

        {view === 'dashboard' ? (
          <HomeDashboard />
        ) : (
          <>
        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-card/50 border border-border">
          {[
            { key: 'all', label: 'All' },
            { key: 'activities', label: 'Activity' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFeedFilter(f.key)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                feedFilter === f.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <PostComposer user={user} onPosted={handlePosted} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">No posts yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} author={authors[post.created_by_id]} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:block space-y-4">
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Trending Games</h3>
          </div>
          {trendingGames.length === 0 ? (
            <p className="text-xs text-muted-foreground">No games yet.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
              {trendingGames.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
            </div>
          )}
          <Link to="/games" className="text-xs text-primary hover:underline mt-2 inline-block">Browse all games →</Link>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Discover</h3>
          </div>
          <Link to="/explore" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5">
            <Users className="w-4 h-4" /> Find gamers
          </Link>
          <Link to="/communities" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5">
            <Users className="w-4 h-4" /> Join communities
          </Link>
          <Link to="/lfg" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5">
            <Users className="w-4 h-4" /> Looking for group
          </Link>
          <Link to="/wrapped" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-1.5">
            <Flame className="w-4 h-4" /> Gaming Wrapped
          </Link>
        </div>
      </aside>
    </div>
  );
}