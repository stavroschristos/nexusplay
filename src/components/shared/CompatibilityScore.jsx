import { cn } from '@/lib/utils';

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

export function calculateCompatibility(userA, userB) {
  if (!userA || !userB) return 0;
  let score = 50;
  const gamesA = new Set(userA.favorite_games || []);
  const gamesB = new Set(userB.favorite_games || []);
  const sharedGames = [...gamesA].filter((g) => gamesB.has(g)).length;
  score += sharedGames * 8;
  const genresA = new Set(userA.favorite_genres || []);
  const genresB = new Set(userB.favorite_genres || []);
  const sharedGenres = [...genresA].filter((g) => genresB.has(g)).length;
  score += sharedGenres * 5;
  const franchisesA = new Set(userA.favorite_franchises || []);
  const franchisesB = new Set(userB.favorite_franchises || []);
  const sharedFranchises = [...franchisesA].filter((f) => franchisesB.has(f)).length;
  score += sharedFranchises * 4;
  const platformsA = new Set(userA.platforms_owned || []);
  const platformsB = new Set(userB.platforms_owned || []);
  const sharedPlatforms = [...platformsA].filter((p) => platformsB.has(p)).length;
  score += sharedPlatforms * 2;
  return Math.min(99, score);
}