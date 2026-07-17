import { base44 } from '@/api/base44Client';

// Append-only audit log for admin actions. Safe to fire-and-forget.
export async function logAdminAction({ action, targetType = 'other', targetId, targetLabel, details }) {
  try {
    const me = await base44.auth.me();
    await base44.entities.AdminAuditLog.create({
      admin_name: me?.display_name || me?.full_name || 'Admin',
      action,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel,
      details,
    });
  } catch {
    // Audit logging must never break the admin action itself.
  }
  return null;
}