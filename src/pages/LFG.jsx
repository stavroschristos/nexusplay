import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { PlatformIcon } from '@/components/profile/GameAccountBadge';
import { Loader2, Gamepad2, Plus, X, Users, Globe, Mic, MicOff } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { cn } from '@/lib/utils';

const platforms = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Riot', 'Battle.net', 'Cross-platform'];
const regions = ['North America', 'South America', 'Europe', 'Asia', 'Oceania', 'Africa', 'Middle East'];
const skills = ['Beginner', 'Casual', 'Intermediate', 'Advanced', 'Pro'];

export default function LFG() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ game: '', platform: 'PlayStation', region: 'North America', skill_level: 'Casual', mode: 'Casual', voice_chat: false, schedule: '', players_needed: 1, description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const [res] = await Promise.all([base44.entities.LFG.list('-created_date', 50)]);
    setPosts(res);
    const authorIds = [...new Set(res.map((p) => p.created_by_id))];
    if (authorIds.length > 0) {
      const pubRes = await base44.functions.invoke('publicUsers', { action: 'list' });
      const users = pubRes.data?.users || [];
      const map = {};
      users.forEach((u) => { map[u.id] = u; });
      setAuthors(map);
    }
    setLoading(false);
  };

  const create = async () => {
    if (!form.game.trim()) return;
    setCreating(true);
    try {
      const post = await base44.entities.LFG.create({
        ...form, game: form.game.trim(), players_needed: Number(form.players_needed) || 1,
      });
      setPosts((p) => [post, ...p]);
      setForm({ game: '', platform: 'PlayStation', region: 'North America', skill_level: 'Casual', mode: 'Casual', voice_chat: false, schedule: '', players_needed: 1, description: '' });
      setShowForm(false);
    } catch {
      toast({ title: 'Failed to post', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <PageHeader icon={Users} title="Looking For Group" subtitle="Find players for your next gaming session">
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Post'}
        </Button>
      </PageHeader>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-3 mb-6">
          <div className="space-y-2">
            <Label>Game</Label>
            <Input value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })} placeholder="Game title" className="bg-secondary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Platform</Label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Skill Level</Label>
              <select value={form.skill_level} onChange={(e) => setForm({ ...form, skill_level: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                {skills.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                <option value="Casual">Casual</option>
                <option value="Competitive">Competitive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Players Needed</Label>
              <Input type="number" min="1" max="20" value={form.players_needed} onChange={(e) => setForm({ ...form, players_needed: e.target.value })} className="bg-secondary/30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Schedule</Label>
            <Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="e.g. Weekends 7-10pm EST" className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What are you looking for?" className="bg-secondary/30 resize-none" rows={2} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.voice_chat} onChange={(e) => setForm({ ...form, voice_chat: e.target.checked })} className="w-4 h-4 accent-primary" />
            Voice chat required
          </label>
          <Button onClick={create} disabled={creating || !form.game.trim()} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Post LFG
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} className="h-36" />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No LFG posts yet"
          description="Create one to find players for your next session!"
          action={
            <Button onClick={() => setShowForm(true)} className="rounded-full">
              <Plus className="w-4 h-4" /> Post a Request
            </Button>
          }
        />
      ) : (
        <div className="space-y-3 stagger">
          {posts.map((p) => {
            const author = authors[p.created_by_id];
            const initials = (author?.display_name || author?.full_name || 'G').charAt(0).toUpperCase();
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Link to={`/profile/${p.created_by_id}`}>
                    <Avatar className="w-9 h-9 ring-2 ring-primary/20"><AvatarImage src={author?.avatar_url} /><AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback></Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${p.created_by_id}`} className="text-sm font-medium hover:text-primary">{author?.display_name || author?.full_name || 'Gamer'}</Link>
                    <p className="text-xs text-muted-foreground">Looking for {p.players_needed} player{p.players_needed > 1 ? 's' : ''}</p>
                  </div>
                  <Button size="sm" variant="default" className="rounded-full h-8 text-xs" onClick={() => toast({ title: 'Interest sent! Check your messages.' })}>I'm Interested</Button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">{p.game}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-xs text-primary flex items-center gap-1"><PlatformIcon platform={p.platform} className="w-3 h-3" /> {p.platform}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> {p.region}</span>
                  <span className={cn('px-2 py-0.5 rounded-md text-xs', p.mode === 'Competitive' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400')}>{p.mode}</span>
                  <span className="px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground">{p.skill_level}</span>
                  {p.voice_chat ? <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-xs flex items-center gap-1"><Mic className="w-3 h-3" /> Voice</span> : <span className="px-2 py-0.5 rounded-md bg-secondary/60 text-xs text-muted-foreground flex items-center gap-1"><MicOff className="w-3 h-3" /> No voice</span>}
                </div>
                {p.schedule && <p className="text-xs text-muted-foreground">🕒 {p.schedule}</p>}
                {p.description && <p className="text-sm text-foreground/80 mt-2">{p.description}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}