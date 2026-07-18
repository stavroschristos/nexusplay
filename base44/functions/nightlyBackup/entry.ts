import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const EXPORTABLE = [
  'User', 'Post', 'Comment', 'Community', 'Message', 'Collection', 'GameReview',
  'Feedback', 'Report', 'AnalyticsEvent', 'ErrorLog', 'Notification', 'FeatureFlag',
  'SystemStatus', 'AdminAuditLog'
];

const COUNT_LIMIT = 2000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const timestamp = new Date().toISOString();
    const counts = {};
    let total = 0;
    const errors = [];

    for (const name of EXPORTABLE) {
      try {
        const records = await base44.asServiceRole.entities[name].list('-created_date', COUNT_LIMIT);
        counts[name] = records.length;
        total += records.length;
      } catch (e) {
        counts[name] = -1;
        errors.push(`${name}: ${e.message}`);
      }
    }

    const status = errors.length === 0 ? 'success' : (errors.length < EXPORTABLE.length ? 'partial' : 'failed');
    const notes = errors.length
      ? `Capped at ${COUNT_LIMIT}/entity. Failures: ${errors.join('; ').slice(0, 900)}`
      : `Nightly snapshot complete (counts capped at ${COUNT_LIMIT}/entity).`;

    const snapshot = await base44.asServiceRole.entities.BackupSnapshot.create({
      timestamp,
      trigger: 'scheduled',
      status,
      entities: counts,
      total_records: total,
      notes
    });

    return Response.json({ ok: true, snapshot_id: snapshot.id, total_records: total, status, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});