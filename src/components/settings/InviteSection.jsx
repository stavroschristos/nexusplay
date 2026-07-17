import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { createInvite, getMyInvites, computeAvailable, inviteLink } from '@/lib/invites';
import { Link as LinkIcon, Copy, Mail, Users, Gift, Check, Clock, UserCheck, UserPlus, Zap } from 'lucide-react';

const STATUS_META = {
  sent: { label: 'Sent', icon: Clock, cls: 'bg-secondary/60 text-muted-foreground' },
  opened: { label: 'Opened', icon: Mail, cls: 'bg-blue-500/15 text-blue-300' },
  registered: { label: 'Joined', icon: UserPlus, cls: 'bg-amber-500/15 text-amber-300' },
  activated: { label: 'Activated', icon: UserCheck, cls: 'bg-emerald-500/15 text-emerald-300' },
  disabled: { label: 'Disabled', icon: Clock, cls: 'bg-destructive/15 text-destructive' },
};

export default function InviteSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try { setInvites(await getMyInvites(user.id)); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

  const available = computeAvailable(user, invites.length);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createInvite({ userId: user.id, userName: user.display_name || user.full_name, recipientEmail: email || undefined });
      setEmail('');
      await load();
      toast({ title: 'Invite created!', description: 'Share the link with a friend.' });
    } catch {
      toast({ title: 'Failed to create invite', variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const copy = (text, label = 'Copied!') => {
    navigator.clipboard.writeText(text);
    toast({ title: label });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Gift className="w-4 h-4" /> Your Alpha Invites</h2>
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-fuchsia-500/5 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 grid place-items-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold font-heading">{available}</p>
            <p className="text-xs text-muted-foreground">available invite{available === 1 ? '' : 's'} remaining</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Total issued</p>
            <p className="text-lg font-semibold">{invites.length}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Friend's email (optional)" className="bg-secondary/30" type="email" />
          <Button onClick={handleCreate} disabled={creating || available <= 0} className="shrink-0">
            {creating ? 'Creating…' : <><UserPlus className="w-4 h-4" /> Generate Invite</>}
          </Button>
        </div>
        {available <= 0 && <p className="text-xs text-muted-foreground mt-2">You've used all your invites. As they activate, you may earn more.</p>}
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading invites…</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No invites yet — generate your first one above.</p>
        ) : (
          invites.map((inv) => {
            const st = STATUS_META[inv.status] || STATUS_META.sent;
            return (
              <div key={inv.id} className="rounded-xl border border-border bg-card/50 p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/50 grid place-items-center shrink-0"><LinkIcon className="w-4 h-4 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono font-semibold">{inv.code}</code>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>
                      <st.icon className="w-3 h-3" /> {st.label}
                    </span>
                  </div>
                  {inv.recipient_name && <p className="text-xs text-muted-foreground mt-0.5">→ {inv.recipient_name}{inv.recipient_email ? ` · ${inv.recipient_email}` : ''}</p>}
                  {!inv.recipient_name && inv.recipient_email && <p className="text-xs text-muted-foreground mt-0.5">→ {inv.recipient_email}</p>}
                </div>
                <button onClick={() => copy(inviteLink(inv.code), 'Invite link copied!')} className="w-9 h-9 rounded-lg bg-secondary/50 hover:bg-secondary grid place-items-center shrink-0" title="Copy link">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => copy(inv.code, 'Code copied!')} className="w-9 h-9 rounded-lg bg-secondary/50 hover:bg-secondary grid place-items-center shrink-0" title="Copy code">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Zap className="w-3 h-3" /> Earn bonus invites when your friends activate their gaming identity.</p>
    </section>
  );
}