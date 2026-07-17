import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
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
import { Loader2, UserPlus, UserCheck, Trophy, Gamepad2, MessageSquare, Star, Layers, Award, Zap, Clock, Share2, ListOrdered, Monitor, Sparkles } from 'lucide-react';
import ShareCard from '@/components/share/ShareCard';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">User not found.</p>
        <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">Back to feed</Link>
      </div>
    );
  }

  const isOwn = profileId === currentUser?.id;
  const initials = (profileUser.display_name || profileUser.full_name || profileUser.email || 'G').charAt(0).toUpperCase();
  const compatibility = isOwn ? 0 : calculateCompatibility(currentUser, profileUser);
  const theme = getTheme(profileUser.profile_theme);

  const tabs = [
    { key: 'posts', label: 'Posts', icon: MessageSquare, count: posts.length },
    { key: 'favorites', label: 'Favorites', icon: Star, count: profileUser.favorite_games?.length || 0 },
    { key: 'showcase', label: 'Showcase', icon: Trophy, count: achievements.filter((a) => a.is_showcased || a.rarity === 'Legendary' || a.rarity === 'Epic').length },
    { key: 'toplists', label: 'Top Lists', icon: ListOrdered, count: topLists.length },
    { key: 'setup', label: 'Setup', icon: Monitor, count: setups.length },
    { key: 'collections', label: 'Collections', icon: Layers, count: collections.length },
    { key: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
    { key: 'timeline', label: 'Timeline', icon: Trophy, count: milestones.length },
    { key: 'memories', label: 'Memories', icon: Clock, count: memories.length },
    { key: 'stats', label: 'Stats', icon: Zap, count: null },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-12">
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
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-heading">{profileUser.display_name || profileUser.full_name || 'Gamer'}</h1>
            <PersonalityBadge personality={profileUser.gaming_personality} />
          </div>
          <p className="text-sm text-muted-foreground">{profileUser.email}</p>
          {profileUser.bio && <p className="text-sm mt-2 text-foreground/80">{profileUser.bio}</p>}

          {profileUser.current_game && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">Now playing:</span>
              <span className="font-medium">{profileUser.current_game}</span>
            </div>
          )}

          <div className="flex gap-5 mt-3 text-sm">
            <span><strong>{posts.length}</strong> <span className="text-muted-foreground">Posts</span></span>
            <span><strong>{followers}</strong> <span className="text-muted-foreground">Followers</span></span>
            <span><strong>{following}</strong> <span className="text-muted-foreground">Following</span></span>
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

      <div className="flex gap-1 px-4 mt-6 border-b border-border overflow-x-auto scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== null && t.count > 0 && <span className="text-xs text-muted-foreground">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="px-4 py-6">
        {tab === 'posts' && (
          posts.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No posts yet.</p> : (
            <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} author={profileUser} />)}</div>
          )
        )}
        {tab === 'favorites' && <FavoriteGamesShowcase favoriteGames={profileUser.favorite_games} games={games} />}
        {tab === 'showcase' && <AchievementShowcase achievements={achievements} isOwn={isOwn} />}
        {tab === 'toplists' && (
          topLists.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No top lists yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-4">{topLists.map((l) => <TopListCard key={l.id} list={l} />)}</div>
          )
        )}
        {tab === 'setup' && <GamingSetupShowcase setups={setups} />}
        {tab === 'stats' && <GamingStats user={profileUser} achievements={achievements} />}
        {tab === 'collections' && (
          collections.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No collections yet.</p> : (
            <div className="grid sm:grid-cols-2 gap-4">{collections.map((c) => <CollectionCard key={c.id} collection={c} />)}</div>
          )
        )}
        {tab === 'reviews' && (
          reviews.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No reviews yet.</p> : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/games/${r.game_id}`} className="font-semibold text-sm hover:text-primary">{r.game_title}</Link>
                    <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground/30'}`} />)}</div>
                  </div>
                  {r.content && <p className="text-sm text-muted-foreground mt-2">{r.content}</p>}
                </div>
              ))}
            </div>
          )
        )}
        {tab === 'timeline' && <GamingTimeline milestones={milestones} />}
        {tab === 'memories' && (
          memories.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No memories yet. Your gaming history will appear here automatically.</p> : (
            <div className="space-y-3">
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
      {accounts.length > 0 && (
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