import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Heart, MessageCircle, Layers, Send, Gamepad2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function CollectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [collection, setCollection] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      base44.entities.Collection.list(),
      base44.entities.CollectionComment.filter({ collection_id: id }, '-created_date', 50),
      base44.entities.Like.filter({ post_id: id, created_by_id: user?.id }),
    ]).then(async ([cols, comments, likes]) => {
      const col = cols.find((c) => c.id === id);
      setCollection(col);
      setComments(comments);
      if (likes.length > 0) { setLiked(true); setLikeId(likes[0].id); }
      if (col) {
        const pubRes = await base44.functions.invoke('publicUsers', { action: 'list' });
        const users = pubRes.data?.users || [];
        setAuthor(users.find((u) => u.id === col.created_by_id));
      }
    }).finally(() => setLoading(false));
  }, [id, user?.id]);

  const toggleLike = async () => {
    if (liked) {
      setLiked(false); setLikeId(null);
      if (likeId) await base44.entities.Like.delete(likeId);
      setCollection((c) => ({ ...c, likes_count: Math.max(0, (c.likes_count || 1) - 1) }));
    } else {
      setLiked(true);
      const like = await base44.entities.Like.create({ post_id: id });
      setLikeId(like.id);
      setCollection((c) => ({ ...c, likes_count: (c.likes_count || 0) + 1 }));
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const comment = await base44.entities.CollectionComment.create({ collection_id: id, content: commentText.trim() });
      setComments((c) => [comment, ...c]);
      setCommentText('');
      setCollection((c) => ({ ...c, comments_count: (c.comments_count || 0) + 1 }));
    } catch {
      toast({ title: 'Failed to comment', variant: 'destructive' });
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!collection) return <div className="text-center py-20"><p className="text-muted-foreground">Collection not found.</p><Link to="/" className="text-primary hover:underline text-sm">Back home</Link></div>;

  const initials = (author?.display_name || author?.full_name || author?.email || 'G').charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-12">
      <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary relative">
          {collection.cover_url && <img src={collection.cover_url} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h1 className="text-xl font-bold text-white">{collection.title}</h1>
            {collection.description && <p className="text-sm text-white/80 mt-1">{collection.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to={`/profile/${author?.id}`}>
            <Avatar className="w-8 h-8 ring-2 ring-primary/20"><AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback></Avatar>
          </Link>
          <Link to={`/profile/${author?.id}`} className="text-sm font-medium hover:text-primary">{author?.display_name || author?.full_name || 'Gamer'}</Link>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <button onClick={toggleLike} className={cn('flex items-center gap-1', liked && 'text-rose-400')}>
              <Heart className={cn('w-4 h-4', liked && 'fill-current')} /> {collection.likes_count || 0}
            </button>
            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {collection.comments_count || 0}</span>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-6 mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4" /> Games in this collection
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {collection.games?.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">No games in this collection.</p>
        ) : collection.games?.map((g, i) => (
          <div key={i} className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Gamepad2 className="w-4 h-4 text-muted-foreground" /></div>
            <span className="text-sm font-medium truncate">{g}</span>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-6 mb-3">Comments</h3>
      <div className="flex gap-2 mb-4">
        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitComment()} placeholder="Add a comment..." className="flex-1 h-9 rounded-full bg-secondary/50 border border-border px-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
        <button onClick={submitComment} disabled={postingComment || !commentText.trim()} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
          {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">{(c.created_by_name || 'G').charAt(0)}</div>
            <div className="flex-1 bg-secondary/40 rounded-2xl rounded-tl-sm px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">{c.created_by_name || 'Gamer'}</p>
              <p>{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}