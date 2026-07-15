import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { Loader2, Trophy, Star, TrendingUp, Gamepad2, Clock, Send } from 'lucide-react';

const activityTypes = [
  { key: 'platinum', label: 'Earned Platinum', icon: Trophy, color: 'text-amber-400' },
  { key: 'complete', label: 'Completed a Game', icon: Star, color: 'text-blue-400' },
  { key: 'rank', label: 'New Rank Reached', icon: TrendingUp, color: 'text-rose-400' },
  { key: 'start', label: 'Started Playing', icon: Gamepad2, color: 'text-purple-400' },
  { key: 'playtime', label: 'Playtime Milestone', icon: Clock, color: 'text-emerald-400' },
];

export default function ActivitySection({ onLogged }) {
  const { toast } = useToast();
  const [type, setType] = useState('platinum');
  const [game, setGame] = useState('');
  const [note, setNote] = useState('');
  const [logging, setLogging] = useState(false);

  const log = async () => {
    if (!game.trim()) return;
    setLogging(true);
    try {
      let gameId = null;
      const games = await base44.entities.Game.filter({ title: game.trim() });
      if (games[0]) gameId = games[0].id;
      const selected = activityTypes.find((a) => a.key === type);
      const content = note.trim() || `${selected.label} — ${game.trim()}`;
      const post = await base44.entities.Post.create({
        content, type: 'activity', activity_type: type, game_title: game.trim(), game_id: gameId,
      });
      setGame(''); setNote('');
      onLogged?.(post);
      toast({ title: 'Activity shared to your feed!' });
    } catch {
      toast({ title: 'Failed to log activity', variant: 'destructive' });
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-4">
      <h3 className="text-sm font-semibold">Log Gaming Activity</h3>
      <p className="text-xs text-muted-foreground -mt-2">Share what you've been up to — this auto-posts to the feed.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {activityTypes.map((a) => (
          <button key={a.key} onClick={() => setType(a.key)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${type === a.key ? 'border-primary bg-primary/10 ' + a.color : 'border-border text-muted-foreground hover:text-foreground'}`}>
            <a.icon className="w-4 h-4" /> {a.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Game</Label>
        <Input value={game} onChange={(e) => setGame(e.target.value)} placeholder="Game title" className="bg-secondary/30" />
      </div>
      <div className="space-y-2">
        <Label>Note (optional)</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a message..." className="bg-secondary/30" />
      </div>
      <Button onClick={log} disabled={logging || !game.trim()} className="w-full">
        {logging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Share Activity
      </Button>
    </div>
  );
}