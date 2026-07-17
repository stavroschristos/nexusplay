// Controlled alpha invite system: generation, resolution, lifecycle tracking.
import { base44 } from '@/api/base44Client';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateCode(len = 8) {
  let out = '';
  for (let i = 0; i < len; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export function inviteLink(code) {
  return `${window.location.origin}/invite/${code}`;
}

// Create a new invite issued by the current user.
export async function createInvite({ userId, userName, recipientEmail, source = 'user' }) {
  const code = generateCode();
  const invite = await base44.entities.Invite.create({
    code,
    inviter_id: userId,
    inviter_name: userName,
    recipient_email: recipientEmail || undefined,
    source,
    status: 'sent',
    sent_at: new Date().toISOString(),
  });
  return invite;
}

// All invites issued by a user.
export async function getMyInvites(userId, limit = 50) {
  return base44.entities.Invite.filter({ inviter_id: userId }, '-sent_at', limit);
}

// Available invites = limit minus invites already issued (any active status).
export function computeAvailable(user, issuedCount) {
  const limit = user?.invite_limit ?? 5;
  return Math.max(0, limit - issuedCount);
}

// Resolve an invite by code (best-effort; reads are open during alpha).
export async function resolveInvite(code) {
  const res = await base44.entities.Invite.filter({ code });
  return res[0] || null;
}

// Mark an invite as opened (best-effort, may fail on public/unauth context).
export async function markOpened(code) {
  const invite = await resolveInvite(code);
  if (!invite || invite.status !== 'sent') return;
  try {
    await base44.entities.Invite.update(invite.id, { status: 'opened', opened_at: new Date().toISOString() });
  } catch { /* ignore */ }
}

// Mark an invite as registered by the new user.
export async function markRegistered(code, recipientId, recipientName) {
  const invite = await resolveInvite(code);
  if (!invite) return;
  const patch = { recipient_id: recipientId, recipient_name: recipientName, registered_at: new Date().toISOString() };
  if (invite.status === 'sent' || invite.status === 'opened') patch.status = 'registered';
  if (!invite.opened_at) patch.opened_at = new Date().toISOString();
  try {
    await base44.entities.Invite.update(invite.id, patch);
  } catch { /* ignore */ }
}

// Mark an invite as activated (inviter identified by id).
export async function markInviteActivated(inviterId) {
  // Find invites from this inviter whose recipient activated; promote to activated.
  const invites = await base44.entities.Invite.filter({ inviter_id: inviterId, status: 'registered' });
  await Promise.all(invites.map((i) =>
    base44.entities.Invite.update(i.id, { status: 'activated', activated_at: new Date().toISOString() }).catch(() => {})
  ));
}

// Admin: all invites.
export async function getAllInvites(limit = 200) {
  return base44.entities.Invite.list('-sent_at', limit);
}

// Admin: disable a code.
export async function disableInvite(id) {
  return base44.entities.Invite.update(id, { status: 'disabled' });
}

// Admin: create a code on behalf of the platform.
export async function createAdminCode(note = '') {
  const code = generateCode();
  return base44.entities.Invite.create({
    code,
    inviter_id: 'platform',
    inviter_name: 'NexusPlay',
    source: 'admin',
    status: 'sent',
    sent_at: new Date().toISOString(),
    note,
  });
}

// Admin: set a user's invite limit.
export async function setInviteLimit(userId, limit) {
  return base44.asServiceRole.entities.User.update(userId, { invite_limit: limit });
}