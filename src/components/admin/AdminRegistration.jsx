import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { UserCheck, Check, X, Clock, Mail, Gamepad2, Loader2 } from 'lucide-react';

const MODES = [
  { key: 'public', label: 'Public Registration', desc: 'Anyone can create an account freely.' },
  { key: 'invite_only', label: 'Invite-Only', desc: 'Registration is closed; admins invite users.' },
  { key: 'waitlist', label: 'Waitlist Mode', desc: 'Visitors join a waitlist; admins approve access.' },
];

const PLATFORMS = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Battle.net', 'Riot', 'Twitch', 'PC', 'Mobile'];

export default function AdminRegistration() {
  const { toast } = useToast();
  const [settingsId, setSettingsId] = useState(null);
  const [mode, setMode] = useState('public');
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [list, wl] = await Promise.all([
        base44.entities.AdminSettings.list('-created_date', 5),
        base44.entities.WaitlistEntry.list('-created_date', 200),
      ]);
      if (list.length > 0) {
        setSettingsId(list[0].id);
        setMode(list[0].registration_mode || 'public');
      }
      setEntries(wl || []);
    } catch (e) {
      toast({ title: 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setRegMode = async (m) => {
    if (!settingsId) return;
    try {
      setMode(m);
      await base44.entities.AdminSettings.update(settingsId, { registration_mode: m });
      toast({ title: `Registration set to ${m.replace('_', ' ')}` });
    } catch (e) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const setStatus = async (id, status) => {
    try {
      const updated = await base44.entities.WaitlistEntry.update(id, { status });
      setEntries((p) => p.map((e) => (e.id === id ? updated : e)));
      toast({ title: `Entry ${status}` });
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const filtered = entries.filter((e) => (filter === 'all' ? true : e.status === filter));
  const counts = {
    pending: entries.filter((e) => e.status === 'pending').length,
    approved: entries.filter((e) => e.status === 'approved').length,
    rejected: entries.filter((e) => e.status === 'rejected').length,
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><UserCheck className="w-4 h-4 text-primary" /> Registration Mode</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {MODES.map((m) => (
            <button key={m.key} onClick={() => setRegMode(m.key)}
              className={`text-left rounded-2xl border p-4 transition-all ${mode === m.key ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-primary/50'}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{m.label}</p>
                {mode === m.key && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
        {mode === 'waitlist' && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            New visitors will be directed to the waitlist form. Approve entries below to grant access.
          </p>
        )}
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Waitlist Review</h3>
          <div className="flex gap-1.5">
            {['pending', 'approved', 'rejected', 'all'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/40 text-muted-foreground hover:text-foreground'}`}>
                {f} {f !== 'all' && counts[f] !== undefined && `(${counts[f]})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No {filter} entries.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent grid place-items-center font-bold text-sm shrink-0">{(e.name || '?')[0].toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{e.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {e.email}</span>
                    {e.favorite_platform && <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" /> {e.favorite_platform}</span>}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize shrink-0 ${e.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' : e.status === 'rejected' ? 'bg-destructive/15 text-destructive' : 'bg-amber-500/15 text-amber-300'}`}>{e.status}</span>
                {e.status === 'pending' && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setStatus(e.id, 'approved')}><Check className="w-4 h-4 text-emerald-400" /></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setStatus(e.id, 'rejected')}><X className="w-4 h-4 text-destructive" /></Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}