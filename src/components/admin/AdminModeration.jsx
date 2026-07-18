import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAdminAction } from '@/lib/admin-audit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Flag, Ban, Trash2, Check, X, AlertTriangle, Users, FileText, Shield, Eye, EyeOff, History } from 'lucide-react';

const REASON_COLORS = {
  spam: 'bg-blue-500/20 text-blue-400', harassment: 'bg-red-500/20 text-red-400',
  nsfw: 'bg-purple-500/20 text-purple-400', hate_speech: 'bg-rose-500/20 text-rose-400',
  violence: 'bg-orange-500/20 text-orange-400', scam: 'bg-amber-500/20 text-amber-400',
  cheating: 'bg-teal-500/20 text-teal-400', other: 'bg-muted text-muted-foreground',
};

export default function AdminModeration() {
  const { toast } = useToast();
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [history, setHistory] = useState([]);
  const [reportFilter, setReportFilter] = useState('all');
  const [showHidden, setShowHidden] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, u, p, c, h] = await Promise.all([
        base44.entities.Report.list('-created_date', 200),
        base44.entities.User.list('-created_date', 500),
        base44.entities.Post.list('-created_date', 200),
        base44.entities.Community.list('-created_date', 200),
        base44.entities.AdminAuditLog.list('-created_date', 100),
      ]);
      setReports(r); setUsers(u); setPosts(p); setCommunities(c); setHistory(h);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const resolveReport = async (r, status, note) => {
    await base44.entities.Report.update(r.id, { status, resolution_note: note || '' });
    await logAdminAction({ action: 'report_' + status, targetType: 'report', targetId: r.id, targetLabel: r.target_name || r.target_type, details: `Report ${status}: ${note || ''}` });
    toast({ title: `Report ${status}` });
    loadData();
  };

  const suspendUser = async (u) => {
    await base44.entities.User.update(u.id, { status: 'suspended', ban_reason: 'Suspended by admin' });
    await logAdminAction({ action: 'user_suspend', targetType: 'user', targetId: u.id, targetLabel: u.display_name || u.email, details: 'Account suspended' });
    toast({ title: `${u.display_name || u.email} suspended` });
    loadData();
  };

  const banUser = async (u) => {
    await base44.entities.User.update(u.id, { status: 'banned', ban_reason: 'Banned by admin' });
    await logAdminAction({ action: 'user_ban', targetType: 'user', targetId: u.id, targetLabel: u.display_name || u.email, details: 'Account banned' });
    toast({ title: `${u.display_name || u.email} banned` });
    loadData();
  };

  const restoreUser = async (u) => {
    await base44.entities.User.update(u.id, { status: 'active', ban_reason: '' });
    await logAdminAction({ action: 'user_restore', targetType: 'user', targetId: u.id, targetLabel: u.display_name || u.email, details: 'Account restored' });
    toast({ title: `${u.display_name || u.email} reinstated` });
    loadData();
  };

  const hidePost = async (p) => {
    await base44.entities.Post.update(p.id, { hidden: true, hidden_reason: 'Hidden by admin', hidden_at: new Date().toISOString() });
    await logAdminAction({ action: 'post_hide', targetType: 'post', targetId: p.id, targetLabel: (p.content || '').slice(0, 60), details: 'Post hidden' });
    toast({ title: 'Post hidden' });
    loadData();
  };

  const unhidePost = async (p) => {
    await base44.entities.Post.update(p.id, { hidden: false, hidden_reason: '', hidden_at: '' });
    await logAdminAction({ action: 'post_unhide', targetType: 'post', targetId: p.id, targetLabel: (p.content || '').slice(0, 60), details: 'Post restored' });
    toast({ title: 'Post restored' });
    loadData();
  };

  const removePost = async (p) => {
    await base44.entities.Post.delete(p.id);
    await logAdminAction({ action: 'post_delete', targetType: 'post', targetId: p.id, targetLabel: (p.content || '').slice(0, 60), details: 'Post deleted' });
    toast({ title: 'Post removed' });
    loadData();
  };

  const deleteCommunity = async (c) => {
    await base44.entities.Community.delete(c.id);
    await logAdminAction({ action: 'community_delete', targetType: 'community', targetId: c.id, targetLabel: c.name, details: 'Community deleted' });
    toast({ title: 'Community deleted' });
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  const tabs = [
    { key: 'reports', label: 'Reports', icon: Flag, count: reports.filter((r) => r.status === 'pending').length },
    { key: 'users', label: 'Users', icon: Users, count: users.length },
    { key: 'posts', label: 'Posts', icon: FileText, count: posts.length },
    { key: 'communities', label: 'Communities', icon: Shield, count: communities.length },
    { key: 'flagged', label: 'Flagged Accounts', icon: Ban, count: users.filter((u) => u.status !== 'active').length },
    { key: 'history', label: 'History', icon: History, count: history.length },
  ];

  const filteredReports = reportFilter === 'all' ? reports : reports.filter((r) => r.target_type === reportFilter);
  const reportTypes = ['all', ...new Set(reports.map((r) => r.target_type))];
  const visiblePosts = showHidden ? posts.filter((p) => p.hidden) : posts.filter((p) => !p.hidden);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl bg-card/50 border border-border overflow-x-auto scrollbar-thin">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 min-w-max py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.count != null && <span className="text-[10px] opacity-70">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === 'reports' && (
        <div className="space-y-3">
          <div className="flex gap-1 flex-wrap">
            {reportTypes.map((rt) => (
              <button key={rt} onClick={() => setReportFilter(rt)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${reportFilter === rt ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}>{rt}</button>
            ))}
          </div>
          {filteredReports.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No reports filed.</p>}
          {filteredReports.map((r) => (
            <Card key={r.id} className="p-4 bg-card/50 border-border">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`${REASON_COLORS[r.reason] || REASON_COLORS.other} border-0`}>{r.reason}</Badge>
                    <span className="text-xs text-muted-foreground">{r.target_type}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.created_date).toLocaleDateString()}</span>
                    {r.status !== 'pending' && <Badge variant="outline" className="text-[10px]">{r.status}</Badge>}
                  </div>
                  {r.target_name && <p className="text-sm font-medium truncate">{r.target_name}</p>}
                  {r.details && <p className="text-sm text-muted-foreground mt-1">{r.details}</p>}
                  {r.resolution_note && <p className="text-xs text-muted-foreground mt-1 italic">Resolution: {r.resolution_note}</p>}
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => resolveReport(r, 'resolved', 'Actioned')}><Check className="w-4 h-4" /> Resolve</Button>
                    <Button size="sm" variant="ghost" onClick={() => resolveReport(r, 'dismissed', 'No violation')}><X className="w-4 h-4" /> Dismiss</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="p-3 bg-card/50 border-border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.display_name || u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email} · {u.role}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {u.status === 'banned' || u.status === 'suspended' ? (
                  <Badge className="bg-destructive/20 text-destructive border-0">{u.status}</Badge>
                ) : (
                  <Badge className="bg-chart-2/20 text-chart-2 border-0">{u.status || 'active'}</Badge>
                )}
                {u.status === 'banned' || u.status === 'suspended' ? (
                  <Button size="sm" variant="outline" onClick={() => restoreUser(u)}>Restore</Button>
                ) : (
                  u.role !== 'admin' && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => suspendUser(u)}>Suspend</Button>
                      <Button size="sm" variant="destructive" onClick={() => banUser(u)}><Ban className="w-4 h-4" /> Ban</Button>
                    </>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'posts' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost" onClick={() => setShowHidden(!showHidden)}>
              {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} {showHidden ? 'Showing hidden' : 'Showing live'}
            </Button>
            <span className="text-xs text-muted-foreground">{posts.filter((p) => p.hidden).length} hidden total</span>
          </div>
          {visiblePosts.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No posts {showHidden ? 'hidden' : 'live'}.</p>}
          {visiblePosts.map((p) => (
            <Card key={p.id} className={`p-3 bg-card/50 border-border ${p.hidden ? 'opacity-60 border-amber-500/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{p.type} · {new Date(p.created_date).toLocaleDateString()}{p.hidden && ' · hidden'}</p>
                  <p className="text-sm truncate">{p.content || '(no text)'}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {p.hidden ? (
                    <Button size="sm" variant="ghost" onClick={() => unhidePost(p)}><Eye className="w-4 h-4" /> Unhide</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => hidePost(p)}><EyeOff className="w-4 h-4" /> Hide</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => removePost(p)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'communities' && (
        <div className="space-y-2">
          {communities.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No communities.</p>}
          {communities.map((c) => (
            <Card key={c.id} className="p-3 bg-card/50 border-border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.category} · {c.members_count || 0} members</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => deleteCommunity(c)}><Trash2 className="w-4 h-4" /></Button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'flagged' && (
        <div className="space-y-2">
          {users.filter((u) => u.status !== 'active').length === 0 && (
            <div className="text-center py-10">
              <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No flagged accounts.</p>
            </div>
          )}
          {users.filter((u) => u.status !== 'active').map((u) => (
            <Card key={u.id} className="p-3 bg-destructive/5 border-destructive/30 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.display_name || u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.ban_reason || u.status}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => restoreUser(u)}>Restore</Button>
            </Card>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">No moderation actions recorded yet.</p>}
          {history.map((h) => (
            <Card key={h.id} className="p-3 bg-card/50 border-border">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{h.admin_name} · <span className="text-primary font-mono text-xs">{h.action}</span></p>
                  <p className="text-xs text-muted-foreground truncate">{h.target_type}: {h.target_label || h.target_id}</p>
                  {h.details && <p className="text-xs text-muted-foreground mt-0.5">{h.details}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(h.created_date).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}