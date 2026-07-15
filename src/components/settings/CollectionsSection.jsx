import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import CollectionCard from '@/components/shared/CollectionCard';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';

export default function CollectionsSection({ collections, onAdded, onRemoved }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', games: '', cover_url: '' });
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const col = await base44.entities.Collection.create({
        title: form.title.trim(),
        description: form.description || undefined,
        games: form.games.split(',').map((g) => g.trim()).filter(Boolean),
        cover_url: form.cover_url || undefined,
        is_public: true,
      });
      onAdded?.(col);
      setForm({ title: '', description: '', games: '', cover_url: '' });
      setShowForm(false);
    } catch {
      toast({ title: 'Failed to create collection', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.Collection.delete(id);
    onRemoved?.(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Collections</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Create'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="My Top 10 RPGs" className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Why these games..." className="bg-secondary/30 resize-none" rows={2} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Games (comma separated)</Label>
            <Input value={form.games} onChange={(e) => setForm({ ...form, games: e.target.value })} placeholder="Elden Ring, Baldur's Gate 3..." className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Cover URL (optional)</Label>
            <Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." className="bg-secondary/30" />
          </div>
          <Button onClick={create} disabled={creating || !form.title.trim()} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Collection
          </Button>
        </div>
      )}

      {collections.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">No collections yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {collections.map((c) => (
            <div key={c.id} className="relative group">
              <CollectionCard collection={c} />
              <button onClick={() => remove(c.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}