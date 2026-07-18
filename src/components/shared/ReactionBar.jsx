import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const REACTIONS = ['🔥', '👏', '🎮', '🏆', '😮', '❤️'];

export default function ReactionBar({ postId }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [myReactionId, setMyReactionId] = useState(null);

  const load = useCallback(async () => {
    try {
      const all = await base44.entities.Reaction.filter({ post_id: postId });
      const map = {};
      all.forEach((r) => {
        map[r.emoji] = (map[r.emoji] || 0) + 1;
        if (r.created_by_id === user?.id) { setMyReaction(r.emoji); setMyReactionId(r.id); }
      });
      setReactions(map);
    } catch {}
  }, [postId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const react = async (emoji) => {
    const prevReaction = myReaction;
    const prevId = myReactionId;
    try {
      if (prevReaction === emoji) {
        setMyReaction(null); setMyReactionId(null);
        setReactions((r) => ({ ...r, [emoji]: Math.max(0, (r[emoji] || 1) - 1) }));
        if (prevId) await base44.entities.Reaction.delete(prevId);
      } else {
        if (prevId) {
          await base44.entities.Reaction.delete(prevId);
          setReactions((r) => ({ ...r, [prevReaction]: Math.max(0, (r[prevReaction] || 1) - 1) }));
        }
        const r = await base44.entities.Reaction.create({ post_id: postId, emoji });
        setReactions((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
        setMyReaction(emoji);
        setMyReactionId(r.id);
      }
      setShowPicker(false);
    } catch {
      toast({ title: 'Failed to react', variant: 'destructive' });
      load();
    }
  };

  const activeEmojis = Object.keys(reactions).filter((e) => reactions[e] > 0);

  return (
    <div className="flex items-center gap-1 relative">
      {activeEmojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => react(emoji)}
          aria-label={`${emoji} reaction, ${reactions[emoji]}`}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all',
            myReaction === emoji ? 'bg-primary/20 ring-1 ring-primary' : 'bg-secondary/50 hover:bg-secondary'
          )}
        >
          <span>{emoji}</span>
          {reactions[emoji] > 0 && <span className="text-muted-foreground">{reactions[emoji]}</span>}
        </button>
      ))}
      <button
        onClick={() => setShowPicker(!showPicker)}
        aria-label="Add a reaction"
        className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <SmilePlus className="w-4 h-4" />
      </button>
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 flex gap-1 p-2 rounded-xl bg-popover border border-border shadow-xl z-10">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => react(emoji)}
              aria-label={`React with ${emoji}`}
              className="w-8 h-8 rounded-lg hover:bg-secondary text-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}