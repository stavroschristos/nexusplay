import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/feed/PostCard';
import GameAccountBadge from '@/components/profile/GameAccountBadge';
import AchievementCard from '@/components/profile/AchievementCard';
import GamingStats from '@/components/profile/GamingStats';
import GamingTimeline from '@/components/profile/GamingTimeline';
import PersonalityBadge from '@/components/shared/PersonalityBadge';
import CompatibilityScore, { calculateCompatibility } from '@/components/shared/CompatibilityScore';
import CollectionCard from '@/components/shared/CollectionCard';
import IdentityCard from '@/components/profile/IdentityCard';
import AchievementShowcase from '@/components/profile/AchievementShowcase';
import TopListCard from '@/components/profile/TopListCard';
import GamingSetupShowcase from '@/components/profile/GamingSetupShowcase';
import FavoriteGamesShowcase from '@/components/profile/FavoriteGamesShowcase';
import { getTheme } from '@/components/profile/themeConfig';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { Loader2, UserPlus, UserCheck, Trophy, Gamepad2, MessageSquare, Star, Layers, Award, Zap, Clock, Share2, ListOrdered, Monitor, Sparkles, Ban, ShieldAlert, Lock } from 'lucide-react';
import ShareCard from '@/components/share/ShareCard';
import { canView, canMessage, displayName as publicName } from '@/lib/privacy';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const profileId = id || currentUser?.id;

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [collections, setCollections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [memories, setMemories] = useState([]);
  const [topLists, setTopLists] = useState([]);
  const [setups, setSetups] = useState([]);
  const [games, setGames] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [ownerFollowsViewer, setOwnerFollowsViewer] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    Promise.all([
      base44.entities.User.list(),
      base44.entities.Post.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.GameAccount.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.Achievement.filter({ created_by_id: profileId }, '-earned_date', 50),
      base44.entities.Collection.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.GameReview.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.Timeline.filter({ created_by_id: profileId }, '-year', 50),
      base44.entities.Memory.filter({ created_by_id: profileId }, '-memory_date', 50),
      base44.entities.TopList.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.GamingSetup.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.Game.list('-created_date', 200),
      base44.entities.Follow.filter({ following_id: profileId }),
      base44.entities.Follow.filter({ follower_id: profileId }),
    ]).then(([users, userPosts, userAccounts, userAch, userCols, userReviews, userMilestones, userMemories, userTopLists, userSetups, allGames, followersList, followingList]) => {
      const u = users.find((x) => x.id === profileId) || (profileId === currentUser?.id ? currentUser : null);
      setProfileUser(u);
      setPosts(userPosts);
      setAccounts(userAccounts);
      setAchievements(userAch);
      setCollections(userCols);
      setReviews(userReviews);
      setMilestones(userMilestones);
      setMemories(userMemories);
      setTopLists(userTopLists);
      setSetups(userSetups);
      setGames(allGames);
      setFollowers(followersList.length);
      setFollowing(followingList.length);
      setIsFollowing(followersList.some((f) => f.follower_id === currentUser?.id));
      setOwnerFollowsViewer(followingList.some((f) => f.following_id === currentUser?.id));
      if (profileId !== currentUser?.id) {
        base44.entities.Block.filter({ blocked_id: profileId }).then((b) => setIsBlocked(b.length > 0)).catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, [profileId, currentUser]);

  const toggleFollow = async () => {
    if (isFollowing) {
      const existing = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: profileId });
      if (existing[0]) await base44.entities.Follow.delete(existing[0].id);
      setIsFollowing(false); setFollowers((f) => f - 1);
    } else {
      await base44.entities.Follow.create({ follower_id: currentUser.id, following_id: profileId });
      setIsFollowing(true); setFollowers((f) => f + 1);
      await base44.entities.Notification.create({
        type: 'follow', content: `${currentUser?.display_name || 'Someone'} started following you`, link: `/profile/${currentUser?.id}`,
        actor_id: currentUser?.id, actor_name: currentUser?.display_name || currentUser?.full_name,
      });
    }
  };

  const startChat = async () => {
    const viewer = { id: currentUser?.id, isFriend: isFollowing && ownerFollowsViewer, isAdmin: currentUser?.role === 'admin' };
    if (isBlocked) { toast({ title: 'Unblock this gamer to message them', variant: 'destructive' }); return; }
    const blockedByThem = await base44.entities.Block.filter({ created_by_id: profileId, blocked_id: currentUser?.id }).catch(() => []);
    if (blockedByThem.length > 0) { toast({ title: 'You cannot message this gamer', variant: 'destructive' }); return; }
    if (!canMessage(profileUser, viewer)) {
      toast({ title: 'This gamer is not accepting messages right now', variant: 'destructive' });
      return;
    }
    setStartingChat(true);
    try {
      const [a, b] = [currentUser.id, profileId].sort();
      const key = `${a}_${b}`;
      const existing = await base44.entities.Conversation.filter({ key });
      let conv = existing[0];
      if (!conv) conv = await base44.entities.Conversation.create({ participant_ids: [currentUser.id, profileId], key });
      navigate('/messages', { state: { conversationId: conv.id } });
    } catch { setStartingChat(false); }
  };

  const toggleBlock = async () => {
    try {
      if (isBlocked) {
        const rec = await base44.entities.Block.filter({ blocked_id: profileId });
        if (rec[0]) await base44.entities.Block.delete(rec[0].id);
        setIsBlocked(false);
      } else {
        await base44.entities.Block.create({ blocked_id: profileId, blocked_name: profileUser?.display_name || profileUser?.full_name });
        setIsBlocked(true);
      }
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <div className="h-40 md:h-56 skeleton rounded-none" />
        <div className="px-4 -mt-10 relative">
          <div className="w-24 h-24 md:w-28 md:h-28 skeleton rounded-full ring-4 ring-background" />
          <div className="mt-4 space-y-3">
            <div className="skeleton rounded-lg h-6 w-48" />
            <div className="skeleton rounded-lg h-4 w-72" />
            <div className="flex gap-5 mt-3">
              <div className="skeleton rounded h-5 w-16" />
              <div className="skeleton rounded h-5 w-20" />
              <div className="skeleton rounded h-5 w-20" />
            </div>
          </div>
        </div>
        <div className="px-4 mt-6 space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return <EmptyState icon={Trophy} title="User not found" description="This profile doesn't exist or has been removed." action={<Link to="/" className="text-primary hover:underline text-sm">Back to feed</Link>} />;
  }

  if (!profileVisible) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 grid place-items-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold font-heading">This profile is private</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{publicName(profileUser)} has chosen to keep their gaming identity private. You can still follow them to connect.</p>
        <div className="flex gap-2 justify-center mt-5">
          <Button onClick={toggleFollow} variant={isFollowing ? 'secondary' : 'default'} className="rounded-full">
            {isFollowing ? <><UserCheck className="w-4 h-4" /> Following</> : <><UserPlus className="w-4 h-4" /> Follow</>}
          </Button>
        </div>
      </div>
    );
  }

  const isOwn = profileId === currentUser?.id;
  const isFriend = isFollowing && ownerFollowsViewer;
  const viewer = { id: currentUser?.id, isFriend, isAdmin: currentUser?.role === 'admin' };
  const initials = (profileUser.display_name || profileUser.full_name || 'G').charAt(0).toUpperCase();
  const compatibility = isOwn ? 0 : calculateCompatibility(currentUser, profileUser);
  const theme = getTheme(profileUser.profile_theme);
  const profileVisible = isOwn || viewer.isAdmin || canView(profileUser, 'privacy_profile', viewer);

  const tabs = [
    { key: 'posts', label: 'Posts', icon: MessageSquare, count: posts.length, gate: 'privacy_activity' },
    { key: 'favorites', label: 'Favorites', icon: Star, count: profileUser.favorite_games?.length || 0, gate: 'privacy_library' },
    { key: 'showcase', label: 'Showcase', icon: Trophy, count: achievements.filter((a) => a.is_showcased || a.rarity === 'Legendary' || a.rarity === 'Epic').length, gate: 'privacy_trophies' },
    { key: 'toplists', label: 'Top Lists', icon: ListOrdered, count: topLists.length, gate: 'privacy_library' },
    { key: 'setup', label: 'Setup', icon: Monitor, count: setups.length, gate: 'privacy_library' },
    { key: 'collections', label: 'Collections', icon: Layers, count: collections.length, gate: 'privacy_library' },
    { key: 'reviews', label: 'Reviews', icon: Star, count: reviews.length, gate: 'privacy_library' },
    { key: 'timeline', label: 'Timeline', icon: Trophy, count: milestones.length, gate: 'privacy_activity' },
    { key: 'memories', label: 'Memories', icon: Clock, count: memories.length, gate: 'privacy_activity' },
    { key: 'stats', label: 'Stats', icon: Zap, count: null, gate: 'privacy_stats' },
  ].filter((t) => isOwn || viewer.isAdmin || canView(profileUser, t.gate, viewer));

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-fade-in">
      <div className={`h-40 md:h-56 relative overflow-hidden theme-anim ${theme.animated}`}>
        {profileUser.banner_url ? (
          <img src={profileUser.banner_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.banner}`} />
        )}
        {!profileUser.banner_url && (
          <div className="absolute inset-0 theme-anim" style={{ background: `radial-gradient(ellipse at 30% 50%, ${theme.glow}, transparent 60%), radial-gradient(ellipse at 70% 50%, ${theme.glow}, transparent 60%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="px-4 -mt-12 md:-mt-14 relative">
        <div className="flex items-end justify-between">
          <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-background">
            <AvatarImage src={profileUser.avatar_url} />
            <AvatarFallback className="bg-primary/30 text-primary text-3xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          {isOwn ? (
            <div className="flex gap-2 mb-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/settings">Edit Profile</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link to="/wrapped"><Share2 className="w-4 h-4" /> Share Card</Link>
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 mb-2">
              <Button onClick={toggleFollow} variant={isFollowing ? 'secondary' : 'default'} size="sm" className="rounded-full">
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button onClick={startChat} disabled={startingChat} variant="outline" size="sm" className="rounded-full">
                {startingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                Message
              </Button>
              <Button onClick={toggleBlock} variant="outline" size="sm" className="rounded-full" title={isBlocked ? 'Unblock this user' : 'Block this user'}>
                <Ban className="w-4 h-4" />
                {isBlocked ? 'Unblock' : 'Block'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-heading">{profileUser.display_name || profileUser.full_name || 'Gamer'}</h1>
            {profileUser.is_alpha_tester && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">★ Alpha Tester</span>
            )}
            <PersonalityBadge personality={profileUser.gaming_personality} />
          </div>
          {/* Email is private account data — only visible to the account owner */}
          {isOwn ? (
            <p className="text-sm text-muted-foreground">{profileUser.email}</p>
          ) : profileUser.gamer_tag ? (
            <p className="text-sm text-muted-foreground">@{profileUser.gamer_tag}</p>
          ) : null}
          {profileUser.bio && <p className="text-sm mt-2 text-foreground/80">{profileUser.bio}</p>}

          {profileUser.current_game && canView(profileUser, 'privacy_current_game', viewer) && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">Now playing:</span>
              <span className="font-medium">{profileUser.current_game}</span>
            </div>
          )}

          <div className="flex gap-5 mt-3 text-sm">
            <span><strong>{posts.length}</strong> <span className="text-muted-foreground">Posts</span></span>
            {canView(profileUser, 'privacy_friends', viewer) && (
              <>
                <span><strong>{followers}</strong> <span className="text-muted-foreground">Followers</span></span>
                <span><strong>{following}</strong> <span className="text-muted-foreground">Following</span></span>
              </>
            )}
            {!isOwn && compatibility > 0 && (
              <span className="flex items-center gap-1.5">
                <CompatibilityScore score={compatibility} size="sm" />
                <span className="text-muted-foreground">Compatibility</span>
              </span>
            )}
          </div>

          {(profileUser.favorite_genres?.length > 0 || profileUser.favorite_franchises?.length > 0 || profileUser.platforms_owned?.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profileUser.platforms_owned?.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-md bg-primary/10 text-xs text-primary">{p}</span>
              ))}
              {profileUser.favorite_genres?.map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground">{g}</span>
              ))}
              {profileUser.favorite_franchises?.map((f) => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground">{f}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gaming Identity Card */}
      <div className="px-4 mt-5">
        <IdentityCard user={profileUser} isOwn={isOwn} onUpdate={setProfileUser} />
      </div>

      <div className="flex gap-1 px-4 mt-6 border-b border-border overflow-x-auto scrollbar-thin" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            role="tab"
            aria-selected={tab === t.key}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== null && t.count > 0 && <span className="text-xs text-muted-foreground ml-0.5">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 animate-fade-in" key={tab}>
        {tab === 'posts' && (
          posts.length === 0 ? <EmptyState icon={MessageSquare} title="No posts yet" description={isOwn ? "Share your first post to get started!" : "This gamer hasn't posted yet."} /> : (
            <div className="space-y-4 stagger">{posts.map((p) => <PostCard key={p.id} post={p} author={profileUser} />)}</div>
          )
        )}
        {tab === 'favorites' && <FavoriteGamesShowcase favoriteGames={profileUser.favorite_games} games={games} />}
        {tab === 'showcase' && <AchievementShowcase achievements={achievements} isOwn={isOwn} />}
        {tab === 'toplists' && (
          topLists.length === 0 ? <EmptyState icon={ListOrdered} title="No top lists yet" description={isOwn ? "Create ranked lists of your favorite games to showcase your taste." : undefined} /> : (
            <div className="grid sm:grid-cols-2 gap-4 stagger">{topLists.map((l) => <TopListCard key={l.id} list={l} />)}</div>
          )
        )}
        {tab === 'setup' && <GamingSetupShowcase setups={setups} />}
        {tab === 'stats' && <GamingStats user={profileUser} achievements={achievements} />}
        {tab === 'collections' && (
          collections.length === 0 ? <EmptyState icon={Layers} title="No collections yet" description={isOwn ? "Group your favorite games into shareable collections." : undefined} /> : (
            <div className="grid sm:grid-cols-2 gap-4 stagger">{collections.map((c) => <CollectionCard key={c.id} collection={c} />)}</div>
          )
        )}
        {tab === 'reviews' && (
          reviews.length === 0 ? <EmptyState icon={Star} title="No reviews yet" description={isOwn ? "Review games you've played to share your thoughts." : undefined} /> : (
            <div className="space-y-3 stagger">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/games/${r.game_id}`} className="font-semibold text-sm hover:text-primary">{r.game_title}</Link>
                    <div className="flex" aria-label={`${r.rating} out of 5 stars`}>{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground/30'}`} />)}</div>
                  </div>
                  {r.content && <p className="text-sm text-muted-foreground mt-2">{r.content}</p>}
                </div>
              ))}
            </div>
          )
        )}
        {tab === 'timeline' && <GamingTimeline milestones={milestones} />}
        {tab === 'memories' && (
          memories.length === 0 ? <EmptyState icon={Clock} title="No memories yet" description={isOwn ? "Your gaming history will appear here automatically as you play." : undefined} /> : (
            <div className="space-y-3 stagger">
              {memories.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(m.memory_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <h4 className="font-semibold text-sm mt-0.5">{m.title}</h4>
                    {m.description && <p className="text-sm text-muted-foreground mt-1">{m.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Game accounts */}
      {accounts.length > 0 && canView(profileUser, 'privacy_library', viewer) && (
        <div className="px-4 pb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Connected Accounts
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {accounts.map((a) => <GameAccountBadge key={a.id} account={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}