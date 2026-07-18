import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GitBranch, Tag, ExternalLink, Sparkles } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

export default function Changelog() {
  const [releases, setReleases] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.functions.invoke('githubReleases', {});
        if (!active) return;
        setReleases(res.data.releases || []);
      } catch (e) {
        if (!active) return;
        setError(e?.message || 'Failed to load release notes');
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <PageHeader icon={GitBranch} title="Changelog" subtitle="Latest release notes from the NexusPlay repository" />

      {error && (
        <EmptyState icon={Sparkles} title="Couldn't load release notes" description={error} />
      )}

      {!error && releases === null && (
        <div className="space-y-4">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
        </div>
      )}

      {!error && releases && releases.length === 0 && (
        <EmptyState icon={Tag} title="No releases yet" description="Release notes will appear here once a new version is published to GitHub." />
      )}

      {!error && releases && releases.length > 0 && (
        <div className="space-y-5 stagger">
          {releases.map((r) => (
            <article key={r.id} className="rounded-2xl border border-border bg-card/40 p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold px-2.5 py-1">
                  <Tag className="w-3.5 h-3.5" /> {r.tag}
                </span>
                {r.is_prerelease && (
                  <span className="rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium px-2.5 py-1">Pre-release</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {r.published_at ? format(new Date(r.published_at), 'MMM d, yyyy') : ''}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-heading font-bold">{r.name}</h2>
              {r.body ? (
                <div className="mt-3 text-sm text-muted-foreground leading-relaxed [&>*:first-child]:mt-0 [&>p]:my-2 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-base [&>h2]:text-base [&>h3]:text-sm [&>a]:text-primary [&>a]:underline [&>code]:bg-muted [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre_code]:bg-transparent [&>pre_code]:p-0">
                  <ReactMarkdown>{r.body}</ReactMarkdown>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No release notes provided.</p>
              )}
              <a href={r.html_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                View on GitHub <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}