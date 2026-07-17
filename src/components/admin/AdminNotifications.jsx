import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, Megaphone, TrendingUp, BarChart3, Mail, Eye } from 'lucide-react';
import { broadcastNotification } from '@/lib/notifications';
import { logAdminAction } from '@/lib/admin-audit';

export default function AdminNotifications() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feat, setFeat] = useState({ title: '', content: '', link: '', icon: '✨' });
  const [ann, setAnn] = useState({ title: '', message: '', type: 'update' });
  const [savingAnn, setSavingAnn] = useState(false);
  const [stats, setStats] = useState({ sent: 0, opened: 0, byType: {} });

  useEffect(() => {
    base44.entities.User.list('-created_date', 500).then(setUsers).catch(() => {}).finally(() => setLoading(false));
    // Engagement analytics
    base44.entities.AnalyticsEvent.filter({ event_name: 'notif_sent' }).then((s) => {
      base44.entities.AnalyticsEvent.filter({ event_name: 'notif_opened' }).then((o) => {
        const byType = {};
        s.forEach((e) => { const t = e.properties?.type || 'unknown'; byType[t] = (byType[t] || 0) + 1; });
        setStats({ sent: s.length, opened: o.length, byType });
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const sendFeatured = async () => {
    if (!feat.title.trim() && !feat.content.trim()) return;
    setSending(true);
    try {
      const ids = users.map((u) => u.id).filter(Boolean);
      await broadcastNotification(ids, {
        type: 'featured',
        title: feat.title.trim() || 'Featured',
        content: feat.content.trim() || feat.title.trim(),
        link: feat.link || '/home',
        icon: feat.icon || '✨',
        force: true,
      });
      logAdminAction({ action: 'featured_notification_sent', targetType: 'other', targetLabel: feat.title || feat.content, details: `to ${ids.length} users` });
      toast({ title: `Featured notification sent to ${ids.length} users` });
      setFeat({ title: '', content: '', link: '', icon: '✨' });
    } catch {
      toast({ title: 'Failed to send', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const saveAnnouncement = async () => {
    if (!ann.title.trim() || !ann.message.trim()) return;
    setSavingAnn(true);
    try {
      await base44.entities.AppAnnouncement.create({
        title: ann.title.trim(),
        message: ann.message.trim(),
        type: ann.type,
        active: true,
        dismissable: true,
        starts_at: new Date().toISOString(),
      });
      logAdminAction({ action: 'announcement_created', targetType: 'other', targetLabel: ann.title, details: `type=${ann.type}` });
      toast({ title: 'Announcement published' });
      setAnn({ title: '', message: '', type: 'update' });
    } catch {
      toast({ title: 'Failed to publish', variant: 'destructive' });
    } finally {
      setSavingAnn(false);
    }
  };

  const openRate = stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Megaphone className="w-4 h-4" /> Notifications</h2>
        <p className="text-xs text-muted-foreground mt-1">Broadcast featured notifications, publish announcements, and track engagement.</p>
      </div>

      {/* Engagement stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Send className="w-3.5 h-3.5" /> Sent</div>
          <p className="text-2xl font-bold mt-1">{stats.sent}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Eye className="w-3.5 h-3.5" /> Opened</div>
          <p className="text-2xl font-bold mt-1">{stats.opened}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="w-3.5 h-3.5" /> Open rate</div>
          <p className="text-2xl font-bold mt-1">{openRate}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><BarChart3 className="w-3.5 h-3.5" /> Reach</div>
          <p className="text-2xl font-bold mt-1">{users.length}</p>
        </div>
      </div>

      {/* Top types */}
      {Object.keys(stats.byType).length > 0 && (
        <div className="rounded-2xl border border-border bg-card/50 p-4">
          <h3 className="text-sm font-semibold mb-3">Most engaging notification types</h3>
          <div className="space-y-2">
            {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([t, count]) => (
              <div key={t} className="flex items-center gap-3">
                <span className="text-xs font-medium capitalize w-28">{t}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${stats.sent ? (count / stats.sent) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured notification */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Send className="w-4 h-4 text-primary" /> Send a featured notification</h3>
        <p className="text-xs text-muted-foreground">Delivers an in-app notification to all {users.length} users.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label className="text-xs">Headline</Label><Input value={feat.title} onChange={(e) => setFeat({ ...feat, title: e.target.value })} placeholder="New feature is live!" className="bg-secondary/30" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Icon (emoji)</Label><Input value={feat.icon} onChange={(e) => setFeat({ ...feat, icon: e.target.value })} placeholder="✨" className="bg-secondary/30" /></div>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">Message</Label><Textarea value={feat.content} onChange={(e) => setFeat({ ...feat, content: e.target.value })} placeholder="Tell users what's new..." className="bg-secondary/30 resize-none" rows={2} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Link (optional)</Label><Input value={feat.link} onChange={(e) => setFeat({ ...feat, link: e.target.value })} placeholder="/home" className="bg-secondary/30" /></div>
        <Button onClick={sendFeatured} disabled={sending || (!feat.title.trim() && !feat.content.trim())} className="rounded-full">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send to {users.length} users
        </Button>
      </div>

      {/* Platform announcement */}
      <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Publish a platform announcement</h3>
        <p className="text-xs text-muted-foreground">Shows as a dismissible banner at the top of the app for all users.</p>
        <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={ann.title} onChange={(e) => setAnn({ ...ann, title: e.target.value })} placeholder="Scheduled maintenance" className="bg-secondary/30" /></div>
        <div className="space-y-1.5"><Label className="text-xs">Message</Label><Textarea value={ann.message} onChange={(e) => setAnn({ ...ann, message: e.target.value })} placeholder="We'll be briefly offline..." className="bg-secondary/30 resize-none" rows={2} /></div>
        <div className="space-y-1.5"><Label className="text-xs">Style</Label>
          <select value={ann.type} onChange={(e) => setAnn({ ...ann, type: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">
            <option value="info">Info</option><option value="update">Update</option><option value="warning">Warning</option><option value="maintenance">Maintenance</option>
          </select>
        </div>
        <Button onClick={saveAnnouncement} disabled={savingAnn || !ann.title.trim() || !ann.message.trim()} className="rounded-full">
          {savingAnn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />} Publish announcement
        </Button>
      </div>
    </div>
  );
}