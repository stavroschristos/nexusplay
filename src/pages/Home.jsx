import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PostComposer from '@/components/feed/PostComposer';
import PostCard from '@/components/feed/PostCard';
import GameCard from '@/components/shared/GameCard';
import HomeDashboard from '@/components/home/HomeDashboard';
import WelcomeBanner from '@/components/onboarding/WelcomeBanner';
import NewUserChecklist from '@/components/onboarding/NewUserChecklist';
import OnboardingResumeBanner from '@/components/onboarding/OnboardingResumeBanner';
import SmartRecommendations from '@/components/onboarding/SmartRecommendations';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonFeed } from '@/components/shared/Skeleton';
import { Sparkles, TrendingUp, Flame, Users, LayoutDashboard, MessageSquare, Compass, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFounder } from '@/lib/founder';
import FounderBadge from '@/components/profile/FounderBadge';

export default function Home() {
  const { user, checkUserAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all');
  const [view, setView] = useState('dashboard');
  const [trendingGames, setTrendingGames] = useState([]);
  const [founder, setFounder] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (feedFilter === 'activities') {
        res = await base44.entities.Post.filter({ type: 'activity', hidden: { $ne: true } }, '-created_date', 20);
      } else {
        res = await base44.entities.Post.filter({ hidden: { $ne: true } }, '-created_date', 20);
      }
      setPosts(res);
      const authorIds = [...new Set(res.map((p) => p.created_by_id))];
      const missing = authorIds.filter((id) => id && !authors[id]);
      if (missing.length > 0) {
        const pubRes = await base44.functions.invoke('publicUsers', { action: 'list' });
        const users = pubRes.data?.users || [];
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
    getFounder().then(setFounder).catch(() => {});
  }, []);

  useEffect(() => {
    loadPosts();
  }, [feedFilter]);

  const handlePosted = (post) => setPosts((p) => [post, ...p]);
  const handleDeleted = (id) => setPosts((p) => p.filter((post) => post.id !== id));

  const sidebarLinks = [
    { to: '/explore', icon: Users, label: 'Find gamers' },
    { to: '/communities', icon: Users, label: 'Join communities' },
    { to: '/lfg', icon: Target, label: 'Looking for group' },
    { to: '/wrapped', icon: Flame, label: 'Gaming Wrapped' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="max-w-2xl w-full mx-auto lg:mx-0">
        <PageHeader icon={Sparkles} title={user?.display_name ? `Hey, ${user.display_name.split(' ')[0]}` : 'Gamer Feed'} subtitle={view === 'dashboard' ? 'Your gaming identity, at a glance' : 'Automatic activity from across your network'} />

        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-card/50 border border-border">
          <button onClick={() => setView('dashboard')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5', view === 'dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          <button onClick={() => setView('feed')} className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5', view === 'feed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
            <MessageSquare className="w-4 h-4" /> Feed
          </button>
        </div>

        {view === 'dashboard' ? (
          <div className="space-y-5 animate-fade-in">
            {user?.onboarding_started && !user?.has_onboarded && <OnboardingResumeBanner user={user} />}
            {!user?.has_seen_welcome && <WelcomeBanner user={user} onSeen={checkUserAuth} />}
            <NewUserChecklist />
            <SmartRecommendations user={user} />
            <HomeDashboard />
          </div>
        ) : (
          <div className="animate-fade-in">
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
              <SkeletonFeed />
            ) : posts.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Your activity will appear here"
                description="Connect your platforms and NexusPlay automatically turns your gameplay into social moments — new games, achievements, platinums, and milestones. No manual posting required."
                action={
                  <Link to="/settings" className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                    Connect your platforms <ArrowRight className="w-4 h-4" />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4 stagger">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} author={authors[post.created_by_id]} onDeleted={handleDeleted} />
                ))}
              </div>
            )}
          </div>
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
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-lg h-16" />)}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
              {trendingGames.map((g) => <GameCard key={g.id} game={g} size="sm" />)}
            </div>
          )}
          <Link to="/games" className="text-xs text-primary hover:underline mt-2 inline-block">Browse all games →</Link>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Discover</h3>
          </div>
          <div className="space-y-1">
            {sidebarLinks.map((l) => (
              <Link key={l.to} to={l.to} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg py-2 px-2 transition-colors">
                <l.icon className="w-4 h-4" /> {l.label}
              </Link>
            ))}
          </div>
        </div>

        {founder && (
          <Link to={`/profile/${founder.id}`} className="block rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-fuchsia-500/5 p-4 hover:border-amber-500/50 transition-colors">
            <div className="mb-2"><FounderBadge /></div>
            <p className="text-sm font-semibold">{founder.display_name || 'The Founder'}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">See what a complete gaming identity looks like — every platform, every trophy, in one profile.</p>
          </Link>
        )}
      </aside>
    </div>
  );
}