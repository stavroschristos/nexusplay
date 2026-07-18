import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import GameCard from '@/components/shared/GameCard';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { Search, Gamepad2 } from 'lucide-react';

export default function Games() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Game.list('-created_date', 100).then(setGames).finally(() => setLoading(false));
  }, []);

  const filtered = games.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PageHeader icon={Gamepad2} title="Games" subtitle="Discover your next favorite — tuned to your taste" />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games..." className="pl-10 rounded-full bg-card/50" aria-label="Search games" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="No games found"
          description={search ? `No games match "${search}"` : 'Games appear here once added. In the meantime, explore what the community is playing across every platform.'}
          action={!search && (
            <Link to="/explore" className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Explore Gamers</Link>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 stagger">
          {filtered.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  );
}