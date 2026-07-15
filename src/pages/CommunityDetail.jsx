import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import PostComposer from '@/components/feed/PostComposer';
import PostCard from '@/components/feed/PostCard';
import { Loader2, Users, Hash, LogIn, UserX } from 'lucide-react';

export default function CommunityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      base44.entities.Community.list(),
      base44.entities.Post.filter({ community_id: id }, '-created_date', 50),
      base44.entities.CommunityMember.filter({ community_id: id, created_by_id: user?.id }),
      base44.entities.CommunityMember.filter({ community_id: id }),
    ]).then(async ([comms, commPosts, myMembership, members]) => {
      setCommunity(comms.find((c) => c.id === id));
      setPosts(commPosts);
      setJoined(myMembership.length > 0);
      const authorIds = [...new Set(commPosts.map((p) => p.created_by_id))];
      if (authorIds.length > 0) {
        const users = await base44.entities.User.list();
        const map = {};
        users.forEach((u) => { map[u.id] = u; });
        setAuthors(map);
      }
    }).finally(() => setLoading(false));
  }, [id, user?.id]);

  const toggleJoin = async () => {
    if (joined) {
      const existing = await base44.entities.CommunityMember.filter({ community_id: id, created_by_id: user.id });
      if (existing[0]) await base44.entities.CommunityMember.delete(existing[0].id);
      setJoined(false);
      await base44.entities.Community.update(id, { members_count: Math.max(0, (community.members_count || 1) - 1) });
    } else {
      await base44.entities.CommunityMember.create({ community_id: id, role: 'member' });
      setJoined(true);
      await base44.entities.Community.update(id, { members_count: (community.members_count || 0) + 1 });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!community) return <div className="text-center py-20"><p className="text-muted-foreground">Community not found.</p><Link to="/communities" className="text-primary hover:underline text-sm">Browse communities</Link></div>;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="h-40 md:h-48 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative overflow-hidden">
        {community.banner_url && <img src={community.banner_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="px-4 -mt-10 relative flex items-end gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary/30 flex items-center justify-center ring-4 ring-background shrink-0">
          {community.icon_url ? <img src={community.icon_url} alt="" className="w-full h-full rounded-2xl object-cover" /> : <Hash className="w-7 h-7 text-primary-foreground" />}
        </div>
        <div className="flex-1 pb-1">
          <h1 className="text-lg font-bold font-heading">{community.name}</h1>
          <span className="text-xs text-muted-foreground">{community.category} · {community.members_count || 0} members</span>
        </div>
        <Button onClick={toggleJoin} variant={joined ? 'secondary' : 'default'} size="sm" className="rounded-full mb-1 shrink-0">
          {joined ? 'Joined' : 'Join'}
        </Button>
      </div>

      {community.description && <p className="px-4 mt-4 text-sm text-foreground/80">{community.description}</p>}

      <div className="px-4 mt-6 space-y-4">
        {joined ? (
          <PostComposer user={user} communityId={id} onPosted={(p) => setPosts((prev) => [p, ...prev])} />
        ) : (
          <div className="rounded-2xl border border-border bg-card/50 p-6 text-center">
            <UserX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Join this community to post.</p>
            <Button onClick={toggleJoin} size="sm" className="rounded-full"><LogIn className="w-4 h-4" /> Join Community</Button>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No posts yet. Start the conversation!</p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} author={authors[p.created_by_id]} />)
        )}
      </div>
    </div>
  );
}