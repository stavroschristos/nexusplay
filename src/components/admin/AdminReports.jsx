import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAdminAction } from '@/lib/admin-audit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Calendar, Users, Shield, Gamepad2, AlertCircle, BarChart3 } from 'lucide-react';

function dayKey(ts) { return new Date(ts).toISOString().slice(0, 10); }

function download(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export default function AdminReports() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('week');

  useEffect(() => {
    (async () => {
      try {
        const [users, posts, comments, messages, communities, reports, errors, follows, gameFollows] = await Promise.all([
          base44.entities.User.list('-created_date', 1000),
          base44.entities.Post.list('-created_date', 1000),
          base44.entities.Comment.list('-created_date', 1000),
          base44.entities.Message.list('-created_date', 1000),
          base44.entities.Community.list('-members_count', 500),
          base44.entities.Report.list('-created_date', 500),
          base44.entities.ErrorLog.list('-created_date', 300),
          base44.entities.Follow.list('-created_date', 1000),
          base44.entities.GameFollow.list('-created_date', 1000),
        ]);

        const dayMs = 86400000;
        const now = Date.now();
        const span = range === 'day' ? 1 : range === 'week' ? 7 : 30;
        const start = now - span * dayMs;

        // activity series
        const series = {};
        for (let i = span; i >= 0; i--) { series[dayKey(now - i * dayMs)] = { posts: 0, comments: 0, messages: 0, users: 0 }; }
        posts.forEach((p) => { const k = dayKey(p.created_date); if (series[k]) series[k].posts++; });
        comments.forEach((c) => { const k = dayKey(c.created_date); if (series[k]) series[k].comments++; });
        messages.forEach((m) => { const k = dayKey(m.created_date); if (series[k]) series[k].messages++; });
        users.forEach((u) => { const k = dayKey(u.created_date); if (series[k]) series[k].users++; });

        const inRange = (x) => new Date(x.created_date).getTime() >= start;
        const postsByUser = {};
        posts.filter(inRange).forEach((p) => { postsByUser[p.created_by_id] = (postsByUser[p.created_by_id] || 0) + 1; });
        const topUsers = Object.entries(postsByUser).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, c]) => ({ user: users.find((u) => u.id === id), count: c }));

        const topCommunities = [...communities].sort((a, b) => (b.members_count || 0) - (a.members_count || 0)).slice(0, 10);

        const gameCount = {};
        gameFollows.forEach((g) => { gameCount[g.game_id] = (gameCount[g.game_id] || 0) + 1; });
        const topGames = Object.entries(gameCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

        const reportedByType = {};
        reports.forEach((r) => { reportedByType[r.target_type] = (reportedByType[r.target_type] || 0) + 1; });
        const topReported = Object.entries(reportedByType).sort((a, b) => b[1] - a[1]).slice(0, 10);

        const errCount = {};
        errors.forEach((e) => { errCount[e.error_type] = (errCount[e.error_type] || 0) + 1; });
        const topErrors = Object.entries(errCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

        // retention approximation: users who posted/commented in range vs total users older than span
        const activeUsers = new Set();
        [...posts, ...comments].filter(inRange).forEach((x) => activeUsers.add(x.created_by_id));
        const eligible = users.filter((u) => new Date(u.created_date).getTime() < start).length;
        const retention = eligible > 0 ? Math.round((activeUsers.size / eligible) * 100) : null;

        setData({
          totals: { posts: posts.filter(inRange).length, comments: comments.filter(inRange).length, messages: messages.filter(inRange).length, newUsers: users.filter(inRange).length, reports: reports.filter(inRange).length },
          series, topUsers, topCommunities, topGames, topReported, topErrors, retention,
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [range]);

  const exportReport = async () => {
    download(`nexusplay-report-${range}-${dayKey(Date.now())}.json`, { generated_at: new Date().toISOString(), range, ...data });
    await logAdminAction({ action: 'report_export', targetType: 'settings', targetId: range, targetLabel: `${range} report`, details: `Exported ${range} administrative report` });
    toast({ title: 'Report exported' });
  };

  if (loading || !data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-lg bg-card/50 border border-border">
          {[['day', 'Today'], ['week', 'This Week'], ['month', 'This Month']].map(([k, l]) => (
            <button key={k} onClick={() => setRange(k)} className={`px-3 py-1 rounded text-xs font-medium ${range === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{l}</button>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={exportReport}><Download className="w-4 h-4" /> Export Report</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(data.totals).map(([k, v]) => (
          <Card key={k} className="p-3 bg-card/50 border-border text-center">
            <p className="text-2xl font-bold">{v}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
          </Card>
        ))}
      </div>

      {data.retention != null && (
        <Card className="p-4 bg-card/50 border-border">
          <p className="text-sm font-semibold">Estimated Retention</p>
          <p className="text-xs text-muted-foreground">{data.retention}% of users created before this range were active in it.</p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Most Active Users</h3>
          {data.topUsers.length === 0 && <p className="text-xs text-muted-foreground">No activity in range.</p>}
          <div className="space-y-1.5">
            {data.topUsers.map(({ user, count }, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="truncate">{user?.display_name || user?.full_name || 'Unknown'}</span>
                <Badge variant="outline" className="text-[10px]">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Most Active Communities</h3>
          {data.topCommunities.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
          <div className="space-y-1.5">
            {data.topCommunities.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{c.name}</span>
                <Badge variant="outline" className="text-[10px]">{c.members_count || 0}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary" /> Most Popular Games</h3>
          {data.topGames.length === 0 && <p className="text-xs text-muted-foreground">No game follows.</p>}
          <div className="space-y-1.5">
            {data.topGames.map(([id, c]) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <span className="truncate">{id}</span>
                <Badge variant="outline" className="text-[10px]">{c} follows</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400" /> Most Reported Content</h3>
          {data.topReported.length === 0 && <p className="text-xs text-muted-foreground">No reports.</p>}
          <div className="space-y-1.5">
            {data.topReported.map(([type, c]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="truncate capitalize">{type}</span>
                <Badge variant="outline" className="text-[10px]">{c}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-400" /> Most Common Errors</h3>
          {data.topErrors.length === 0 && <p className="text-xs text-muted-foreground">No errors.</p>}
          <div className="space-y-1.5">
            {data.topErrors.map(([type, c]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="truncate font-mono text-xs">{type}</span>
                <Badge variant="outline" className="text-[10px]">{c}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Daily Activity</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
            {Object.entries(data.series).map(([date, v]) => (
              <div key={date} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{date}</span>
                <span className="flex gap-2">
                  <span>📝 {v.posts}</span><span>💬 {v.comments}</span><span>✉️ {v.messages}</span><span>👤 {v.users}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Feature Usage</h3>
        <p className="text-xs text-muted-foreground">Detailed per-feature usage lives in the <strong>Analytics</strong> tab, sourced from <code className="text-primary">AnalyticsEvent</code> records.</p>
      </Card>
    </div>
  );
}