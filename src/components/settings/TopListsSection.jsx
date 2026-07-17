import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Trash2, GripVertical } from 'lucide-react';
import TopListCard from '@/components/profile/TopListCard';

export default function TopListsSection({ lists, onAdded, onRemoved }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('games');
  const [items, setItems] = useState(['']);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!title.trim() || items.filter((i) => i.trim()).length === 0) return;
    setSaving(true);
    try {
      const clean = items.map((i) => i.trim()).filter(Boolean);
      const list = await base44.entities.TopList.create({ title: title.trim(), description: description.trim(), category, items: clean });
      onAdded?.(list);
      setTitle(''); setDescription(''); setItems(['']); setShowForm(false);
      toast({ title: 'Top list created!' });
    } catch {
      toast({ title: 'Failed to create list', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.TopList.delete(id);
    onRemoved?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Top 10 Lists</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? 'Cancel' : 'New List'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <div className="space-y-2"><Label className="text-xs">List Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Top 10 RPGs of All Time" className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label className="text-xs">Description (optional)</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this list is about" className="bg-secondary/30" /></div>
          <div className="space-y-2">
            <Label className="text-xs">Category</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
              {['games', 'franchises', 'characters', 'moments', 'soundtracks', 'bosses', 'custom'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Ranked Entries (#1 at top)</Label>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground font-bold text-right">{i + 1}</span>
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  <Input value={it} onChange={(e) => setItems((prev) => prev.map((x, j) => j === i ? e.target.value : x))} placeholder={`Entry #${i + 1}`} className="bg-secondary/30" />
                  {items.length > 1 && <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
            {items.length < 10 && <Button variant="outline" size="sm" onClick={() => setItems((prev) => [...prev, ''])} className="rounded-full"><Plus className="w-4 h-4" /> Add Entry</Button>}
          </div>
          <Button onClick={add} disabled={saving || !title.trim()} className="w-full">{saving ? 'Saving...' : 'Create List'}</Button>
        </div>
      )}

      {lists.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">No top lists yet. Create your Top 10!</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lists.map((l) => (
            <div key={l.id} className="relative group">
              <TopListCard list={l} />
              <button onClick={() => remove(l.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}