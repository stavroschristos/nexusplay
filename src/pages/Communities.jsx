import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, Plus, X, Hash } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { cn } from '@/lib/utils';

const categories = ['Game', 'Genre', 'Console', 'Achievement Hunting', 'Speedrunning', 'Competitive', 'Retro', 'Indie', 'Other'];

export default function Communities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState([]);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'Game', icon_url: '', banner_url: '' });
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      base44.entities.Community.list('-members_count', 100),
      base44.entities.CommunityMember.filter({ created_by_id: user?.id }),
    ]).then(([comms, members]) => {
      setCommunities(comms);
      setJoinedIds(new Set(members.map((m) => m.community_id)));
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const create = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const comm = await base44.entities.Community.create({
        name: form.name.trim(), description: form.description, category: form.category,
        icon_url: form.icon_url || undefined, banner_url: form.banner_url || undefined, members_count: 1,
      });
      await base44.entities.CommunityMember.create({ community_id: comm.id, role: 'moderator' });
      setCommunities((c) => [comm, ...c]);
      setJoinedIds((s) => new Set([...s, comm.id]));
      setForm({ name: '', description: '', category: 'Game', icon_url: '', banner_url: '' });
      setShowForm(false);
    } catch {
      toast({ title: 'Failed to create community', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const toggleJoin = async (comm) => {
    const newSet = new Set(joinedIds);
    if (newSet.has(comm.id)) {
      const existing = await base44.entities.CommunityMember.filter({ community_id: comm.id, created_by_id: user.id });
      if (existing[0]) await base44.entities.CommunityMember.delete(existing[0].id);
      newSet.delete(comm.id);
      await base44.entities.Community.update(comm.id, { members_count: Math.max(0, (comm.members_count || 1) - 1) });
    } else {
      await base44.entities.CommunityMember.create({ community_id: comm.id, role: 'member' });
      newSet.add(comm.id);
      await base44.entities.Community.update(comm.id, { members_count: (comm.members_count || 0) + 1 });
    }
    setJoinedIds(newSet);
  };

  const filtered = communities.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === 'All' || c.category === filter;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader icon={Users} title="Communities" subtitle="Find your people and join the conversation">
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Create'}
        </Button>
      </PageHeader>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-3 mb-6">
          <div className="space-y-2">
            <Label>Community Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary/30" placeholder="Elden Ring Hunters" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary/30 resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Icon URL (optional)</Label>
              <Input value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} className="bg-secondary/30" />
            </div>
          </div>
          <Button onClick={create} disabled={creating || !form.name.trim()} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Community
          </Button>
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
        {['All', ...categories].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap', filter === c ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground')}>{c}</button>
        ))}
      </div>

      <div className="relative mb-4">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search communities..." className="rounded-full bg-card/50" />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No communities match your search' : 'No communities yet'}
          description={search ? 'Try a different keyword or category.' : 'Be the first to create one for your favorite game or genre!'}
          action={!search && (
            <Button onClick={() => setShowForm(true)} className="rounded-full">
              <Plus className="w-4 h-4" /> Create Community
            </Button>
          )}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 stagger">
          {filtered.map((c) => {
            const joined = joinedIds.has(c.id);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
                <Link to={`/communities/${c.id}`} className="block h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary relative">
                  {c.banner_url && <img src={c.banner_url} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/30 flex items-center justify-center">
                      {c.icon_url ? <img src={c.icon_url} alt="" className="w-full h-full rounded-lg object-cover" /> : <Hash className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                  </div>
                </Link>
                <div className="p-3">
                  {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {c.members_count || 0}</span>
                    <Button onClick={() => toggleJoin(c)} variant={joined ? 'secondary' : 'default'} size="sm" className="rounded-full h-7 text-xs">
                      {joined ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}