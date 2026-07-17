import { cn } from '@/lib/utils';

export function SkeletonCard({ className }) {
  return <div className={cn('skeleton rounded-2xl', className)} />;
}

export function SkeletonText({ className }) {
  return <div className={cn('skeleton rounded-md h-4', className)} />;
}

export function SkeletonAvatar({ className }) {
  return <div className={cn('skeleton rounded-full w-10 h-10', className)} />;
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <SkeletonText className="w-1/3" />
            <SkeletonText className="w-2/3 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 4, cols = 'sm:grid-cols-2' }) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-3`}>
      {[...Array(count)].map((_, i) => <SkeletonCard key={i} className="h-32" />)}
    </div>
  );
}

export function SkeletonFeed({ count = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <SkeletonAvatar />
            <div className="flex-1 space-y-2">
              <SkeletonText className="w-1/4 h-3" />
              <SkeletonText className="w-1/6 h-2.5" />
            </div>
          </div>
          <SkeletonText className="w-full mb-2" />
          <SkeletonText className="w-4/5" />
        </div>
      ))}
    </div>
  );
}