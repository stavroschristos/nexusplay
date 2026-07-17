import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Trash2, Clock } from 'lucide-react';

const ICONS = [
  { key: 'trophy', label: '🏆 Trophy' },
  { key: 'game', label: '🎮 Game' },
  { key: 'rank', label: '📊 Rank' },
  { key: 'hours', label: '⏱ Hours' },
  { key: 'complete', label: '✅ Complete' },
  { key: 'start', label: '🚀 Start' },
  { key: 'friend', label: '👥 Friend' },
];

export default function MemoriesSection({ memories, onAdded, onRemoved }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', memory_date: '', icon: 'game' });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.title.trim() || !form.memory_date) return;
    setSaving(true);
    try {
      const mem = await base44.entities.Memory.create({
        title: form.title.trim(),
        description: form.description.trim(),
        memory_date: form.memory_date,
        icon: form.icon,
        is_auto: false,
      });
      onAdded?.(mem);
      setForm({ title: '', description: '', memory_date: '', icon: 'game' });
      setShowForm(false);
      toast({ title: 'Memory added!' });
    } catch {
      toast({ title: 'Failed to add memory', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.Memory.delete(id);
    onRemoved?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Clock className="w-4 h-4" /> Gaming Memories</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">{showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? 'Cancel' : 'Add'}</Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <div className="space-y-2"><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="First Platinum Trophy" className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened..." className="bg-secondary/30 resize-none" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label className="text-xs">Date</Label><Input type="date" value={form.memory_date} onChange={(e) => setForm({ ...form, memory_date: e.target.value })} className="bg-secondary/30" /></div>
            <div className="space-y-2">
              <Label className="text-xs">Icon</Label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                {ICONS.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={add} disabled={saving || !form.title.trim() || !form.memory_date} className="w-full">{saving ? 'Saving...' : 'Add Memory'}</Button>
        </div>
      )}

      {memories.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">No memories yet. Capture your favorite gaming moments!</p>
      ) : (
        <div className="space-y-2">
          {memories.map((m) => (
            <div key={m.id} className="group relative rounded-xl border border-border bg-card/50 p-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{new Date(m.memory_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <h4 className="font-semibold text-sm">{m.title}</h4>
                {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
              </div>
              <button onClick={() => remove(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}