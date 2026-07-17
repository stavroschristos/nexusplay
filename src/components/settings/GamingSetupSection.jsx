import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Trash2, Camera } from 'lucide-react';
import GamingSetupShowcase from '@/components/profile/GamingSetupShowcase';

export default function GamingSetupSection({ setups, onAdded, onRemoved }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', components: [''] });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const setup = await base44.entities.GamingSetup.create({
        title: form.title.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        components: form.components.map((c) => c.trim()).filter(Boolean),
      });
      onAdded?.(setup);
      setForm({ title: '', description: '', image_url: '', components: [''] });
      setShowForm(false);
      toast({ title: 'Setup added!' });
    } catch {
      toast({ title: 'Failed to add setup', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.GamingSetup.delete(id);
    onRemoved?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Camera className="w-4 h-4" /> Gaming Setup Showcase</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="rounded-full">{showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showForm ? 'Cancel' : 'Add'}</Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <div className="space-y-2"><Label className="text-xs">Setup Name</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="The Battle Station" className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label className="text-xs">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your setup..." className="bg-secondary/30 resize-none" rows={2} /></div>
          <div className="space-y-2"><Label className="text-xs">Photo URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="bg-secondary/30" /></div>
          <div className="space-y-2">
            <Label className="text-xs">Key Components</Label>
            <div className="space-y-2">
              {form.components.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={c} onChange={(e) => setForm({ ...form, components: form.components.map((x, j) => j === i ? e.target.value : x) })} placeholder="RTX 4090, Ultrawide Monitor..." className="bg-secondary/30" />
                  {form.components.length > 1 && <button onClick={() => setForm({ ...form, components: form.components.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, components: [...form.components, ''] })} className="rounded-full"><Plus className="w-4 h-4" /> Add Component</Button>
          </div>
          <Button onClick={add} disabled={saving || !form.title.trim()} className="w-full">{saving ? 'Saving...' : 'Add Setup'}</Button>
        </div>
      )}

      {setups.length === 0 ? (
        <p className="text-center text-muted-foreground py-4 text-sm">Show off your gaming setup!</p>
      ) : (
        <div className="relative">
          <GamingSetupShowcase setups={setups} />
          <button onClick={() => remove(setups[0].id)} className="mt-3 text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove latest</button>
        </div>
      )}
    </div>
  );
}