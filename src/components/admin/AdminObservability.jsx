import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, MessageSquare, FileText, Shield, Bell, Trophy, Flag, AlertCircle, TrendingUp, Clock } from 'lucide-react';

function startOfDay(ts = Date.now()) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

export default function AdminObservability() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, posts, comments, messages, communities, reports, feedback, errors, achievements, notifications, follows, gameFollows] = await Promise.all([
          base44.entities.User.list('-created_date', 1000),
          base44.entities.Post.list('-created_date', 1000),
          base44.entities.Comment.list('-created_date', 1000),
          base44.entities.Message.list('-created_date', 1000),
          base44.entities.Community.list('-members_count', 500),
          base44.entities.Report.list('-created_date', 500),
          base44.entities.Feedback.list('-created_date', 500),
          base44.entities.ErrorLog.list('-created_date', 200),
          base44.entities.Achievement.list('-created_date', 1000),
          base44.entities.Notification.list('-created_date', 1000),
          base44.entities.Follow.list('-created_date', 1000),
          base44.entities.GameFollow.list('-created_date', 1000),
        ]);

        const dayMs = 86400000;
        const today = startOfDay();
        const weekAgo = today - 7 * dayMs;

        const newToday = users.filter((u) => new Date(u.created_date).getTime() >= today).length;
        const newWeek = users.filter((u) => new Date(u.created_date).getTime() >= weekAgo).length;
        const postsToday = posts.filter((p) => new Date(p.created_date).getTime() >= today).length;
        const commentsToday = comments.filter((c) => new Date(c.created_date).getTime() >= today).length;
        const messagesToday = messages.filter((m) => new Date(m.created_date).getTime() >= today).length;
        const notifsDelivered = notifications.length;
        const reportsPending = reports.filter((r) => r.status === 'pending').length;
        const feedbackNew = feedback.filter((f) => f.status === 'new').length;
        const openErrors = errors.filter((e) => !e.resolved && e.severity === 'error').length;
        const crashes = errors.filter((e) => e.error_type === 'react_boundary' || e.error_type === 'window_error').length;

        // Top entities
        const postCountByUser = {};
        posts.forEach((p) => { postCountByUser[p.created_by_id] = (postCountByUser[p.created_by_id] || 0) + 1; });
        const topUsers = Object.entries(postCountByUser).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const topCommunities = [...communities].sort((a, b) => (b.members_count || 0) - (a.members_count || 0)).slice(0, 5);

        const gameCount = {};
        gameFollows.forEach((g) => { gameCount[g.game_id] = (gameCount[g.game_id] || 0) + 1; });
        const topGames = Object.entries(gameCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const errTypeCount = {};
        errors.forEach((e) => { errTypeCount[e.error_type] = (errTypeCount[e.error_type] || 0) + 1; });
        const topErrors = Object.entries(errTypeCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

        // rough "online in last 15 min" from any recent activity
        const active15 = new Set();
        const cutoff = Date.now() - 15 * 60000;
        [...posts, ...messages, ...comments].forEach((x) => { if (new Date(x.created_date).getTime() > cutoff) active15.add(x.created_by_id); });

        setData({
          stats: [
            { label: 'Active (15 min)', value: active15.size, icon: Users, color: 'text-emerald-400' },
            { label: 'New Users Today', value: newToday, icon: UserPlus, color: 'text-primary' },
            { label: 'New This Week', value: newWeek, icon: UserPlus, color: 'text-chart-2' },
            { label: 'Posts Today', value: postsToday, icon: FileText, color: 'text-chart-3' },
            { label: 'Comments Today', value: commentsToday, icon: MessageSquare, color: 'text-chart-4' },
            { label: 'Messages Today', value: messagesToday, icon: MessageSquare, color: 'text-chart-5' },
            { label: 'Notifications Delivered', value: notifsDelivered, icon: Bell, color: 'text-primary' },
            { label: 'Achievements Shared', value: achievements.length, icon: Trophy, color: 'text-chart-4' },
            { label: 'Reports Pending', value: reportsPending, icon: Flag, color: 'text-amber-400' },
            { label: 'Feedback New', value: feedbackNew, icon: MessageSquare, color: 'text-chart-2' },
            { label: 'Open Errors', value: openErrors, icon: AlertCircle, color: 'text-rose-400' },
            { label: 'Recent Crashes', value: crashes, icon: AlertCircle, color: 'text-orange-400' },
          ],
          topUsers, topCommunities, topGames, topErrors,
          users, communities,
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading || !data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.stats.map((s) => (
          <Card key={s.label} className="p-4 bg-card/50 border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/40 grid place-items-center"><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Most Active Users</h3>
          {data.topUsers.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
          <div className="space-y-2">
            {data.topUsers.map(([id, count], i) => {
              const u = data.users.find((x) => x.id === id);
              return (
                <div key={id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{u?.display_name || u?.full_name || `User ${i + 1}`}</span>
                  <Badge variant="outline" className="text-[10px]">{count} posts</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Most Active Communities</h3>
          {data.topCommunities.length === 0 && <p className="text-xs text-muted-foreground">No communities yet.</p>}
          <div className="space-y-2">
            {data.topCommunities.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{c.name}</span>
                <Badge variant="outline" className="text-[10px]">{c.members_count || 0} members</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Most Followed Games</h3>
          {data.topGames.length === 0 && <p className="text-xs text-muted-foreground">No game follows yet.</p>}
          <div className="space-y-2">
            {data.topGames.map(([id, count]) => (
              <div key={id} className="flex items-center justify-between text-sm">
                <span className="truncate">{id}</span>
                <Badge variant="outline" className="text-[10px]">{count} follows</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 border-border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400" /> Most Common Errors</h3>
          {data.topErrors.length === 0 && <p className="text-xs text-muted-foreground">No errors recorded. 🎉</p>}
          <div className="space-y-2">
            {data.topErrors.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="truncate font-mono text-xs">{type}</span>
                <Badge variant="outline" className="text-[10px]">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Session Duration & Page Analytics</h3>
        <p className="text-xs text-muted-foreground">Per-session duration and most-viewed-page ranking are available under the <strong>Analytics</strong> tab, which tracks page views via <code className="text-primary">trackPageView()</code>.</p>
      </Card>
    </div>
  );
}