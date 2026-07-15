import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/feed/PostCard';
import GameAccountBadge from '@/components/profile/GameAccountBadge';
import AchievementCard from '@/components/profile/AchievementCard';
import { Loader2, UserPlus, UserCheck, Trophy, Gamepad2, MessageSquare } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const profileId = id || currentUser?.id;

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    Promise.all([
      base44.entities.User.list(),
      base44.entities.Post.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.GameAccount.filter({ created_by_id: profileId }, '-created_date', 50),
      base44.entities.Achievement.filter({ created_by_id: profileId }, '-earned_date', 50),
      base44.entities.Follow.filter({ following_id: profileId }),
      base44.entities.Follow.filter({ follower_id: profileId }),
    ]).then(([users, userPosts, userAccounts, userAch, followersList, followingList]) => {
      const u = users.find((x) => x.id === profileId) || (profileId === currentUser?.id ? currentUser : null);
      setProfileUser(u);
      setPosts(userPosts);
      setAccounts(userAccounts);
      setAchievements(userAch);
      setFollowers(followersList.length);
      setFollowing(followingList.length);
      setIsFollowing(followersList.some((f) => f.follower_id === currentUser?.id));
    }).finally(() => setLoading(false));
  }, [profileId, currentUser]);

  const toggleFollow = async () => {
    if (isFollowing) {
      const existing = await base44.entities.Follow.filter({ follower_id: currentUser.id, following_id: profileId });
      if (existing[0]) await base44.entities.Follow.delete(existing[0].id);
      setIsFollowing(false);
      setFollowers((f) => f - 1);
    } else {
      await base44.entities.Follow.create({ follower_id: currentUser.id, following_id: profileId });
      setIsFollowing(true);
      setFollowers((f) => f + 1);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Banner */}
      <div className="h-40 md:h-56 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative overflow-hidden">
        {profileUser.banner_url && (
          <img src={profileUser.banner_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="px-4 -mt-12 md:-mt-14 relative">
        <div className="flex items-end justify-between">
          <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-background">
            <AvatarImage src={profileUser.avatar_url} />
            <AvatarFallback className="bg-primary/30 text-primary text-3xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          {isOwn ? (
            <Button asChild variant="outline" size="sm" className="rounded-full mb-2">
              <Link to="/settings">Edit Profile</Link>
            </Button>
          ) : (
            <Button
              onClick={toggleFollow}
              variant={isFollowing ? 'secondary' : 'default'}
              size="sm"
              className="rounded-full mb-2"
            >
              {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold font-heading">{profileUser.display_name || profileUser.full_name || 'Gamer'}</h1>
          <p className="text-sm text-muted-foreground">{profileUser.email}</p>
          {profileUser.bio && <p className="text-sm mt-2 text-foreground/80">{profileUser.bio}</p>}

          <div className="flex gap-5 mt-3 text-sm">
            <span><strong>{posts.length}</strong> <span className="text-muted-foreground">Posts</span></span>
            <span><strong>{followers}</strong> <span className="text-muted-foreground">Followers</span></span>
            <span><strong>{following}</strong> <span className="text-muted-foreground">Following</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mt-6 border-b border-border">
        {[
          { key: 'posts', label: 'Posts', icon: MessageSquare },
          { key: 'accounts', label: 'Game Accounts', icon: Gamepad2 },
          { key: 'achievements', label: 'Achievements', icon: Trophy },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 py-6 pb-12">
        {tab === 'posts' && (
          posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => <PostCard key={p.id} post={p} author={profileUser} />)}
            </div>
          )
        )}

        {tab === 'accounts' && (
          accounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No game accounts linked.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {accounts.map((a) => <GameAccountBadge key={a.id} account={a} />)}
            </div>
          )
        )}

        {tab === 'achievements' && (
          achievements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No achievements shared yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}