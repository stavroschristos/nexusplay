import { Crown } from 'lucide-react';

export default function FounderBadge({ size = 'sm' }) {
  const cls = size === 'lg'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[10px] px-2 py-0.5 gap-1';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 text-amber-300 border border-amber-500/40 ${cls}`}>
      <Crown className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      Founder
    </span>
  );
}