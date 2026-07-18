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

// Seed/demo content was authored by a non-user service account whose id can't be
// reassigned (created_by_id is immutable). Synthesize a valid public identity for
// those known seeder ids so the demo feed never shows "Unknown User" and the author
// links to a working profile instead of "User not found".
const DEMO_AUTHORS = {
  'service_064eb0fa-8c37-473c-9572-10c4e29087ca': {
    id: 'service_064eb0fa-8c37-473c-9572-10c4e29087ca',
    display_name: 'NexusPlay Community',
    gamer_tag: 'nexusplay',
    bio: 'Official NexusPlay demo content — showcasing what a vibrant gaming feed looks like during alpha.',
    role: 'user',
    avatar_url: '',
    banner_url: '',
    profile_theme: 'nebula',
    favorite_genres: [],
    favorite_games: [],
    platforms_owned: [],
    privacy_profile: 'public',
  },
};

function syntheticAuthor(id) {
  return DEMO_AUTHORS[id] ? { ...DEMO_AUTHORS[id] } : null;
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
      const sanitized = users.map(sanitize);
      Object.values(DEMO_AUTHORS).forEach((a) => sanitized.push(a));
      return Response.json({ users: sanitized });
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
      const synthetic = syntheticAuthor(id);
      if (synthetic) return Response.json({ user: synthetic });
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