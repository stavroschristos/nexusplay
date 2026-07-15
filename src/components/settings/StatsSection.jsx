import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

const statFields = [
  { key: 'total_games_played', label: 'Total Games Played' },
  { key: 'total_hours_played', label: 'Total Hours Played' },
  { key: 'achievement_score', label: 'Achievement Score' },
  { key: 'platinum_count', label: 'Platinum Trophies' },
  { key: 'completion_percentage', label: 'Completion %' },
  { key: 'rare_achievements', label: 'Rare Achievements' },
];

export default function StatsSection({ user, onSaved }) {
  const { toast } = useToast();
  const [stats, setStats] = useState(() => {
    const s = {};
    statFields.forEach((f) => { s[f.key] = user?.[f.key] || 0; });
    return s;
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const update = {};
      statFields.forEach((f) => { update[f.key] = Number(stats[f.key]) || 0; });
      await base44.auth.updateMe(update);
      onSaved?.(update);
      toast({ title: 'Stats updated!' });
    } catch {
      toast({ title: 'Failed to save stats', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Gaming Stats</h2>
      <div className="grid grid-cols-2 gap-3">
        {statFields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-xs">{f.label}</Label>
            <Input type="number" value={stats[f.key]} onChange={(e) => setStats({ ...stats, [f.key]: e.target.value })} className="bg-secondary/30" />
          </div>
        ))}
      </div>
      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Stats
      </Button>
    </div>
  );
}