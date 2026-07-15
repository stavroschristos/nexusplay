import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const personalities = {
  'The Completionist': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  'The Explorer': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  'The Collector': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  'The Competitive Player': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  'The RPG Scholar': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  'The Horror Addict': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  'The Social Gamer': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  'The Indie Discoverer': { color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
};

export function getPersonalityConfig(p) {
  return personalities[p] || { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' };
}

export default function PersonalityBadge({ personality, className }) {
  if (!personality) return null;
  const config = getPersonalityConfig(personality);
  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium', config.bg, config.border, config.color, className)}>
      <Sparkles className="w-4 h-4" />
      {personality}
    </div>
  );
}