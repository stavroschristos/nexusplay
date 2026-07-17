import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingScreen({ label, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 gap-3', className)}>
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}