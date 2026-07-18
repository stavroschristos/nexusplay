import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { createNotification } from '@/lib/notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlatformIcon } from '@/components/profile/GameAccountBadge';
import GamerCard from '@/components/explore/GamerCard';
import CommunityCard from '@/components/explore/CommunityCard';
import TrendingGameCard from '@/components/explore/TrendingGameCard';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCardGrid, SkeletonList } from '@/components/shared/Skeleton';
import {
  getCompatibilityBreakdown,
  sharedGamesCount,
  sharedHabitsCount,
  achievementSimilarity,
} from '@/lib/compatibility';
import {
  Search, Users, UserPlus, UserCheck, Sparkles, TrendingUp, Trophy,
  Gamepad2, Flame, Crown, Heart, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'recommended', label: 'For You', icon: Sparkles },
  { key: 'shared', label: 'Shared Libraries', icon: Gamepad2 },
  { key: 'habits', label: 'Similar Habits', icon: Layers },
  { key: 'achievers', label: 'Achievement Twins', icon: Trophy },
  { key: 'trending', label: 'Trending Gamers', icon: TrendingUp },
  { key: 'creators', label: 'Rising Creators', icon: Heart },
  { key: 'communities', label: 'Communities', icon: Users },
  { key: 'games', label: 'Trending Games', icon: Flame },
  { key: 'recent', label: 'New Gamers', icon: Crown },
];

export default function Explore() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [accountsMap, setAccountsMap] = useState({});
  const [followingIds, setFollowingIds] = useState(new Set());
  const [communities, setCommunities] = useState([]);
  const [games, setGames] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [creatorStats, setCreatorStats] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('recommended');

  useEffect(() => {
    Promise.all([
      base44.functions.invoke('publicUsers', { action: 'list' }).then((r) => r.data.users || []),
      base44.entities.GameAccount.list('-created_date', 200),
      base44.entities.Follow.filter({ follower_id: currentUser?.id }),
      base44.entities.Community.list('-members_count', 50),
      base44.entities.Game.list('-created_date', 100),
      base44.entities.GameReview.list('-created_date', 200),
      base44.entities.Post.list('-created_date', 200),
    ]).then(([allUsers, allAccounts, follows, comms, allGames, reviews, posts]) => {
      setUsers(allUsers.filter((u) => u.id !== currentUser?.id && (u.privacy_profile || 'public') !== 'private'));
      const accMap = {};
      allAccounts.forEach((a) => {
        if (!accMap[a.created_by_id]) accMap[a.created_by_id] = [];
        accMap[a.created_by_id].push(a);
      });
      setAccountsMap(accMap);
      setFollowingIds(new Set(follows.map((f) => f.following_id)));
      setCommunities(comms || []);
      setGames(allGames || []);

      const rStats = {};
      (reviews || []).forEach((r) => {
        const gid = r.game_id;
        if (!rStats[gid]) rStats[gid] = { count: 0, totalRating: 0 };
        rStats[gid].count++;
        rStats[gid].totalRating += r.rating || 0;
      });
      setReviewStats(rStats);

      const cStats = {};
      (posts || []).forEach((p) => {
        const uid = p.created_by_id;
        if (!cStats[uid]) cStats[uid] = { likes: 0, comments: 0, posts: 0 };
        cStats[uid].likes += p.likes_count || 0;
        cStats[uid].comments += p.comments_count || 0;
        cStats[uid].posts++;
      });
      setCreatorStats(cStats);
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

  const userData = useMemo(() => {
    return users.map((u) => {
      const breakdown = getCompatibilityBreakdown(currentUser, u);
      return {
        user: u,
        breakdown,
        sharedGames: sharedGamesCount(currentUser, u),
        sharedHabits: sharedHabitsCount(currentUser, u),
        achSimilarity: achievementSimilarity(currentUser, u),
      };
    });
  }, [users, currentUser]);

  const filtered = (list) => list.filter(({ user: u }) => {
    // Private profiles are excluded from public discovery; never search by email.
    if ((u.privacy_profile || 'public') === 'private') return false;
    if (!search) return true;
    const name = (u.display_name || u.gamer_tag || u.full_name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const recommended = [...userData].sort((a, b) => b.breakdown.score - a.breakdown.score).slice(0, 20);
  const sharedLib = [...userData].filter((d) => d.sharedGames > 0).sort((a, b) => b.sharedGames - a.sharedGames || b.breakdown.score - a.breakdown.score).slice(0, 20);
  const habits = [...userData].filter((d) => d.sharedHabits > 0).sort((a, b) => b.sharedHabits - a.sharedHabits || b.breakdown.score - a.breakdown.score).slice(0, 20);
  const achievers = [...userData].sort((a, b) => b.achSimilarity - a.achSimilarity || b.breakdown.score - a.breakdown.score).slice(0, 20);
  const trending = [...userData].sort((a, b) => (b.user.achievement_score || 0) - (a.user.achievement_score || 0)).slice(0, 20);
  const risingCreators = [...userData].filter((d) => creatorStats[d.user.id]?.posts > 0).sort((a, b) => {
    const sa = creatorStats[a.user.id] || { likes: 0, comments: 0 };
    const sb = creatorStats[b.user.id] || { likes: 0, comments: 0 };
    return (sb.likes + sb.comments) - (sa.likes + sa.comments);
  }).slice(0, 20);
  const recentlyJoined = [...userData].sort((a, b) => new Date(b.user.created_date) - new Date(a.user.created_date)).slice(0, 20);

  const trendingGames = useMemo(() => {
    return (games || []).map((g) => {
      const stats = reviewStats[g.id] || { count: 0, totalRating: 0 };
      const avgRating = stats.count > 0 ? stats.totalRating / stats.count : 0;
      return { game: g, reviewCount: stats.count, avgRating };
    }).sort((a, b) => (b.reviewCount + b.avgRating) - (a.reviewCount + a.avgRating)).slice(0, 12);
  }, [games, reviewStats]);

  const popularCommunities = [...(communities || [])].sort((a, b) => (b.members_count || 0) - (a.members_count || 0)).slice(0, 12);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <PageHeader icon={Sparkles} title="Discover Your People" subtitle="Find gamers who match your style, library, and vibe" />
        <div className="h-10 skeleton rounded-full mb-4" />
        <div className="flex gap-1.5 mb-6 overflow-hidden">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton rounded-full h-9 w-24 shrink-0" />)}
        </div>
        <SkeletonCardGrid count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <PageHeader icon={Sparkles} title="Discover Your People" subtitle="Find gamers who match your style, library, and vibe" />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gamers..." className="pl-10 rounded-full bg-card/50" aria-label="Search gamers" />
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-thin pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        <TabContent
          tab={tab}
          recommended={filtered(recommended)}
          sharedLib={filtered(sharedLib)}
          habits={filtered(habits)}
          achievers={filtered(achievers)}
          trending={filtered(trending)}
          risingCreators={filtered(risingCreators)}
          recentlyJoined={filtered(recentlyJoined)}
          popularCommunities={popularCommunities}
          trendingGames={trendingGames}
          accountsMap={accountsMap}
          followingIds={followingIds}
          onToggleFollow={toggleFollow}
          creatorStats={creatorStats}
        />
      </div>
    </div>
  );
}

function TabContent({ tab, recommended, sharedLib, habits, achievers, trending, risingCreators, recentlyJoined, popularCommunities, trendingGames, accountsMap, followingIds, onToggleFollow, creatorStats }) {
  const renderGamerGrid = (list, showReasons = true) => {
    if (list.length === 0) return <EmptyState icon={Users} title="No gamers found" description="Try updating your profile to get better matches!" />;
    return (
      <div className="grid sm:grid-cols-2 gap-3 stagger">
        {list.map((d) => (
          <GamerCard
            key={d.user.id}
            user={d.user}
            accounts={accountsMap[d.user.id] || []}
            breakdown={d.breakdown}
            isFollowing={followingIds.has(d.user.id)}
            onToggleFollow={onToggleFollow}
            showReasons={showReasons}
          />
        ))}
      </div>
    );
  };

  if (tab === 'recommended') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Sparkles} title="Recommended Gamers" subtitle="Highest compatibility matches for you" />
        {renderGamerGrid(recommended)}
      </div>
    );
  }

  if (tab === 'shared') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Gamepad2} title="Shared Libraries" subtitle="Gamers who play the same games as you" />
        {sharedLib.length === 0 ? <EmptyState icon={Gamepad2} title="No shared games yet" description="Add more favorite games in your profile settings to find matches!" /> : renderGamerGrid(sharedLib)}
      </div>
    );
  }

  if (tab === 'habits') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Layers} title="Similar Gaming Habits" subtitle="Gamers who share your play style and habits" />
        {habits.length === 0 ? <EmptyState icon={Layers} title="No habit matches yet" description="Set your gaming habits in profile settings to find like-minded gamers!" /> : renderGamerGrid(habits)}
      </div>
    );
  }

  if (tab === 'achievers') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Trophy} title="Achievement Twins" subtitle="Gamers with similar trophy and completion patterns" />
        {renderGamerGrid(achievers)}
      </div>
    );
  }

  if (tab === 'trending') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={TrendingUp} title="Trending Gamers" subtitle="Top gamers by achievement score" />
        {trending.length === 0 ? <EmptyState icon={TrendingUp} title="No gamers found" /> : (
          <div className="space-y-2 stagger">
            {trending.map(({ user: u, breakdown }, idx) => (
              <TrendingGamerRow key={u.id} user={u} breakdown={breakdown} rank={idx} accounts={accountsMap[u.id] || []} isFollowing={followingIds.has(u.id)} onToggleFollow={onToggleFollow} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === 'creators') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Heart} title="Rising Creators" subtitle="Gamers creating the most engaging content" />
        {risingCreators.length === 0 ? (
          <EmptyState icon={Heart} title="No creators yet" description="Be the first to share posts and activities!" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 stagger">
            {risingCreators.map((d) => {
              const stats = creatorStats[d.user.id] || {};
              return (
                <CreatorCard
                  key={d.user.id}
                  user={d.user}
                  accounts={accountsMap[d.user.id] || []}
                  breakdown={d.breakdown}
                  stats={stats}
                  isFollowing={followingIds.has(d.user.id)}
                  onToggleFollow={onToggleFollow}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (tab === 'communities') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Users} title="Popular Communities" subtitle="Active communities you can join" />
        {popularCommunities.length === 0 ? <EmptyState icon={Users} title="No communities yet" /> : (
          <div className="grid sm:grid-cols-2 gap-3 stagger">
            {popularCommunities.map((c) => <CommunityCard key={c.id} community={c} />)}
          </div>
        )}
      </div>
    );
  }

  if (tab === 'games') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Flame} title="Trending Games" subtitle="Most reviewed and talked-about games" />
        {trendingGames.length === 0 ? <EmptyState icon={Flame} title="No games yet" description="Games will appear here once they're added to the database." /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 stagger">
            {trendingGames.map(({ game, reviewCount, avgRating }) => (
              <TrendingGameCard key={game.id} game={game} reviewCount={reviewCount} avgRating={avgRating} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (tab === 'recent') {
    return (
      <div className="space-y-4">
        <SectionHeader icon={Crown} title="Recently Joined" subtitle="Newest members of the community" />
        {renderGamerGrid(recentlyJoined, false)}
      </div>
    );
  }

  return null;
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h2 className="font-bold text-base">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function TrendingGamerRow({ user, breakdown, rank, accounts, isFollowing, onToggleFollow }) {
  const initials = (user.display_name || user.full_name || 'G').charAt(0).toUpperCase();
  const medalColor = rank === 0 ? 'text-amber-400' : rank === 1 ? 'text-slate-300' : rank === 2 ? 'text-orange-400' : 'text-muted-foreground';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/50 hover:ring-1 hover:ring-primary/30 transition-all">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <span className={cn('w-8 text-center font-bold flex items-center justify-center', medalColor)}>
          {rank < 3 ? <Crown className="w-5 h-5 mx-auto" /> : rank + 1}
        </span>
        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user.display_name || user.full_name || 'Gamer'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {user.achievement_score > 0 && <span className="text-xs text-amber-400 font-medium">🏆 {user.achievement_score}</span>}
            {accounts.slice(0, 3).map((a) => <PlatformIcon key={a.id} platform={a.platform} className="w-3.5 h-3.5" />)}
          </div>
        </div>
      </Link>
      {breakdown?.score > 0 && <span className="text-xs text-muted-foreground shrink-0">{breakdown.score}% match</span>}
      <Button onClick={() => onToggleFollow(user.id)} variant={isFollowing ? 'secondary' : 'default'} size="sm" className="rounded-full shrink-0" aria-label={isFollowing ? 'Unfollow' : 'Follow'}>
        {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function CreatorCard({ user, accounts, breakdown, stats, isFollowing, onToggleFollow }) {
  const initials = (user.display_name || user.full_name || 'G').charAt(0).toUpperCase();
  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${user.id}`} className="shrink-0">
          <Avatar className="w-14 h-14 ring-2 ring-primary/20">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <Link to={`/profile/${user.id}`} className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{user.display_name || user.full_name || 'Gamer'}</p>
          {user.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>}
        </Link>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground"><span className="font-bold text-foreground">{stats.posts || 0}</span> posts</span>
        <span className="text-muted-foreground"><span className="font-bold text-rose-400">{stats.likes || 0}</span> likes</span>
        <span className="text-muted-foreground"><span className="font-bold text-blue-400">{stats.comments || 0}</span> comments</span>
      </div>
      <Button onClick={() => onToggleFollow(user.id)} variant={isFollowing ? 'secondary' : 'default'} size="sm" className="w-full rounded-full">
        {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
      </Button>
    </div>
  );
}