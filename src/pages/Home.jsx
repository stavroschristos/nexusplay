import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import PostComposer from '@/components/feed/PostComposer';
import PostCard from '@/components/feed/PostCard';
import { Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const limit = 10;
      const res = await base44.entities.Post.list('-created_date', limit);
      const allPosts = reset ? res : [...posts, ...res];
      setPosts(allPosts);
      setHasMore(res.length === limit);

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
      setLoadingMore(false);
    }
  }, [posts, authors]);

  useEffect(() => {
    loadPosts(true);
  }, []);

  const handlePosted = (post) => {
    setPosts((p) => [post, ...p]);
  };

  const handleDeleted = (id) => {
    setPosts((p) => p.filter((post) => post.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">Gamer Feed</h1>
      </div>

      <div className="mb-6">
        <PostComposer user={user} onPosted={handlePosted} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
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
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {hasMore && !loadingMore && (
            <button
              onClick={() => loadPosts(false)}
              className="w-full py-3 text-sm text-primary hover:bg-primary/5 rounded-xl transition-colors"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}