import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('text-center py-12 px-4 animate-fade-in', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary/70" />
        </div>
      )}
      {title && <h3 className="font-semibold text-base">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}