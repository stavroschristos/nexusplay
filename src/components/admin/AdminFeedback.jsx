import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageSquare, Lightbulb, Sparkles, Star, Loader2, X, Check, Filter, ImageOff } from 'lucide-react';

const STATUSES = ['new', 'reviewing', 'planned', 'in_development', 'completed', 'declined'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const CATEGORIES = ['bug', 'feature', 'ux', 'design', 'performance', 'content', 'general'];

const STATUS_STYLE = {
  new: 'bg-blue-500/15 text-blue-300',
  reviewing: 'bg-amber-500/15 text-amber-300',
  planned: 'bg-violet-500/15 text-violet-300',
  in_development: 'bg-cyan-500/15 text-cyan-300',
  completed: 'bg-emerald-500/15 text-emerald-300',
  declined: 'bg-destructive/15 text-destructive',
};
const PRIORITY_STYLE = {
  critical: 'bg-destructive/20 text-destructive',
  high: 'bg-orange-500/15 text-orange-300',
  medium: 'bg-amber-500/15 text-amber-300',
  low: 'bg-secondary text-muted-foreground',
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

export default function AdminFeedback() {
  const { toast } = useToast();
  const [sub, setSub] = useState('feedback'); // feedback | features | alpha
  const [feedback, setFeedback] = useState([]);
  const [features, setFeatures] = useState([]);
  const [votes, setVotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState({ status: 'all', priority: 'all', category: 'all', alphaOnly: false, q: '' });
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [fb, fr, vt, us] = await Promise.all([
        base44.entities.Feedback.list('-created_date', 500),
        base44.entities.FeatureRequest.list('-created_date', 200),
        base44.entities.FeatureVote.list('-created_date', 500),
        base44.entities.User.list('-created_date', 100),
      ]);
      setFeedback(fb || []);
      setFeatures(fr || []);
      setVotes(vt || []);
      setUsers(us || []);
    } catch {
      toast({ title: 'Failed to load feedback', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const voteCounts = useMemo(() => {
    const m = {};
    votes.forEach((v) => { m[v.feature_request_id] = (m[v.feature_request_id] || 0) + 1; });
    return m;
  }, [votes]);

  const stats = useMemo(() => {
    const total = feedback.length;
    const fresh = feedback.filter((f) => f.status === 'new').length;
    const open = feedback.filter((f) => ['new', 'reviewing', 'planned', 'in_development'].includes(f.status)).length;
    const resolved = feedback.filter((f) => f.status === 'completed').length;
    const rated = feedback.filter((f) => f.rating);
    const avg = rated.length ? (rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(2) : '—';
    const byCategory = CATEGORIES.map((c) => ({ c, n: feedback.filter((f) => f.category === c).length })).sort((a, b) => b.n - a.n);
    const byPage = {};
    feedback.forEach((f) => {
      if (!f.page_path) return;
      byPage[f.page_path] = byPage[f.page_path] || { sum: 0, n: 0, issues: 0 };
      byPage[f.page_path].sum += f.rating || 0;
      byPage[f.page_path].n += 1;
      if (f.category === 'bug' || f.category === 'ux') byPage[f.page_path].issues += 1;
    });
    const pageRows = Object.entries(byPage).map(([p, v]) => ({ p, avg: v.n ? (v.sum / v.n).toFixed(2) : '—', n: v.n, issues: v.issues }));
    const highest = [...pageRows].filter((r) => r.n >= 1).sort((a, b) => Number(b.avg) - Number(a.avg)).slice(0, 3);
    const lowest = [...pageRows].filter((r) => r.n >= 1).sort((a, b) => Number(a.avg) - Number(b.avg)).slice(0, 3);
    return { total, fresh, open, resolved, avg, byCategory, highest, lowest };
  }, [feedback]);

  const filtered = useMemo(() => {
    return feedback.filter((f) => {
      if (filter.status !== 'all' && f.status !== filter.status) return false;
      if (filter.priority !== 'all' && f.priority !== filter.priority) return false;
      if (filter.category !== 'all' && f.category !== filter.category) return false;
      if (filter.alphaOnly && !f.is_alpha_tester) return false;
      if (filter.q && !(`${f.title} ${f.description} ${f.user_name}`.toLowerCase().includes(filter.q.toLowerCase()))) return false;
      return true;
    });
  }, [feedback, filter]);

  const openDetail = (f) => { setSelected(f); setDraft({ status: f.status, priority: f.priority, assigned_to: f.assigned_to || '', admin_response: f.admin_response || '', admin_note: f.admin_note || '' }); };

  const saveDetail = async () => {
    try {
      const updated = await base44.entities.Feedback.update(selected.id, draft);
      setFeedback((p) => p.map((f) => (f.id === selected.id ? updated : f)));
      setSelected(updated);
      toast({ title: 'Feedback updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const updateFeature = async (id, fields) => {
    try {
      const updated = await base44.entities.FeatureRequest.update(id, fields);
      setFeatures((p) => p.map((f) => (f.id === id ? updated : f)));
      toast({ title: 'Feature updated' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const toggleAlpha = async (u) => {
    try {
      const updated = await base44.entities.User.update(u.id, { is_alpha_tester: !u.is_alpha_tester });
      setUsers((p) => p.map((x) => (x.id === u.id ? { ...x, is_alpha_tester: !u.is_alpha_tester } : x)));
      toast({ title: `${u.display_name || u.email} ${!u.is_alpha_tester ? 'is now an alpha tester' : 'removed from alpha'}` });
    } catch {
      toast({ title: 'Failed to update user', variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>;

  const TabBtn = ({ k, icon: Icon, label }) => (
    <button onClick={() => setSub(k)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${sub === k ? 'bg-primary text-primary-foreground' : 'bg-card/60 border border-border text-muted-foreground hover:text-foreground'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
        <TabBtn k="feedback" icon={MessageSquare} label="Feedback" />
        <TabBtn k="features" icon={Lightbulb} label="Feature Requests" />
        <TabBtn k="alpha" icon={Sparkles} label="Alpha Testers" />
      </div>

      {sub === 'feedback' && (
        <>
          {/* Analytics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total },
              { label: 'New', value: stats.fresh },
              { label: 'Open', value: stats.open },
              { label: 'Resolved', value: stats.resolved },
              { label: 'Avg Rating', value: stats.avg },
            ].map((s) => (
              <Card key={s.label} className="p-3 bg-card/50 border-border">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold mt-0.5">{s.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4 bg-card/50 border-border">
              <p className="text-xs font-semibold mb-2">Most common feedback by category</p>
              <div className="space-y-1.5">
                {stats.byCategory.map((c) => (
                  <div key={c.c} className="flex items-center gap-2">
                    <span className="text-xs w-20 capitalize text-muted-foreground">{c.c}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: `${stats.total ? (c.n / stats.total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs w-6 text-right">{c.n}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4 bg-card/50 border-border">
              <p className="text-xs font-semibold mb-2">Page satisfaction</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-emerald-400 mb-1">Highest rated</p>
                  {stats.highest.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> : stats.highest.map((r) => (
                    <div key={r.p} className="text-xs flex justify-between"><span className="truncate text-muted-foreground">{r.p}</span><span className="text-emerald-300 ml-2">{r.avg}★</span></div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-destructive mb-1">Lowest rated</p>
                  {stats.lowest.length === 0 ? <p className="text-xs text-muted-foreground">No data</p> : stats.lowest.map((r) => (
                    <div key={r.p} className="text-xs flex justify-between"><span className="truncate text-muted-foreground">{r.p}</span><span className="text-destructive ml-2">{r.avg}★</span></div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-3 bg-card/50 border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs">
                <option value="all">All status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs">
                <option value="all">All priority</option>
                {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs">
                <option value="all">All categories</option>
                {CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={filter.alphaOnly} onChange={(e) => setFilter({ ...filter, alphaOnly: e.target.checked })} className="accent-primary" /> Alpha only
              </label>
              <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} placeholder="Search…" className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs flex-1 min-w-[120px]" />
            </div>
          </Card>

          {/* List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No feedback matches these filters.</div>
            ) : filtered.map((f) => (
              <button key={f.id} onClick={() => openDetail(f)} className="w-full text-left rounded-xl border border-border bg-card/40 hover:border-primary/40 p-3 transition-all">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[f.status] || ''}`}>{f.status}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[f.priority] || ''}`}>{f.priority}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground capitalize">{f.category}</span>
                  {f.is_alpha_tester && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />Alpha</span>}
                  {f.rating ? <span className="text-[10px] text-amber-400 flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-current" />{f.rating}</span> : null}
                </div>
                <p className="font-medium text-sm mt-1.5 truncate">{f.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{f.description}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground/70">
                  <span>{f.user_name || 'Unknown'}</span>
                  <span className="truncate">{f.page_path}</span>
                  <span>{f.browser}/{f.device_type}</span>
                  <span>{fmtDate(f.created_date)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {sub === 'features' && (
        <div className="space-y-2">
          {features.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">No feature requests yet.</div> : features.map((fr) => (
            <Card key={fr.id} className="p-3 bg-card/40 border-border">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{fr.title} <span className="text-xs text-muted-foreground">· {voteCounts[fr.id] || 0} votes</span></p>
                  {fr.description && <p className="text-xs text-muted-foreground line-clamp-1">{fr.description}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <select value={fr.status} onChange={(e) => updateFeature(fr.id, { status: e.target.value })} className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={fr.roadmap_stage} onChange={(e) => updateFeature(fr.id, { roadmap_stage: e.target.value })} className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs capitalize">
                    {['none', 'coming_soon', 'in_development', 'recently_released'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <select value={fr.priority} onChange={(e) => updateFeature(fr.id, { priority: e.target.value })} className="h-8 rounded-lg border border-border bg-secondary/30 px-2 text-xs capitalize">
                    {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {sub === 'alpha' && (
        <div className="space-y-2">
          <Card className="p-3 bg-card/50 border-border text-xs text-muted-foreground">
            Alpha testers get a badge, and their feedback is prioritized and filterable. Toggle a user below to designate them.
          </Card>
          {users.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">No users found.</div> : users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent grid place-items-center font-bold text-sm shrink-0">{(u.display_name || u.email || '?')[0].toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{u.display_name || u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email} · {u.role}</p>
              </div>
              {u.is_alpha_tester && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />Alpha</span>}
              <Button size="sm" variant={u.is_alpha_tester ? 'outline' : 'default'} className="rounded-full h-8" onClick={() => toggleAlpha(u)}>
                {u.is_alpha_tester ? 'Remove' : 'Mark alpha'}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base">{selected.title}</DialogTitle>
                <DialogDescription className="capitalize">{selected.category} · {selected.page_path}</DialogDescription>
              </DialogHeader>

              {selected.screenshot_url && (
                <a href={selected.screenshot_url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-border">
                  {selected.screenshot_url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={selected.screenshot_url} controls className="w-full max-h-48 object-contain bg-black" />
                  ) : (
                    <img src={selected.screenshot_url} alt="Screenshot" className="w-full max-h-64 object-contain bg-secondary/30" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                  )}
                  <div className="hidden w-full h-32 items-center justify-center text-muted-foreground text-xs gap-2"><ImageOff className="w-4 h-4" /> Preview unavailable</div>
                </a>
              )}

              <p className="text-sm whitespace-pre-wrap bg-secondary/20 rounded-xl p-3 border border-border/50">{selected.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['User', selected.user_name],
                  ['User type', selected.user_type],
                  ['Alpha tester', selected.is_alpha_tester ? 'Yes' : 'No'],
                  ['Rating', selected.rating ? `${selected.rating}/5` : '—'],
                  ['Browser', selected.browser],
                  ['Device', selected.device_type],
                  ['OS', selected.os],
                  ['App version', selected.app_version],
                  ['Session', selected.session_id],
                  ['Submitted', fmtDate(selected.created_date)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-secondary/20 border border-border/50 px-2.5 py-1.5">
                    <span className="text-muted-foreground">{k}: </span><span className="font-medium truncate">{v || '—'}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Status</label>
                  <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-2 text-sm capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Priority</label>
                  <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-2 text-sm capitalize">
                    {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Assign to</label>
                <input value={draft.assigned_to} onChange={(e) => setDraft({ ...draft, assigned_to: e.target.value })} placeholder="Admin name" className="w-full h-9 rounded-lg border border-border bg-secondary/30 px-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Response to user</label>
                <textarea value={draft.admin_response} onChange={(e) => setDraft({ ...draft, admin_response: e.target.value })} rows={2} placeholder="Shown to the user" className="w-full rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-sm resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Internal note</label>
                <textarea value={draft.admin_note} onChange={(e) => setDraft({ ...draft, admin_note: e.target.value })} rows={2} placeholder="Visible to admins only" className="w-full rounded-lg border border-border bg-secondary/30 px-2 py-1.5 text-sm resize-none" />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="rounded-full flex-1" onClick={() => setSelected(null)}>Close</Button>
                <Button className="rounded-full flex-1" onClick={saveDetail}><Check className="w-4 h-4" /> Save changes</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}