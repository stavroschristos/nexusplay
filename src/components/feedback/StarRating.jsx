import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({ value = 0, onChange, size = 'w-6 h-6', readOnly = false }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Experience rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        const Component = readOnly ? 'span' : 'button';
        return (
          <Component
            key={n}
            type={readOnly ? undefined : 'button'}
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={cn(
              'transition-transform',
              !readOnly && 'hover:scale-110 cursor-pointer',
              readOnly && 'cursor-default'
            )}
          >
            <Star
              className={cn(size, active ? 'text-amber-400' : 'text-muted-foreground/40')}
              fill={active ? 'currentColor' : 'none'}
              strokeWidth={active ? 1.5 : 2}
            />
          </Component>
        );
      })}
    </div>
  );
}