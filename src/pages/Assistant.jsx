import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { SkeletonCard } from '@/components/shared/Skeleton';
import { Loader2, Sparkles, TrendingUp, Trophy, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Assistant() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const generate = async (data) => {
    setGenerating(true);
    try {
      const prompt = `You are an AI gaming assistant. Analyze this gamer's data and provide 4 personalized insights as JSON.
Gamer: ${user?.display_name || 'Player'}
Favorite games: ${(user?.favorite_games || []).join(', ') || 'none'}
Favorite genres: ${(user?.favorite_genres || []).join(', ') || 'none'}
Total games: ${user?.total_games_played || 0}, Hours: ${user?.total_hours_played || 0}
Achievements: ${data.achievementCount}, Platinum: ${user?.platinum_count || 0}
Reviews written: ${data.reviewCount}
Collections: ${data.collectionCount}
Top games played: ${data.topGames.join(', ') || 'none'}

Return JSON with this shape: { "recommendations": ["..."], "insights": ["..."], "achievements": ["..."], "social": ["..."] }
Each array has 1-2 short, friendly, specific strings. Make them feel personal and motivating.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: { type: 'array', items: { type: 'string' } },
            insights: { type: 'array', items: { type: 'string' } },
            achievements: { type: 'array', items: { type: 'string' } },
            social: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setInsights(res);
    } catch {
      setInsights({ recommendations: ['Try a new indie game this week!'], insights: ['You have great taste in games.'], achievements: ['Keep hunting those trophies!'], social: ['Connect with more gamers in communities.'] });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      base44.entities.Achievement.filter({ created_by_id: user.id }, '-earned_date', 100),
      base44.entities.GameReview.filter({ created_by_id: user.id }, '-created_date', 100),
      base44.entities.Collection.filter({ created_by_id: user.id }, '-created_date', 50),
      base44.entities.Post.filter({ created_by_id: user.id }, '-created_date', 50),
    ]).then(([ach, rev, col, pst]) => {
      const topGames = [...new Set([...ach.map((a) => a.game), ...pst.map((p) => p.game_title)].filter(Boolean))].slice(0, 10);
      const data = { achievementCount: ach.length, reviewCount: rev.length, collectionCount: col.length, topGames };
      generate(data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
        <PageHeader icon={Sparkles} title="AI Gaming Assistant" subtitle="Personalized intelligence based on your gaming history" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'recommendations', title: 'Recommended For You', icon: Sparkles, color: 'text-primary' },
    { key: 'insights', title: 'Gaming Insights', icon: TrendingUp, color: 'text-blue-400' },
    { key: 'achievements', title: 'Achievement Goals', icon: Trophy, color: 'text-amber-400' },
    { key: 'social', title: 'Social Connections', icon: Users, color: 'text-rose-400' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12 animate-fade-in">
      <PageHeader icon={Sparkles} title="AI Gaming Assistant" subtitle="Personalized intelligence based on your gaming history" />

      {generating ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing your gaming history...</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {sections.map((s) => (
            <div key={s.key} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{s.title}</h2>
              </div>
              <div className="space-y-2">
                {(insights?.[s.key] || []).map((text, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Heart className={`w-4 h-4 mt-0.5 shrink-0 ${s.color}`} />
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); window.location.reload(); }, 100); }} variant="outline" className="w-full rounded-full">
            <Sparkles className="w-4 h-4" /> Refresh Insights
          </Button>
        </div>
      )}
    </div>
  );
}