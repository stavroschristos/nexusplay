import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PRIVACY_FIELDS, PRIVACY_OPTIONS, DM_OPTIONS } from '@/lib/privacy';
import { Loader2, Save, Lock, Users, Globe, MessageSquare, Ban, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VIS_ICON = { public: Globe, friends: Users, private: Lock };

export default function PrivacySection() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({});
  const [dm, setDm] = useState('everyone');
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  useEffect(() => {
    const next = {};
    PRIVACY_FIELDS.forEach((f) => { next[f.key] = user?.[f.key] || 'public'; });
    setSettings(next);
    setDm(user?.dm_permission || 'everyone');
  }, [user]);

  useEffect(() => {
    base44.entities.Block.list('-created_date', 100).then(setBlocks).catch(() => {}).finally(() => setLoadingBlocks(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ ...settings, dm_permission: dm });
      await checkUserAuth();
      toast({ title: 'Privacy settings saved' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const unblock = async (b) => {
    try {
      await base44.entities.Block.delete(b.id);
      setBlocks((prev) => prev.filter((x) => x.id !== b.id));
      toast({ title: 'User unblocked' });
    } catch {
      toast({ title: 'Failed to unblock', variant: 'destructive' });
    }
  };

  const setAll = (value) => {
    const next = {};
    PRIVACY_FIELDS.forEach((f) => { next[f.key] = value; });
    setSettings(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Lock className="w-4 h-4" /> Privacy</h2>
        <p className="text-xs text-muted-foreground mt-1">Control who can see each part of your profile. Public gaming identity is yours to share — private account info always stays private.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setAll('public')}><Globe className="w-3.5 h-3.5" /> Set all public</Button>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setAll('friends')}><Users className="w-3.5 h-3.5" /> Set all friends-only</Button>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setAll('private')}><Lock className="w-3.5 h-3.5" /> Set all private</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm divide-y divide-border/60">
        {PRIVACY_FIELDS.map((f) => (
          <div key={f.key} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {PRIVACY_OPTIONS.map((opt) => {
                const Icon = VIS_ICON[opt.value];
                const active = settings[f.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSettings((s) => ({ ...s, [f.key]: opt.value }))}
                    title={opt.hint}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border',
                      active ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/30 text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Who can message you</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDm(opt.value)}
              className={cn(
                'rounded-xl p-3 text-center transition-all border',
                dm === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary/30 text-muted-foreground border-border hover:text-foreground'
              )}
            >
              <p className="text-sm font-medium">{opt.label}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full rounded-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Privacy Settings
      </Button>

      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Ban className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold">Blocked users</h3>
        </div>
        {loadingBlocks ? (
          <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
        ) : blocks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">You haven't blocked anyone. Block a user from their profile.</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                <div className="w-8 h-8 rounded-full bg-primary/20 grid place-items-center text-primary font-bold text-sm shrink-0">
                  {(b.blocked_name || 'G').charAt(0).toUpperCase()}
                </div>
                <p className="text-sm flex-1 truncate">{b.blocked_name || 'Blocked user'}</p>
                <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => unblock(b)}><Trash2 className="w-3.5 h-3.5" /> Unblock</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}