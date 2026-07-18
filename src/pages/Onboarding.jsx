import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Gamepad2, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepPlatforms from '@/components/onboarding/StepPlatforms';
import StepGenres from '@/components/onboarding/StepGenres';
import StepGames from '@/components/onboarding/StepGames';
import StepConnect from '@/components/onboarding/StepConnect';
import StepGenerate from '@/components/onboarding/StepGenerate';
import StepRecommend from '@/components/onboarding/StepRecommend';
import { trackJourney } from '@/lib/journey';
import { markRegistered } from '@/lib/invites';

const STEP_META = [
  { title: 'Welcome', desc: 'Let\'s get started' },
  { title: 'Your platforms', desc: 'Where do you play?' },
  { title: 'Your genres', desc: 'Pick at least 2' },
  { title: 'Your games', desc: 'What do you love?' },
  { title: 'Connect accounts', desc: 'Optional — link, don\'t replace' },
  { title: 'Your identity', desc: 'Generating…' },
  { title: 'Recommendations', desc: 'Tuned to your taste' },
];

// Steps a user can skip without being blocked from the platform (non-critical).
const SKIPPABLE = new Set([1, 2, 3, 4, 5]);

// Derive the first incomplete step from already-saved profile data so returning
// users resume exactly where they left off.
function computeResumeStep(u) {
  if (!u) return 1;
  if (!u.platforms_owned?.length) return 1;
  if (!u.favorite_genres?.length || u.favorite_genres.length < 2) return 2;
  if (!u.favorite_games?.length) return 3;
  if (!u.gaming_personality) return 5; // skip optional connect step on resume
  return 6;
}

export default function Onboarding() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [platforms, setPlatforms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [games, setGames] = useState([]);
  const [accounts, setAccounts] = useState([{ platform: 'PlayStation', username: '' }]);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    // Hydrate any previously-saved selections so users resume where they left off.
    if (user) {
      setPlatforms(user.platforms_owned || []);
      setGenres(user.favorite_genres || []);
      setGames(user.favorite_games || []);
      if (user.onboarding_started && !user.has_onboarded) {
        setStep(computeResumeStep(user));
      }
    }
    trackJourney('onboarding_started');
    base44.auth.updateMe({ onboarding_started: true, signup_at: user?.signup_at || new Date().toISOString() }).catch(() => {});
  }, []);

  const toggleArr = (setter) => (v) => setter((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const canProceed = [
    true,
    platforms.length > 0,
    genres.length >= 2,
    games.length > 0,
    true,
    !!profile,
    true,
  ][step];

  // Persist partial progress so a returning user never loses their place.
  const saveProgress = async () => {
    try {
      await base44.auth.updateMe({
        platforms_owned: platforms,
        favorite_genres: genres,
        favorite_games: games,
      });
    } catch { /* ignore — progress is best-effort */ }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        platforms_owned: platforms,
        favorite_genres: genres,
        favorite_games: games,
        gaming_personality: profile?.personality || '',
        identity_archetype: profile?.archetype || '',
        identity_summary: profile?.summary || '',
        has_onboarded: true,
      });
      for (const acc of accounts) {
        if (acc.username.trim()) await base44.entities.GameAccount.create({ platform: acc.platform, username: acc.username.trim(), level: 0 });
      }
      trackJourney('platforms_selected', { count: platforms.length });
      trackJourney('favorite_games_selected', { count: games.length });
      trackJourney('accounts_connected', { count: accounts.filter((a) => a.username.trim()).length });
      trackJourney('onboarding_completed');
      try {
        const code = localStorage.getItem('nexus_invite_code');
        if (code) await markRegistered(code, user?.id, user?.display_name || user?.full_name);
        localStorage.removeItem('nexus_invite_code');
      } catch { /* ignore */ }
      await checkUserAuth();
      toast({ title: 'Welcome to NexusPlay! 🎮', description: 'Your gaming identity is ready — now connect your platforms.' });
      setCelebrating(true);
    } catch (e) {
      toast({ title: 'Something went wrong', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const stepContent = () => {
    switch (step) {
      case 0: return <StepWelcome name={user?.display_name || user?.full_name} />;
      case 1: return <StepPlatforms value={platforms} toggle={toggleArr(setPlatforms)} />;
      case 2: return <StepGenres value={genres} toggle={toggleArr(setGenres)} />;
      case 3: return <StepGames value={games} toggle={toggleArr(setGames)} addCustom={(t) => setGames((p) => [...p, t])} />;
      case 4: return <StepConnect accounts={accounts} setAccounts={setAccounts} />;
      case 5: return <StepGenerate selections={{ platforms, genres, games }} profile={profile} onGenerated={setProfile} />;
      case 6: return <StepRecommend genres={genres} games={games} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/40 via-background to-background" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[40vh] bg-[radial-gradient(ellipse_at_center,hsl(271_81%_56%/0.16),transparent_60%)]" />

      <div className="max-w-lg w-full">
        <div className="flex items-center justify-center gap-2 mb-7">
          <div className="w-9 h-9 rounded-xl bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
          <span className="font-heading font-bold text-xl">NexusPlay</span>
        </div>

        <div className="flex gap-1.5 mb-5">
          {STEP_META.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-md p-6 shadow-2xl">
          <div className="mb-5">
            <p className="text-xs text-muted-foreground">Step {step + 1} of {STEP_META.length}</p>
            <h2 className="text-xl font-heading font-bold mt-0.5">{STEP_META[step].title}</h2>
            <p className="text-sm text-muted-foreground">{STEP_META[step].desc}</p>
          </div>
          <div key={step} className="animate-slide-up min-h-[220px]">{stepContent()}</div>
          <div className="flex gap-2 mt-6">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full">Back</Button>}
            {step < STEP_META.length - 1 ? (
              <>
                {SKIPPABLE.has(step) && (
                  <Button variant="ghost" onClick={() => { saveProgress(); setStep(step + 1); }} className="rounded-full text-muted-foreground">
                    Skip
                  </Button>
                )}
                <Button onClick={() => { saveProgress(); setStep(step + 1); }} disabled={!canProceed} className="flex-1 rounded-full">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={finish} disabled={saving} className="flex-1 rounded-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Enter NexusPlay
              </Button>
            )}
          </div>
        </div>
      </div>

      {celebrating && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full text-center rounded-3xl border border-primary/30 bg-card/80 backdrop-blur-md p-8 shadow-2xl animate-scale-in">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-heading font-bold">Your gaming identity is complete.</h2>
            <p className="text-sm text-muted-foreground mt-2">You've unlocked your profile badge, XP, and recommendations tuned to your taste. Now link your platforms to bring your history together.</p>
            <div className="grid grid-cols-3 gap-2 mt-5 text-xs">
              <div className="rounded-xl border border-border bg-card/50 p-3"><div className="text-lg">🏆</div>Profile badge</div>
              <div className="rounded-xl border border-border bg-card/50 p-3"><div className="text-lg">⚡</div>XP earned</div>
              <div className="rounded-xl border border-border bg-card/50 p-3"><div className="text-lg">🤝</div>Gamers to meet</div>
            </div>
            <Button onClick={() => navigate('/home')} size="lg" className="w-full mt-6 rounded-full">
              <Check className="w-4 h-4" /> Enter NexusPlay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}