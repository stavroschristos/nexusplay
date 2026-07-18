import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Gamepad2, Activity, CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react';

const STATUS_META = {
  operational: { label: 'Operational', icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'border-emerald-500/30' },
  degraded: { label: 'Degraded Performance', icon: AlertTriangle, color: 'text-amber-400', dot: 'bg-amber-400', ring: 'border-amber-500/30' },
  partial_outage: { label: 'Partial Outage', icon: AlertTriangle, color: 'text-orange-400', dot: 'bg-orange-400', ring: 'border-orange-500/30' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-blue-400', dot: 'bg-blue-400', ring: 'border-blue-500/30' },
  offline: { label: 'Offline', icon: XCircle, color: 'text-rose-400', dot: 'bg-rose-400', ring: 'border-rose-500/30' },
};

export default function Status() {
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      base44.entities.SystemStatus.list('order', 100),
      base44.entities.AppAnnouncement.filter({ active: true, type: 'maintenance' }),
    ]).then(([s, i]) => {
      if (s.status === 'fulfilled') setServices(s.value);
      if (i.status === 'fulfilled') setIncidents(i.value);
      setLoading(false);
    });
  }, []);

  const overall = services.length === 0 || services.every((s) => s.status === 'operational')
    ? 'operational'
    : services.some((s) => s.status === 'offline' || s.status === 'partial_outage')
      ? 'partial_outage'
      : 'degraded';
  const Overall = STATUS_META[overall];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-12 pb-20 animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-2 font-heading font-bold text-lg mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
          NexusPlay
        </Link>

        <h1 className="text-3xl font-bold font-heading">System Status</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time operational status for NexusPlay services.</p>

        <div className={`mt-6 rounded-2xl border p-5 flex items-center gap-4 ${Overall.ring} bg-card/40`}>
          {loading ? (
            <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          ) : (
            <div className={`w-10 h-10 rounded-full grid place-items-center ${Overall.dot} bg-opacity-20`}>
              <Overall.icon className={`w-6 h-6 ${Overall.color}`} />
            </div>
          )}
          <div>
            <p className="text-lg font-semibold">{loading ? 'Checking status…' : overall === 'operational' ? 'All systems operational' : 'Some systems affected'}</p>
            <p className="text-xs text-muted-foreground">Updated {new Date().toLocaleString()}</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Services</h2>
        <div className="space-y-2">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl skeleton" />
          ))}
          {!loading && services.length === 0 && (
            <p className="text-sm text-muted-foreground">No status data available yet. Check back soon.</p>
          )}
          {services.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.operational;
            return (
              <div key={s.id} className={`rounded-xl border ${meta.ring} bg-card/40 p-4 flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${meta.dot} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.label}</p>
                    {s.message && <p className="text-xs text-muted-foreground truncate">{s.message}</p>}
                  </div>
                </div>
                <span className={`text-xs font-medium ${meta.color} shrink-0`}>{meta.label}</span>
              </div>
            );
          })}
        </div>

        {incidents.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-8 mb-3">Scheduled Maintenance & Incidents</h2>
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <p className="text-sm font-medium">{inc.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{inc.message}</p>
                  {inc.starts_at && <p className="text-[10px] text-muted-foreground mt-1">Starts {new Date(inc.starts_at).toLocaleString()}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground mt-10 flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Subscribe to updates via the in-app notification center. Last updated {new Date().toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
}