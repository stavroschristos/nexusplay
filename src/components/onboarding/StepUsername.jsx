import { User } from 'lucide-react';

export default function StepUsername({ value, onChange }) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground mb-4">This is how you'll appear across NexusPlay. Pick a handle that feels like you.</p>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          maxLength={32}
          placeholder="e.g. ShadowKnight"
          className="w-full rounded-xl border border-input bg-secondary/30 pl-10 pr-3 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3">{value.length}/32 · You can change this anytime in Settings.</p>
    </div>
  );
}