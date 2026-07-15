import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Trash2, Loader2, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function PostCard({ post, author, onDeleted }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [likeId, setLikeId] = useState(null);

  useEffect(() => {
    base44.entities.Like.filter({ post_id: post.id, created_by_id: user?.id }).then((res) => {
      if (res.length > 0) {
        setLiked(true);
        setLikeId(res[0].id);
      }
    }).catch(() => {});
  }, [post.id, user?.id]);

  const toggleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikes((l) => l - 1);
      if (likeId) await base44.entities.Like.delete(likeId);
      await base44.entities.Post.update(post.id, { likes_count: Math.max(0, likes - 1) });
    } else {
      setLiked(true);
      setLikes((l) => l + 1);
      const like = await base44.entities.Like.create({ post_id: post.id });
      setLikeId(like.id);
      await base44.entities.Post.update(post.id, { likes_count: likes + 1 });
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const res = await base44.entities.Comment.filter({ post_id: post.id }, '-created_date', 50);
      setComments(res);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const comment = await base44.entities.Comment.create({ post_id: post.id, content: commentText.trim() });
      setComments((c) => [comment, ...c]);
      setCommentText('');
      await base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
    } catch {
      toast({ title: 'Failed to comment', variant: 'destructive' });
    } finally {
      setPostingComment(false);
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.Post.delete(post.id);
      onDeleted?.(post.id);
    } catch {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile`);
    toast({ title: 'Link copied to clipboard' });
  };

  const initials = (author?.display_name || author?.full_name || author?.email || 'G').charAt(0).toUpperCase();
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const isOwner = post.created_by_id === user?.id;

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <Link to={`/profile/${post.created_by_id}`}>
          <Avatar className="w-10 h-10 ring-2 ring-primary/20 shrink-0">
            <AvatarImage src={author?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/profile/${post.created_by_id}`} className="hover:underline">
              <span className="font-semibold text-sm">{author?.display_name || author?.full_name || 'Unknown Gamer'}</span>
            </Link>
            <span className="text-xs text-muted-foreground">· {timeAgo(post.created_date)}</span>
            {isOwner && (
              <button onClick={handleDelete} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{post.content}</p>
        </div>
      </div>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover border-y border-border" />
      )}

      <div className="flex items-center gap-1 px-4 py-2">
        <button
          onClick={toggleLike}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            liked ? 'text-rose-400 bg-rose-500/10' : 'text-muted-foreground hover:bg-secondary'
          )}
        >
          <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
          {likes > 0 && likes}
        </button>
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          {(post.comments_count || 0) > 0 && post.comments_count}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary transition-all ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder="Write a comment..."
              className="flex-1 h-9 rounded-full bg-secondary/50 border border-border px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              onClick={submitComment}
              disabled={postingComment || !commentText.trim()}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
            >
              {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {loadingComments ? (
            <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                  {(c.created_by_name || 'G').charAt(0)}
                </div>
                <div className="flex-1 bg-secondary/40 rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground">{c.created_by_name || 'Gamer'}</p>
                  <p>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}