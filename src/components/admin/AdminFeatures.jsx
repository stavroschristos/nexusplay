import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, Eye, MousePointerClick } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const FEATURES = [
  { key: 'home', label: 'Home Dashboard', color: 'primary' },
  { key: 'feed', label: 'Activity Feed', color: 'chart-2' },
  { key: 'profile', label: 'Profiles', color: 'chart-3' },
  { key: 'messages', label: 'Messaging', color: 'chart-4' },
  { key: 'communities', label: 'Communities', color: 'chart-5' },
  { key: 'games', label: 'Game Pages', color: 'primary' },
  { key: 'achievements', label: 'Achievements', color: 'chart-2' },
  { key: 'explore', label: 'Discovery / Explore', color: 'chart-3' },
  { key: 'lfg', label: 'LFG', color: 'chart-4' },
  { key: 'challenges', label: 'Challenges', color: 'chart-5' },
  { key: 'radar', label: 'Gaming Radar', color: 'primary' },
  { key: 'assistant', label: 'AI Assistant', color: 'chart-2' },
  { key: 'wrapped', label: 'Gaming Wrapped', color: 'chart-3' },
  { key: 'notifications', label: 'Notifications', color: 'chart-4' },
  { key: 'settings', label: 'Settings', color: 'chart-5' },
];

export default function AdminFeatures() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const events = await base44.entities.AnalyticsEvent.list('-created_date', 2000);
        const now = Date.now();
        const weekAgo = now - 604800000;
        const dayAgo = now - 86400000;

        const views = {};
        const weekViews = {};
        const dayViews = {};
        const uniqueUsers = {};

        events.forEach(e => {
          const fk = e.feature_key || 'other';
          views[fk] = (views[fk] || 0) + 1;
          if (new Date(e.created_date).getTime() > weekAgo) weekViews[fk] = (weekViews[fk] || 0) + 1;
          if (new Date(e.created_date).getTime() > dayAgo) dayViews[fk] = (dayViews[fk] || 0) + 1;
          if (e.event_name === 'page_view') {
            uniqueUsers[fk] = uniqueUsers[fk] || new Set();
            uniqueUsers[fk].add(e.created_by_id);
          }
        });

        const totalViews = Object.values(views).reduce((a, b) => a + b, 0);
        const features = FEATURES.map(f => ({
          ...f,
          views: views[f.key] || 0,
          weekViews: weekViews[f.key] || 0,
          dayViews: dayViews[f.key] || 0,
          uniqueUsers: uniqueUsers[f.key]?.size || 0,
        })).sort((a, b) => b.views - a.views);

        setData({ features, totalViews, totalEvents: events.length });
      } catch (e) { console.error(e); }
    })();
  }, []);

  if (!data) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  const maxViews = Math.max(...data.features.map(f => f.views), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-card/50 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Events</p><p className="text-2xl font-bold">{data.totalEvents}</p></div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center"><Eye className="w-5 h-5 text-chart-2" /></div>
            <div><p className="text-xs text-muted-foreground">Page Views</p><p className="text-2xl font-bold">{data.totalViews}</p></div>
          </div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center"><MousePointerClick className="w-5 h-5 text-chart-4" /></div>
            <div><p className="text-xs text-muted-foreground">Features Tracked</p><p className="text-2xl font-bold">{data.features.filter(f => f.views > 0).length}</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-4">Feature Usage Breakdown</h3>
        <div className="space-y-3">
          {data.features.map(f => (
            <div key={f.key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{f.label}</span>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{f.views} total</span>
                  <span>{f.weekViews} / 7d</span>
                  <span>{f.uniqueUsers} users</span>
                </div>
              </div>
              <Progress value={(f.views / maxViews) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-2">Extensibility</h3>
        <p className="text-xs text-muted-foreground">
          Future features are measured automatically. Any component calling <code className="text-primary">trackEvent()</code> or <code className="text-primary">trackPageView()</code> from <code className="text-primary">src/lib/analytics.js</code> will appear here under its <code className="text-primary">feature_key</code>.
        </p>
      </Card>
    </div>
  );
}