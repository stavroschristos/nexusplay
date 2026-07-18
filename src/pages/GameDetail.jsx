import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PostCard from '@/components/feed/PostCard';
import PostComposer from '@/components/feed/PostComposer';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Star, Users, Bookmark, BookmarkCheck, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GameDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [game, setGame] = useState(null);
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [reviews, setReviews] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('community');
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [postingReview, setPostingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      base44.entities.Game.list(),
      base44.entities.Post.filter({ game_id: id, hidden: { $ne: true } }, '-created_date', 50),
      base44.entities.GameReview.filter({ game_id: id }, '-created_date', 50),
      base44.entities.GameFollow.filter({ game_id: id, created_by_id: user?.id }),
    ]).then(async ([games, gamePosts, gameReviews, follows]) => {
      const g = games.find((x) => x.id === id);
      setGame(g);
      setPosts(gamePosts);
      setReviews(gameReviews);
      setFollowing(follows.length > 0);
      const authorIds = [...new Set(gamePosts.map((p) => p.created_by_id))];
      if (authorIds.length > 0) {
        const pubRes = await base44.functions.invoke('publicUsers', { action: 'list' });
        const map = {};
        (pubRes.data?.users || []).forEach((u) => { map[u.id] = u; });
        setAuthors(map);
      }
    }).finally(() => setLoading(false));
  }, [id, user?.id]);

  const toggleFollow = async () => {
    try {
      if (following) {
        const existing = await base44.entities.GameFollow.filter({ game_id: id, created_by_id: user.id });
        if (existing[0]) await base44.entities.GameFollow.delete(existing[0].id);
        setFollowing(false);
        toast({ title: 'Unfollowed game' });
      } else {
        await base44.entities.GameFollow.create({ game_id: id });
        setFollowing(true);
        toast({ title: 'Following game' });
      }
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  const submitReview = async () => {
    if (!game) return;
    setPostingReview(true);
    try {
      const review = await base44.entities.GameReview.create({
        game_id: id, game_title: game.title, rating, content: reviewContent.trim() || undefined,
      });
      setReviews((r) => [review, ...r]);
      setReviewContent('');
      await base44.entities.Post.create({
        content: `Reviewed ${game.title} — ${'⭐'.repeat(rating)}`,
        type: 'activity', activity_type: 'complete', game_title: game.title, game_id: id,
      });
      toast({ title: 'Review posted!' });
    } catch {
      toast({ title: 'Failed to post review', variant: 'destructive' });
    } finally {
      setPostingReview(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!game) return <div className="text-center py-20"><p className="text-muted-foreground">Game not found.</p><Link to="/games" className="text-primary hover:underline text-sm">Browse games</Link></div>;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative overflow-hidden">
        {game.banner_url && <img src={game.banner_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="px-4 -mt-16 relative flex items-end gap-4">
        <div className="w-24 h-32 rounded-xl overflow-hidden bg-secondary border-2 border-background shadow-xl shrink-0">
          {game.cover_url ? <img src={game.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center p-2">{game.title}</div>}
        </div>
        <div className="flex-1 pb-2">
          <h1 className="text-xl font-bold font-heading">{game.title}</h1>
          {game.developer && <p className="text-sm text-muted-foreground">{game.developer}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {game.genres?.map((g) => <span key={g} className="px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground">{g}</span>)}
            {game.platforms?.map((p) => <span key={p} className="px-2 py-0.5 rounded-md bg-primary/10 text-xs text-primary">{p}</span>)}
          </div>
        </div>
        <Button onClick={toggleFollow} variant={following ? 'secondary' : 'default'} size="sm" className="rounded-full mb-2 shrink-0">
          {following ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {following ? 'Following' : 'Follow'}
        </Button>
      </div>

      {game.description && <p className="px-4 mt-4 text-sm text-foreground/80">{game.description}</p>}

      <div className="flex gap-1 px-4 mt-6 border-b border-border">
        {[{ key: 'community', label: 'Community', icon: MessageSquare }, { key: 'reviews', label: 'Reviews', icon: Star }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2', tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-6">
        {tab === 'community' && (
          <div className="space-y-4">
            <PostComposer user={user} onPosted={(p) => setPosts((prev) => [p, ...prev])} />
            {posts.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No posts about this game yet.</p> :
              posts.map((p) => <PostCard key={p.id} post={p} author={authors[p.created_by_id]} />)}
          </div>
        )}
        {tab === 'reviews' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
              <h3 className="font-semibold text-sm">Write a Review</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}>
                    <Star className={cn('w-6 h-6 transition-colors', n <= rating ? 'text-amber-400 fill-current' : 'text-muted-foreground/30')} />
                  </button>
                ))}
              </div>
              <Textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="Share your thoughts..." className="bg-secondary/30 resize-none" rows={3} />
              <Button onClick={submitReview} disabled={postingReview} size="sm" className="rounded-full">
                {postingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Post Review
              </Button>
            </div>
            {reviews.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm">No reviews yet. Be the first!</p> :
              reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-card/50 p-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/20 text-primary text-xs">G</AvatarFallback></Avatar>
                    <span className="text-xs font-medium">{r.created_by_name || 'Gamer'}</span>
                    <div className="flex ml-auto">{[...Array(5)].map((_, i) => <Star key={i} className={cn('w-3.5 h-3.5', i < r.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground/30')} />)}</div>
                  </div>
                  {r.content && <p className="text-sm mt-2">{r.content}</p>}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}