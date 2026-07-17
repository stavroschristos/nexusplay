import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Built-in account fields that must never reach the browser for public/social reads.
const SENSITIVE_FIELDS = [
  'email',
  'full_name',
  'is_verified',
  'disabled',
  'disabled_reason',
  'force_password_reset',
  'is_service',
  'app_id',
  'collaborator_role',
  '_app_role',
];

function sanitize(user) {
  if (!user) return null;
  const copy = { ...user };
  for (const field of SENSITIVE_FIELDS) {
    delete copy[field];
  }
  return copy;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload = {};
    try {
      payload = await req.json();
    } catch {
      payload = {};
    }
    const action = payload?.action;

    if (action === 'list') {
      const users = await base44.entities.User.list();
      return Response.json({ users: users.map(sanitize) });
    }

    if (action === 'get') {
      const id = payload?.id;
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      let target = null;
      try {
        target = await base44.entities.User.get(id);
      } catch {
        target = null;
      }
      return Response.json({ user: sanitize(target) });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});