import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, Loader2, Send, Gamepad2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function PostComposer({ user, onPosted, communityId }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();

  const initials = (user?.display_name || user?.full_name || user?.email || 'G').charAt(0).toUpperCase();

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch {
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      let gameId = null;
      if (gameTitle.trim()) {
        const games = await base44.entities.Game.filter({ title: gameTitle.trim() });
        if (games[0]) gameId = games[0].id;
      }
      const post = await base44.entities.Post.create({
        content: content.trim(),
        image_url: imageUrl || undefined,
        game_title: gameTitle.trim() || undefined,
        game_id: gameId || undefined,
        community_id: communityId || undefined,
      });
      setContent(''); setImageUrl(''); setGameTitle('');
      if (fileRef.current) fileRef.current.value = '';
      onPosted?.(post);
    } catch {
      toast({ title: 'Failed to post', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-primary/30 shrink-0">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your latest gaming moment..."
            className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0 px-0 text-base placeholder:text-muted-foreground/60"
          />
          {imageUrl && (
            <div className="relative mt-2 rounded-xl overflow-hidden">
              <img src={imageUrl} alt="" className="w-full max-h-72 object-cover" />
              <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80">✕</button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} disabled={loading} className="text-muted-foreground hover:text-primary">
              <ImagePlus className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 flex-1">
              <Gamepad2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                placeholder="Tag a game (optional)"
                className="flex-1 h-8 bg-transparent text-xs placeholder:text-muted-foreground/60 focus-visible:outline-none"
              />
            </div>
            <Button onClick={handleSubmit} disabled={loading || !content.trim()} size="sm" className="rounded-full px-5">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="ml-1">Post</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}