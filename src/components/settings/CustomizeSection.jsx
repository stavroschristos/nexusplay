import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { PROFILE_THEMES } from '@/components/profile/themeConfig';
import { cn } from '@/lib/utils';

const DIMENSIONS = [
  { key: 'completion_style', label: 'Completion Style', options: ['Completionist', 'Main Story Focus', 'Side Quest Explorer', 'Casual', 'Hardcore 100%', 'Story Skipper'] },
  { key: 'competitive_level', label: 'Competitive Level', options: ['Casual', 'Recreational', 'Competitive', 'Ranked Grinder', 'Esports Hopeful'] },
  { key: 'multiplayer_preference', label: 'Multiplayer Preference', options: ['Solo Only', 'Co-op', 'Team Player', 'Versus', 'Mixed'] },
];

export default function CustomizeSection({ user, onSaved }) {
  const { checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState(user?.profile_theme || 'nebula');
  const [dims, setDims] = useState({
    completion_style: user?.completion_style || '',
    competitive_level: user?.competitive_level || '',
    multiplayer_preference: user?.multiplayer_preference || '',
  });
  const [habits, setHabits] = useState((user?.gaming_habits || []).join(', '));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        profile_theme: theme,
        completion_style: dims.completion_style || undefined,
        competitive_level: dims.competitive_level || undefined,
        multiplayer_preference: dims.multiplayer_preference || undefined,
        gaming_habits: habits.split(',').map((h) => h.trim()).filter(Boolean),
      });
      await checkUserAuth();
      onSaved?.();
      toast({ title: 'Profile customization saved!' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-5">
      <div>
        <Label className="text-sm font-semibold">Profile Theme</Label>
        <p className="text-xs text-muted-foreground mb-3">Choose an animated background for your profile banner.</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Object.entries(PROFILE_THEMES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={cn(
                'aspect-square rounded-xl border-2 transition-all overflow-hidden relative',
                theme === key ? 'border-primary scale-105 ring-2 ring-primary/30' : 'border-border hover:border-primary/40',
                t.animated
              )}
              title={t.label}
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br', t.banner)} />
              <div className="absolute inset-0 theme-anim opacity-80" style={{ background: `radial-gradient(circle at 50% 50%, ${t.glow}, transparent 70%)` }} />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Selected: <span className="text-foreground font-medium">{PROFILE_THEMES[theme]?.label}</span></p>
      </div>

      {DIMENSIONS.map((d) => (
        <div key={d.key} className="space-y-2">
          <Label className="text-xs">{d.label}</Label>
          <div className="flex flex-wrap gap-1.5">
            {d.options.map((o) => (
              <button
                key={o}
                onClick={() => setDims((prev) => ({ ...prev, [d.key]: prev[d.key] === o ? '' : o }))}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                  dims[d.key] === o ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <Label className="text-xs">Gaming Habits (comma separated)</Label>
        <Input value={habits} onChange={(e) => setHabits(e.target.value)} placeholder="Night Owl, Speedrunner, Lore Digger..." className="bg-secondary/30" />
      </div>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Customization
      </Button>
    </div>
  );
}