import { useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Share2, Trophy, Star, Flame, Gamepad2, Download } from 'lucide-react';
import PersonalityBadge from '@/components/shared/PersonalityBadge';

export default function ShareCard({ user, achievements, stats, type = 'profile' }) {
  const cardRef = useRef(null);
  const { toast } = useToast();

  const handleShare = () => {
    const text = type === 'platinum'
      ? `🎮 I just earned a Platinum Trophy! ${achievements[0]?.game || ''} — completed. #NEXUSGaming`
      : `Check out my gaming profile on NEXUS! 🎮 ${stats?.total_hours_played || 0} hours · ${stats?.total_games_played || 0} games · ${achievements?.length || 0} achievements`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Share text copied to clipboard! 📋' });
  };

  const isPlatinum = type === 'platinum';
  const ach = achievements?.[0];

  return (
    <div>
      <div ref={cardRef} className={`relative rounded-3xl overflow-hidden ${isPlatinum ? 'bg-gradient-to-br from-amber-500/20 via-card to-amber-700/10 border-amber-500/40' : 'bg-gradient-to-br from-primary/15 via-card to-accent/15 border-primary/40'} border p-6 aspect-[4/5] flex flex-col`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 blur-3xl rounded-full" />

        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest">NEXUS</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{new Date().getFullYear()}</span>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center text-center">
          {isPlatinum ? (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">Platinum Earned</p>
              <h2 className="text-2xl font-bold font-heading mb-2">{ach?.game}</h2>
              <p className="text-sm text-muted-foreground">{ach?.title}</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-3xl font-bold text-primary">
                {(user?.display_name || user?.full_name || 'G').charAt(0)}
              </div>
              {user?.gaming_personality && <PersonalityBadge personality={user.gaming_personality} className="mb-3" />}
              <h2 className="text-xl font-bold font-heading">{user?.display_name || user?.full_name || 'Gamer'}</h2>
              <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                <div><p className="text-2xl font-bold">{stats?.total_hours_played || 0}</p><p className="text-[10px] text-muted-foreground">Hours</p></div>
                <div><p className="text-2xl font-bold">{stats?.total_games_played || 0}</p><p className="text-[10px] text-muted-foreground">Games</p></div>
                <div><p className="text-2xl font-bold">{achievements?.length || 0}</p><p className="text-[10px] text-muted-foreground">Trophies</p></div>
              </div>
            </>
          )}
        </div>

        <div className="relative flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">nexus.gg/{(user?.display_name || 'gamer').toLowerCase().replace(/\s/g, '')}</span>
          <span className="text-[10px] text-muted-foreground">Join the gaming universe</span>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={handleShare} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </div>
  );
}