import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Loader2, Compass, Target, Users, Zap, Gamepad2, RefreshCw } from 'lucide-react';
import { getTheme } from './themeConfig';
import { cn } from '@/lib/utils';

const DIMENSIONS = [
  { key: 'completion_style', label: 'Completion Style', icon: Target, options: ['Completionist', 'Main Story Focus', 'Side Quest Explorer', 'Casual', 'Hardcore 100%', 'Story Skipper'] },
  { key: 'competitive_level', label: 'Competitive Level', icon: Zap, options: ['Casual', 'Recreational', 'Competitive', 'Ranked Grinder', 'Esports Hopeful'] },
  { key: 'multiplayer_preference', label: 'Multiplayer', icon: Users, options: ['Solo Only', 'Co-op', 'Team Player', 'Versus', 'Mixed'] },
];

export default function IdentityCard({ user, isOwn, onUpdate }) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const theme = getTheme(user?.profile_theme);

  const generate = async () => {
    setGenerating(true);
    try {
      const prompt = `You are a gaming identity analyst. Based on this gamer's profile, generate a personalized Gaming Identity Card.

Profile data:
- Display name: ${user?.display_name || 'Unknown'}
- Favorite genres: ${(user?.favorite_genres || []).join(', ') || 'none'}
- Favorite games: ${(user?.favorite_games || []).join(', ') || 'none'}
- Favorite franchises: ${(user?.favorite_franchises || []).join(', ') || 'none'}
- Platforms owned: ${(user?.platforms_owned || []).join(', ') || 'none'}
- Total games played: ${user?.total_games_played || 0}
- Total hours played: ${user?.total_hours_played || 0}
- Completion %: ${user?.completion_percentage || 0}
- Platinum trophies: ${user?.platinum_count || 0}
- Rare achievements: ${user?.rare_achievements || 0}
- Current game: ${user?.current_game || 'none'}

Return a JSON object with EXACTLY these fields:
{
  "archetype": "A combined archetype title like 'The Completionist Explorer' or 'The Competitive Collector' (2-4 words, evocative)",
  "summary": "A 2-3 sentence evocative summary of their gamer identity, written in second person ('You are...')",
  "gaming_habits": ["3-5 short habit tags like 'Night Owl', 'Weekend Warrior', 'Speedrunner', 'Lore Digger', 'Co-op Lover']"
}`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            archetype: { type: 'string' },
            summary: { type: 'string' },
            gaming_habits: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      const data = typeof res === 'string' ? JSON.parse(res) : res;
      await base44.auth.updateMe({
        identity_archetype: data.archetype,
        identity_summary: data.summary,
        gaming_habits: data.gaming_habits || [],
      });
      onUpdate?.({ ...user, identity_archetype: data.archetype, identity_summary: data.summary, gaming_habits: data.gaming_habits || [] });
      toast({ title: 'Gaming Identity generated!' });
    } catch {
      toast({ title: 'Failed to generate identity', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const hasIdentity = user?.identity_archetype || user?.gaming_personality;
  const archetype = user?.identity_archetype || user?.gaming_personality || 'Uncharted Gamer';

  return (
    <div className="relative rounded-2xl border border-border overflow-hidden">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', theme.banner)} />
      <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 60px ${theme.glow}` }} />
      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: theme.glow }}>
              <Sparkles className="w-4 h-4" style={{ color: theme.accent }} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gaming Identity Card</h3>
          </div>
          {isOwn && (
            <Button variant="ghost" size="sm" onClick={generate} disabled={generating} className="rounded-full text-xs">
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasIdentity ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {hasIdentity ? 'Regenerate' : 'Generate'}
            </Button>
          )}
        </div>

        <div className="text-center py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Your Archetype</p>
          <h2 className="text-2xl md:text-3xl font-bold font-heading" style={{ color: theme.accent }}>{archetype}</h2>
          {user?.identity_summary && (
            <p className="text-sm text-foreground/80 mt-3 max-w-md mx-auto leading-relaxed">{user.identity_summary}</p>
          )}
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
          {DIMENSIONS.map((d) => {
            const val = user?.[d.key];
            return (
              <div key={d.key} className="rounded-xl bg-black/20 border border-border/40 p-3 text-center">
                <d.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: theme.accent }} />
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{d.label}</p>
                <p className="text-sm font-semibold mt-0.5">{val || '—'}</p>
              </div>
            );
          })}
        </div>

        {/* Favorite genres + habits */}
        <div className="mt-4 space-y-3">
          {user?.favorite_genres?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1.5"><Gamepad2 className="w-3 h-3" /> Favorite Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {user.favorite_genres.map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{ borderColor: theme.accent + '50', color: theme.accent, background: theme.accent + '15' }}>{g}</span>
                ))}
              </div>
            </div>
          )}
          {user?.gaming_habits?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1.5"><Compass className="w-3 h-3" /> Gaming Habits</p>
              <div className="flex flex-wrap gap-1.5">
                {user.gaming_habits.map((h) => (
                  <span key={h} className="px-2 py-0.5 rounded-full text-xs bg-secondary/60 text-foreground/80">{h}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}