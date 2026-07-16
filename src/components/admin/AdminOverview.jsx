import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, FileText, Heart, MessageSquare, Send, UserPlus, TrendingUp, MapPin, Activity, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

function StatCard({ icon: Icon, label, value, sublabel, color = 'primary' }) {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold font-heading leading-tight">{value}</p>
          {sublabel && <p className="text-[11px] text-muted-foreground truncate">{sublabel}</p>}
        </div>
      </div>
    </Card>
  );
}

export default function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [users, posts, comments, likes, messages, communities, events] = await Promise.all([
          base44.entities.User.list('-created_date', 500),
          base44.entities.Post.list('-created_date', 500),
          base44.entities.Comment.list('-created_date', 500),
          base44.entities.Like.list('-created_date', 500),
          base44.entities.Message.list('-created_date', 500),
          base44.entities.Community.list('-members_count', 500),
          base44.entities.AnalyticsEvent.list('-created_date', 1000),
        ]);

        const now = Date.now();
        const dayAgo = now - 86400000;
        const monthAgo = now - 2592000000;
        const weekAgo = now - 604800000;

        const newUsers = users.filter(u => new Date(u.created_date).getTime() > monthAgo);

        const dauIds = new Set(events.filter(e => new Date(e.created_date).getTime() > dayAgo).map(e => e.created_by_id));
        const mauIds = new Set(events.filter(e => new Date(e.created_date).getTime() > monthAgo).map(e => e.created_by_id));

        const activeUsersMap = {};
        events.forEach(e => { activeUsersMap[e.created_by_id] = (activeUsersMap[e.created_by_id] || 0) + 1; });
        const mostActive = Object.entries(activeUsersMap).sort((a,b) => b[1]-a[1]).slice(0, 5)
          .map(([id, count]) => ({ id, count, user: users.find(u => u.id === id) }))
          .filter(x => x.user);

        const growthMap = {};
        users.forEach(u => {
          const d = new Date(u.created_date);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
          growthMap[key] = (growthMap[key] || 0) + 1;
        });
        const growth = Object.entries(growthMap).sort().slice(-6);

        const locations = {};
        users.forEach(u => {
          const loc = u.country || 'Unknown';
          locations[loc] = (locations[loc] || 0) + 1;
        });
        const topLocations = Object.entries(locations).sort((a,b) => b[1]-a[1]).slice(0, 6);

        const topCommunities = communities.slice(0, 5);

        const shares = posts.reduce((s, p) => s + (p.reposts_count || 0), 0);

        setData({
          totalUsers: users.length,
          newUsers: newUsers.length,
          dau: dauIds.size,
          mau: mauIds.size,
          retention: mauIds.size > 0 ? Math.round((dauIds.size / mauIds.size) * 100) : 0,
          growth,
          topLocations,
          mostActive,
          content: {
            posts: posts.length,
            comments: comments.length,
            likes: likes.length,
            shares,
            messages: messages.length,
            communities: communities.length,
          },
          topCommunities,
        });
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  const maxGrowth = Math.max(...data.growth.map(g => g[1]), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-heading mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> User Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="primary" />
          <StatCard icon={UserPlus} label="New (30d)" value={data.newUsers} color="chart-2" />
          <StatCard icon={Activity} label="Daily Active" value={data.dau} color="chart-4" />
          <StatCard icon={TrendingUp} label="Monthly Active" value={data.mau} sublabel={`${data.retention}% DAU/MAU`} color="chart-5" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card className="p-4 bg-card/50 border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> User Growth</h3>
            <div className="space-y-2">
              {data.growth.map(([month, count]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20">{month}</span>
                  <div className="flex-1 h-6 rounded bg-secondary/50 overflow-hidden">
                    <div className="h-full bg-primary/60 rounded flex items-center justify-end px-1.5" style={{ width: `${(count / maxGrowth) * 100}%` }}>
                      <span className="text-[10px] font-bold text-primary-foreground">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {data.growth.length === 0 && <p className="text-xs text-muted-foreground">No growth data yet.</p>}
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> User Locations</h3>
            <div className="space-y-2">
              {data.topLocations.map(([loc, count]) => (
                <div key={loc} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{loc}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(count / data.totalUsers) * 100} className="w-20 h-2" />
                    <span className="text-xs font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-card/50 border-border mt-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-primary" /> Most Active Users</h3>
          <div className="space-y-2">
            {data.mostActive.map(({ id, count, user }) => (
              <div key={id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate">{user.display_name || user.full_name || user.email}</span>
                <span className="text-muted-foreground text-xs">{count} events</span>
              </div>
            ))}
            {data.mostActive.length === 0 && <p className="text-xs text-muted-foreground">No activity recorded yet.</p>}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-bold font-heading mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Content Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard icon={FileText} label="Total Posts" value={data.content.posts} color="primary" />
          <StatCard icon={MessageSquare} label="Comments" value={data.content.comments} color="chart-2" />
          <StatCard icon={Heart} label="Likes" value={data.content.likes} color="chart-5" />
          <StatCard icon={Send} label="Shares" value={data.content.shares} color="chart-4" />
          <StatCard icon={Send} label="Messages" value={data.content.messages} color="chart-3" />
          <StatCard icon={Users} label="Communities" value={data.content.communities} color="primary" />
        </div>

        <Card className="p-4 bg-card/50 border-border mt-4">
          <h3 className="text-sm font-semibold mb-3">Most Active Communities</h3>
          <div className="space-y-2">
            {data.topCommunities.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm py-1">
                <span className="truncate">{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.members_count || 0} members</span>
              </div>
            ))}
            {data.topCommunities.length === 0 && <p className="text-xs text-muted-foreground">No communities yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}