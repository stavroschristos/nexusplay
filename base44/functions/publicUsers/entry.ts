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

    // Use the service role so we can read ANY user record (built-in User RLS only
    // lets admins read other users). Sensitive fields are stripped before returning.
    if (action === 'list') {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      return Response.json({ users: users.map(sanitize) });
    }

    if (action === 'get') {
      const ids = payload?.ids;
      if (Array.isArray(ids) && ids.length > 0) {
        const found = {};
        for (const id of ids) {
          try {
            const u = await base44.asServiceRole.entities.User.get(id);
            if (u) found[id] = sanitize(u);
          } catch {
            found[id] = null;
          }
        }
        return Response.json({ users: found });
      }
      const id = payload?.id;
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      let target = null;
      try {
        target = await base44.asServiceRole.entities.User.get(id);
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