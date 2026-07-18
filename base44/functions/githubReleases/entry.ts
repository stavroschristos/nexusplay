import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const REPO = 'stavroschristos/nexusplay';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=10`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'NexusPlay-Changelog',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ error: `GitHub API error: ${res.status}`, detail: text }, { status: res.status });
    }

    const data = await res.json();
    const releases = (data || []).map((r) => ({
      id: r.id,
      tag: r.tag_name,
      name: r.name || r.tag_name,
      published_at: r.published_at,
      html_url: r.html_url,
      body: r.body || '',
      is_prerelease: r.is_prerelease,
    }));

    return Response.json({ releases });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});