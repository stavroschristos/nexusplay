import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Bell, Mail, Smartphone } from 'lucide-react';

const IN_APP_PREFS = [
  { key: 'notif_followers', label: 'Followers', hint: 'When someone follows you' },
  { key: 'notif_likes', label: 'Likes', hint: 'When your posts get liked' },
  { key: 'notif_comments', label: 'Comments & replies', hint: 'When someone comments on your content' },
  { key: 'notif_messages', label: 'Messages', hint: 'New direct messages' },
  { key: 'notif_achievements', label: 'Achievements', hint: 'Trophies, milestones and rare unlocks' },
  { key: 'notif_communities', label: 'Communities', hint: 'Invites, announcements and trending discussions' },
  { key: 'notif_challenges', label: 'Challenges', hint: 'Weekly and community challenge updates' },
  { key: 'notif_recommendations', label: 'Recommendations', hint: 'Gamers and games matched to your taste' },
];

const EMAIL_PREFS = [
  { key: 'email_weekly_summary', label: 'Weekly summary', hint: 'A digest of your gaming week' },
  { key: 'email_important_updates', label: 'Important updates', hint: 'Product news and announcements' },
  { key: 'email_account_activity', label: 'Account activity', hint: 'Security and login alerts' },
];

export default function NotificationsSection() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = {};
    [...IN_APP_PREFS, ...EMAIL_PREFS].forEach((p) => { next[p.key] = user?.[p.key] !== false; });
    setPrefs(next);
  }, [user]);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(prefs);
      await checkUserAuth();
      toast({ title: 'Notification preferences saved' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onClick }) => (
    <button
      onClick={onClick}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-secondary'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h2>
        <p className="text-xs text-muted-foreground mt-1">Choose what reaches your notification center. You'll never miss what matters to you.</p>
      </div>

      {/* In-app */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> In-app notifications</h3>
        <div className="divide-y divide-border/50">
          {IN_APP_PREFS.map((p) => (
            <div key={p.key} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.hint}</p>
              </div>
              <Toggle checked={!!prefs[p.key]} onClick={() => toggle(p.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email notifications</h3>
        <p className="text-xs text-muted-foreground mb-3">Email preferences are saved now and will take effect when email delivery launches.</p>
        <div className="divide-y divide-border/50">
          {EMAIL_PREFS.map((p) => (
            <div key={p.key} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.hint}</p>
              </div>
              <Toggle checked={!!prefs[p.key]} onClick={() => toggle(p.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Push prep */}
      <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-4">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Smartphone className="w-4 h-4 text-muted-foreground" /> Mobile push notifications</h3>
        <p className="text-xs text-muted-foreground">Push notifications are coming with the mobile app. Your preferences above will carry over automatically when push launches.</p>
      </div>

      <Button onClick={save} disabled={saving} className="w-full rounded-full">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Notification Preferences
      </Button>
    </div>
  );
}