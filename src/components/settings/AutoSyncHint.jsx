import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AutoSyncHint({ className }) {
  return (
    <p className={cn('text-xs text-muted-foreground flex items-start gap-1.5', className)}>
      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
      Connect a platform and we'll fill this in automatically later — no need to enter it by hand.
    </p>
  );
}