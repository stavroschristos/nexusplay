import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getAllInvites, disableInvite, createAdminCode, inviteLink } from '@/lib/invites';
import { Link as LinkIcon, Copy, UserPlus, Ban, Users, TrendingUp, Award, UserCheck, Clock } from 'lucide-react';

const STATUS_CLS = {
  sent: 'bg-secondary/60 text-muted-foreground',
  opened: 'bg-blue-500/15 text-blue-300',
  registered: 'bg-amber-500/15 text-amber-300',
  activated: 'bg-emerald-500/15 text-emerald-300',
  disabled: 'bg-destructive/15 text-destructive',
};

export default function AdminInvites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [limitTarget, setLimitTarget] = useState('');
  const [limitValue, setLimitValue] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [all, us] = await Promise.all([getAllInvites(200), base44.entities.User.list('-created_date', 200)]);
      setInvites(all);
      setUsers(us);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await createAdminCode(note);
      setNote('');
      await load();
      toast({ title: 'Admin invite code created' });
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const handleDisable = async (id) => {
    try { await disableInvite(id); await load(); toast({ title: 'Invite disabled' }); }
    catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const handleSetLimit = async () => {
    if (!limitTarget || !limitValue) return;
    try {
      await base44.asServiceRole.entities.User.update(limitTarget, { invite_limit: Number(limitValue) });
      toast({ title: `Invite limit set to ${limitValue}` });
      setLimitTarget(''); setLimitValue('');
      await load();
    } catch { toast({ title: 'Failed', variant: 'destructive' }); }
  };

  const stats = {
    total: invites.length,
    joined: invites.filter((i) => ['registered', 'activated'].includes(i.status)).length,
    activated: invites.filter((i) => i.status === 'activated').length,
  };
  const conversion = stats.total ? Math.round((stats.joined / stats.total) * 100) : 0;

  const userInvites = {};
  invites.forEach((i) => {
    if (i.inviter_id && i.inviter_id !== 'platform') {
      userInvites[i.inviter_id] = (userInvites[i.inviter_id] || 0) + 1;
    }
  });
  const topInviters = Object.entries(userInvites)
    .map(([id, count]) => ({ name: users.find((u) => u.id === id)?.display_name || 'Unknown', count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const nameById = (id) => users.find((u) => u.id === id)?.display_name || (id === 'platform' ? 'NexusPlay' : '—');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Invites', value: stats.total, icon: Users, cls: 'text-primary' },
          { label: 'Signup Conversion', value: `${conversion}%`, icon: TrendingUp, cls: 'text-blue-400' },
          { label: 'Joined', value: stats.joined, icon: UserPlus, cls: 'text-amber-400' },
          { label: 'Activated', value: stats.activated, icon: UserCheck, cls: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card/50 p-4">
            <s.icon className={`w-5 h-5 mb-2 ${s.cls}`} />
            <p className="text-2xl font-bold font-heading">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4" /> Create Admin Invite Code</h3>
          <div className="space-y-2"><Label>Internal note (optional)</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Press preview event" className="bg-secondary/30" /></div>
          <Button onClick={handleCreate} className="w-full">Generate Code</Button>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Award className="w-4 h-4" /> Assign Invite Limit</h3>
          <div className="grid grid-cols-2 gap-2">
            <select value={limitTarget} onChange={(e) => setLimitTarget(e.target.value)} className="h-9 rounded-md border border-input bg-secondary/30 px-2 text-sm">
              <option value="">Select user…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.display_name || u.email}</option>)}
            </select>
            <Input type="number" min="0" value={limitValue} onChange={(e) => setLimitValue(e.target.value)} placeholder="Limit" className="bg-secondary/30" />
          </div>
          <Button onClick={handleSetLimit} variant="outline" className="w-full">Set Limit</Button>
        </div>
      </div>

      {topInviters.length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Top Inviters</h3>
          <div className="space-y-1">
            {topInviters.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between py-1.5">
                <span className="text-sm flex items-center gap-2"><span className="w-5 text-muted-foreground">#{i + 1}</span> {t.name}</span>
                <span className="text-sm font-semibold text-primary">{t.count} invite{t.count === 1 ? '' : 's'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
        <h3 className="font-semibold p-4 border-b border-border">Invite Activity</h3>
        {loading ? <p className="p-4 text-sm text-muted-foreground">Loading…</p> : invites.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No invites yet.</p>
        ) : (
          <div className="divide-y divide-border max-h-[28rem] overflow-y-auto scrollbar-thin">
            {invites.map((inv) => (
              <div key={inv.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/50 grid place-items-center shrink-0"><LinkIcon className="w-4 h-4 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono font-semibold">{inv.code}</code>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[inv.status]}`}>{inv.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    by {nameById(inv.inviter_id)}{inv.recipient_name ? ` → ${inv.recipient_name}` : ''}
                  </p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(inviteLink(inv.code)); toast({ title: 'Link copied' }); }} className="w-8 h-8 rounded-lg bg-secondary/50 grid place-items-center" title="Copy link"><Copy className="w-3.5 h-3.5" /></button>
                {inv.status !== 'disabled' && (
                  <button onClick={() => handleDisable(inv.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center" title="Disable"><Ban className="w-3.5 h-3.5" /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}