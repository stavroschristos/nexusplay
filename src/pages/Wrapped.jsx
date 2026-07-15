import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Loader2, Flame, Trophy, Clock, Gamepad2, Star, Share2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PersonalityBadge from '@/components/shared/PersonalityBadge';

export default function Wrapped() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.Achievement.filter({ created_by_id: user.id }, '-earned_date', 100),
      base44.entities.GameReview.filter({ created_by_id: user.id }, '-created_date', 100),
      base44.entities.Post.filter({ created_by_id: user.id }, '-created_date', 100),
      base44.entities.GameAccount.filter({ created_by_id: user.id }, '-created_date', 50),
    ]).then(([ach, rev, pst, acc]) => {
      setAchievements(ach); setReviews(rev); setPosts(pst); setAccounts(acc);
    }).finally(() => setLoading(false));
  }, [user]);

  const generatePersonality = async () => {
    setGenerating(true);
    try {
      const topGames = [...new Set(achievements.map((a) => a.game))].slice(0, 10);
      const genres = user?.favorite_genres || [];
      const prompt = `Based on this gamer's data, assign ONE gaming personality archetype from this list: "The Completionist", "The Explorer", "The Collector", "The Competitive Player", "The RPG Scholar", "The Horror Addict", "The Social Gamer", "The Indie Discoverer". 
Data: Favorite genres: ${genres.join(', ') || 'unknown'}. Games played: ${topGames.join(', ') || 'unknown'}. Total achievements: ${achievements.length}. Platinum trophies: ${achievements.filter(a => a.title?.toLowerCase().includes('platinum')).length}. Reviews written: ${reviews.length}. Platforms: ${(user?.platforms_owned || []).join(', ') || accounts.map(a=>a.platform).join(', ') || 'unknown'}.
Respond with ONLY the exact archetype name from the list, nothing else.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: { type: 'object', properties: { personality: { type: 'string' } } } });
      const personality = res.personality || res;
      await base44.auth.updateMe({ gaming_personality: personality });
      toast({ title: 'Personality revealed!', description: personality });
      window.location.reload();
    } catch {
      toast({ title: 'Failed to generate personality', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out my Gaming Wrapped on NEXUS! 🎮 ${(user?.total_hours_played || 0)} hours, ${achievements.length} achievements, ${(user?.total_games_played || 0)} games played.`);
    toast({ title: 'Wrapped copied to clipboard! 🎮' });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const platinumCount = achievements.filter((a) => a.title?.toLowerCase().includes('platinum') || a.rarity === 'Legendary').length;
  const topGames = [...new Set(achievements.map((a) => a.game))].slice(0, 5);
  const topGenres = user?.favorite_genres || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Flame className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">Gaming Wrapped</h1>
      </div>

      <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10 p-6 overflow-hidden relative glow">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">{new Date().getFullYear()} Gaming Wrapped</p>
          <h2 className="text-3xl font-bold font-heading mb-1">{user?.display_name || user?.full_name || 'Gamer'}</h2>
          {user?.gaming_personality ? (
            <PersonalityBadge personality={user.gaming_personality} className="mb-4" />
          ) : (
            <button onClick={generatePersonality} disabled={generating} className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Analyzing...' : 'Reveal My Personality'}
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 my-6">
            <div className="rounded-2xl bg-black/20 p-4 text-center"><Clock className="w-6 h-6 text-emerald-400 mx-auto mb-1" /><p className="text-2xl font-bold">{(user?.total_hours_played || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Hours Played</p></div>
            <div className="rounded-2xl bg-black/20 p-4 text-center"><Gamepad2 className="w-6 h-6 text-blue-400 mx-auto mb-1" /><p className="text-2xl font-bold">{user?.total_games_played || 0}</p><p className="text-xs text-muted-foreground">Games Played</p></div>
            <div className="rounded-2xl bg-black/20 p-4 text-center"><Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" /><p className="text-2xl font-bold">{achievements.length}</p><p className="text-xs text-muted-foreground">Achievements</p></div>
            <div className="rounded-2xl bg-black/20 p-4 text-center"><Star className="w-6 h-6 text-purple-400 mx-auto mb-1" /><p className="text-2xl font-bold">{platinumCount}</p><p className="text-xs text-muted-foreground">Platinum Trophies</p></div>
          </div>

          {topGames.length > 0 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Top Games</p>
              <div className="space-y-1">
                {topGames.map((g, i) => (
                  <div key={g} className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary w-5">{i + 1}</span>
                    <span className="text-sm">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topGenres.length > 0 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Favorite Genres</p>
              <div className="flex flex-wrap gap-1.5">{topGenres.map((g) => <span key={g} className="px-2 py-0.5 rounded-md bg-primary/20 text-xs text-primary">{g}</span>)}</div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">{accounts.length} platforms connected · {posts.length} posts · {reviews.length} reviews</span>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}