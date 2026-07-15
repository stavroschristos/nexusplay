import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import GamingTimeline from '@/components/profile/GamingTimeline';
import { Plus, X, Trash2 } from 'lucide-react';

const icons = [
  { key: 'trophy', label: '🏆 Trophy' },
  { key: 'game', label: '🎮 Game' },
  { key: 'rank', label: '📈 Rank' },
  { key: 'hours', label: '⏱ Hours' },
  { key: 'complete', label: '✅ Complete' },
  { key: 'start', label: '🚩 Start' },
];

export default function MilestonesSection({ milestones, onAdded, onRemoved }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear(), title: '', description: '', icon: 'trophy' });

  const add = async () => {
    if (!form.title.trim()) return;
    const ms = await base44.entities.Timeline.create({
      year: Number(form.year), title: form.title.trim(), description: form.description || undefined, icon: form.icon,
    });
    onAdded?.(ms);
    setForm({ year: new Date().getFullYear(), title: '', description: '', icon: 'trophy' });
    setShowForm(false);
  };

  const remove = async (id) => {
    await base44.entities.Timeline.delete(id);
    onRemoved?.(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gaming Timeline</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Year</Label>
              <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="bg-secondary/30" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
                {icons.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Milestone Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="First Platinum Trophy" className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description (optional)</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Earned in God of War" className="bg-secondary/30" />
          </div>
          <Button onClick={add} disabled={!form.title.trim()} className="w-full"><Plus className="w-4 h-4" /> Add Milestone</Button>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="relative">
          <GamingTimeline milestones={milestones} />
          <button onClick={() => milestones.forEach((m) => remove(m.id))} className="hidden" />
        </div>
      )}

      {milestones.length === 0 && <p className="text-center text-muted-foreground py-4 text-sm">No milestones yet. Add your first gaming memory!</p>}
    </div>
  );
}