import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAdminAction } from '@/lib/admin-audit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SERVICES = [
  { service: 'authentication', label: 'Authentication', features: ['auth'], order: 1 },
  { service: 'database', label: 'Database', features: ['database'], order: 2 },
  { service: 'api', label: 'API', features: ['api'], order: 3 },
  { service: 'messaging', label: 'Messaging', features: ['messaging'], order: 4 },
  { service: 'notifications', label: 'Notifications', features: ['notifications'], order: 5 },
  { service: 'communities', label: 'Communities', features: ['communities'], order: 6 },
  { service: 'search', label: 'Search', features: ['search'], order: 7 },
  { service: 'gaming', label: 'Gaming Integrations', features: ['games'], order: 8 },
  { service: 'uploads', label: 'Media Uploads', features: ['upload', 'profile', 'settings'], order: 9 },
  { service: 'ai', label: 'AI Features', features: ['assistant', 'radar'], order: 10 },
  { service: 'landing', label: 'Landing Page', features: ['landing'], order: 11 },
  { service: 'admin', label: 'Admin Dashboard', features: ['admin'], order: 12 },
];

const STATUS_META = {
  operational: { label: 'Operational', icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  degraded: { label: 'Degraded', icon: AlertTriangle, color: 'text-amber-400', dot: 'bg-amber-400', ring: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  partial_outage: { label: 'Partial Outage', icon: AlertTriangle, color: 'text-orange-400', dot: 'bg-orange-400', ring: 'border-orange-500/30', bg: 'bg-orange-500/10' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-blue-400', dot: 'bg-blue-400', ring: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  offline: { label: 'Offline', icon: XCircle, color: 'text-rose-400', dot: 'bg-rose-400', ring: 'border-rose-500/30', bg: 'bg-rose-500/10' },
};

function deriveStatus(dayErrors, hourErrors) {
  if (dayErrors >= 5 || hourErrors >= 3) return 'offline';
  if (dayErrors >= 1) return 'degraded';
  return 'operational';
}

export default function AdminHealth() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        base44.entities.ErrorLog.list('-created_date', 500),
        base44.entities.SystemStatus.list('order', 100),
      ]);
      setLogs(l);
      setStatuses(s);

      // 7-day error chart
      const days = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days[key] = { date: key.slice(5), errors: 0, critical: 0 };
      }
      l.forEach((e) => {
        const key = new Date(e.created_date).toISOString().slice(0, 10);
        if (days[key]) {
          days[key].errors++;
          if (e.severity === 'critical') days[key].critical++;
        }
      });
      setChart(Object.values(days));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const seedStatuses = async (existing) => {
    const missing = SERVICES.filter((s) => !existing.find((e) => e.service === s.service));
    if (missing.length === 0) return existing;
    await Promise.all(missing.map((s) => base44.entities.SystemStatus.create({
      service: s.service, label: s.label, status: 'operational', auto: true, order: s.order, updated_at: new Date().toISOString(),
    })));
    return base44.entities.SystemStatus.list('order', 100);
  };

  useEffect(() => {
    (async () => {
      await load();
      const s = await base44.entities.SystemStatus.list('order', 100);
      const seeded = await seedStatuses(s);
      setStatuses(seeded);
    })();
  }, []);

  const setStatus = async (svc, status) => {
    const existing = statuses.find((s) => s.service === svc.service);
    const payload = { status, auto: false, updated_at: new Date().toISOString() };
    if (existing) {
      await base44.entities.SystemStatus.update(existing.id, payload);
    } else {
      await base44.entities.SystemStatus.create({ service: svc.service, label: svc.label, ...payload, order: svc.order });
    }
    await logAdminAction({ action: 'status_override', targetType: 'settings', targetId: svc.service, targetLabel: svc.label, details: `Set ${svc.label} to ${status}` });
    toast({ title: `${svc.label} → ${STATUS_META[status].label}` });
    load();
  };

  const resolveError = async (id) => {
    await base44.entities.ErrorLog.update(id, { resolved: true });
    load();
  };

  const now = Date.now();
  const hourAgo = now - 3600000;
  const dayAgo = now - 86400000;

  const serviceData = SERVICES.map((svc) => {
    const dayErrors = logs.filter((e) => svc.features.includes(e.feature) && new Date(e.created_date).getTime() > dayAgo).length;
    const hourErrors = logs.filter((e) => svc.features.includes(e.feature) && new Date(e.created_date).getTime() > hourAgo).length;
    const auto = deriveStatus(dayErrors, hourErrors);
    const override = statuses.find((s) => s.service === svc.service);
    const status = override && !override.auto ? override.status : auto;
    const lastError = logs.filter((e) => svc.features.includes(e.feature))[0];
    return { ...svc, dayErrors, hourErrors, auto, status, override, lastError };
  });

  const counts = {
    operational: serviceData.filter((s) => s.status === 'operational').length,
    degraded: serviceData.filter((s) => s.status === 'degraded').length,
    offline: serviceData.filter((s) => s.status === 'offline' || s.status === 'partial_outage').length,
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <Badge className="bg-emerald-500/15 text-emerald-400 border-0">{counts.operational} Operational</Badge>
          <Badge className="bg-amber-500/15 text-amber-400 border-0">{counts.degraded} Degraded</Badge>
          <Badge className="bg-rose-500/15 text-rose-400 border-0">{counts.offline} Affected</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {serviceData.map((svc) => {
          const meta = STATUS_META[svc.status] || STATUS_META.operational;
          return (
            <Card key={svc.service} className={`p-4 border ${meta.ring} ${meta.bg}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <meta.icon className={`w-4 h-4 ${meta.color} shrink-0`} />
                  <p className="text-sm font-medium truncate">{svc.label}</p>
                </div>
                <select
                  value={svc.status}
                  onChange={(e) => setStatus(svc, e.target.value)}
                  className="text-[10px] bg-secondary/50 border border-border rounded-md px-1.5 py-1 shrink-0"
                >
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                <span>{svc.dayErrors} errors/24h</span>
                <span>·</span>
                <span>{svc.hourErrors}/1h</span>
                {svc.override && !svc.override.auto && <Badge variant="outline" className="text-[9px] px-1 py-0">manual</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Errors over last 7 days</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 12% 18%)" />
            <XAxis dataKey="date" stroke="hsl(240 5% 58%)" fontSize={11} />
            <YAxis stroke="hsl(240 5% 58%)" fontSize={11} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'hsl(250 14% 10%)', border: '1px solid hsl(250 12% 18%)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="errors" fill="hsl(271 81% 56%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="critical" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3">Recent Failures</h3>
        {logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No errors logged. Everything looks healthy.</p>}
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
          {logs.slice(0, 25).map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 text-sm border-b border-border/50 pb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[9px] px-1 py-0">{e.severity}</Badge>
                  <span className="text-xs font-medium truncate">{e.error_type}</span>
                  <span className="text-[10px] text-muted-foreground">{e.feature} · {new Date(e.created_date).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{e.error_message}</p>
              </div>
              {!e.resolved && <button onClick={() => resolveError(e.id)} className="text-[10px] text-primary hover:underline shrink-0">Resolve</button>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}