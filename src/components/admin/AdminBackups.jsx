import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { logAdminAction } from '@/lib/admin-audit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, Database, HardDrive, Info, Clock } from 'lucide-react';

const EXPORTABLE = [
  { entity: 'User', label: 'Users', sensitive: true },
  { entity: 'Post', label: 'Posts' },
  { entity: 'Comment', label: 'Comments' },
  { entity: 'Community', label: 'Communities' },
  { entity: 'Message', label: 'Messages', sensitive: true },
  { entity: 'Collection', label: 'Collections' },
  { entity: 'GameReview', label: 'Reviews' },
  { entity: 'Feedback', label: 'Feedback' },
  { entity: 'Report', label: 'Reports' },
  { entity: 'AnalyticsEvent', label: 'Analytics' },
  { entity: 'ErrorLog', label: 'Error Logs' },
  { entity: 'Notification', label: 'Notifications' },
  { entity: 'FeatureFlag', label: 'Feature Flags' },
  { entity: 'SystemStatus', label: 'System Status' },
  { entity: 'AdminAuditLog', label: 'Audit Logs' },
];

function download(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminBackups() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const [lastBackup, setLastBackup] = useState(localStorage.getItem('np_last_backup'));
  const [snapshots, setSnapshots] = useState([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(true);

  useEffect(() => {
    base44.entities.BackupSnapshot.list('-timestamp', 10)
      .then(setSnapshots)
      .catch(() => {})
      .finally(() => setLoadingSnapshots(false));
  }, []);

  const exportEntity = async (entity, label) => {
    setBusy(entity);
    try {
      const records = await base44.entities[entity].list('-created_date', 500);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      download(`nexusplay-${entity}-${stamp}.json`, { entity, exported_at: new Date().toISOString(), count: records.length, records });
      await logAdminAction({ action: 'data_export', targetType: 'other', targetId: entity, targetLabel: label, details: `Exported ${records.length} ${label} records` });
      const now = new Date().toISOString();
      localStorage.setItem('np_last_backup', now);
      setLastBackup(now);
      toast({ title: `Exported ${records.length} ${label}` });
    } catch (e) {
      toast({ title: `Export failed: ${label}`, variant: 'destructive' });
    }
    setBusy(null);
  };

  const exportAll = async () => {
    setBusy('ALL');
    const combined = {};
    for (const e of EXPORTABLE) {
      try {
        const records = await base44.entities[e.entity].list('-created_date', 500);
        combined[e.entity] = records;
      } catch (_) { combined[e.entity] = { error: 'export failed' }; }
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    download(`nexusplay-full-backup-${stamp}.json`, { backup_at: new Date().toISOString(), entities: combined });
    const now = new Date().toISOString();
    localStorage.setItem('np_last_backup', now);
    setLastBackup(now);
    await logAdminAction({ action: 'data_backup', targetType: 'settings', targetId: 'all', targetLabel: 'Full Backup', details: 'Full platform backup exported' });
    toast({ title: 'Full backup downloaded' });
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-primary/5 border-primary/30">
        <div className="flex items-start gap-3">
          <HardDrive className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold">Backup Reminder</h3>
            <p className="text-xs text-muted-foreground mt-1">Run a full backup before any major change, feature release, or schema update. Store exports in a secure, access-controlled location.</p>
            {lastBackup && <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Last manual backup: {new Date(lastBackup).toLocaleString()}</p>}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Manual exports download as JSON files. Restores are performed by importing the JSON into the matching entity via the import tool.</p>
        <Button size="sm" onClick={exportAll} disabled={busy !== null}>
          {busy === 'ALL' ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Database className="w-4 h-4" />}
          Full Backup
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {EXPORTABLE.map((e) => (
          <Card key={e.entity} className="p-3 bg-card/50 border-border flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-2">{e.label}{e.sensitive && <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-400 border-amber-500/30">PII</Badge>}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{e.entity}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => exportEntity(e.entity, e.label)} disabled={busy !== null}>
              {busy === e.entity ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Scheduled Backup History</h3>
        {loadingSnapshots ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : snapshots.length === 0 ? (
          <p className="text-xs text-muted-foreground">No automated snapshots yet. The nightly workflow runs at 3:00 AM ET.</p>
        ) : (
          <div className="space-y-1.5">
            {snapshots.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{new Date(s.timestamp).toLocaleString()}</span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className={s.status === 'success' ? 'text-emerald-400 border-emerald-500/30' : s.status === 'partial' ? 'text-amber-400 border-amber-500/30' : 'text-red-400 border-red-500/30'}>{s.status}</Badge>
                  <span className="font-mono text-muted-foreground">{s.total_records || 0} records</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> How Backups &amp; Restores Work</h3>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
          <li><strong>Manual backup:</strong> Click "Full Backup" or export individual entities above. Each downloads a JSON snapshot.</li>
          <li><strong>Scheduled backups:</strong> The <strong>Nightly Backup</strong> workflow runs automatically at 3:00 AM ET, snapshotting record counts for all entities into the history above. Full data exports are still done manually below.</li>
          <li><strong>Restore:</strong> Use the platform's CSV/JSON import tool to load a backup file back into the matching entity. Restores append records (they do not overwrite by id) — use after clearing a target collection for true replacement.</li>
          <li><strong>PII caution:</strong> User and Message exports contain private data. Treat backups as sensitive and store them under access control.</li>
        </ul>
      </Card>
    </div>
  );
}