import { cn } from '@/lib/utils';
import { calculateCompatibility, getCompatibilityBreakdown } from '@/lib/compatibility';

export { calculateCompatibility, getCompatibilityBreakdown };

export default function CompatibilityScore({ score, size = 'md' }) {
  const sizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-28 h-28' };
  const strokeSizes = { sm: 3, md: 4, lg: 5 };
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#a855f7' : score >= 50 ? '#3b82f6' : '#64748b';
  const textSizes = { sm: 'text-xs', md: 'text-lg', lg: 'text-2xl' };

  return (
    <div className={cn('relative inline-flex items-center justify-center', sizes[size])}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeSizes[size]} />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth={strokeSizes[size]}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', textSizes[size])} style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}