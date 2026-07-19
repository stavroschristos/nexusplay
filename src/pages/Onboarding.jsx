import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Gamepad2, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepUsername from '@/components/onboarding/StepUsername';
import StepAvatar from '@/components/onboarding/StepAvatar';
import StepBanner from '@/components/onboarding/StepBanner';
import StepGames from '@/components/onboarding/StepGames';
import StepGenres from '@/components/onboarding/StepGenres';
import StepBio from '@/components/onboarding/StepBio';
import StepPersonality from '@/components/onboarding/StepPersonality';
import StepConnect from '@/components/onboarding/StepConnect';
import StepGenerate from '@/components/onboarding/StepGenerate';
import { trackJourney } from '@/lib/journey';
import { markRegistered } from '@/lib/invites';

const STEP_META = [
  { title: 'Welcome', desc: "Let's build your identity" },
  { title: 'Your username', desc: 'Choose your handle' },
  { title: 'Profile picture', desc: 'Optional — add later' },
  { title: 'Profile banner', desc: 'Optional — set the vibe' },
  { title: 'Your games', desc: 'What do you love?' },
  { title: 'Your genres', desc: 'Pick at least 2' },
  { title: 'Your bio', desc: 'Optional — tell your story' },
  { title: 'Your personality', desc: 'What kind of gamer are you?' },
  { title: 'Connect platforms', desc: 'Optional — link, don\'t replace' },
  { title: 'Your identity', desc: 'Generating…' },
];

// Steps a user can skip without being blocked (non-critical).
const SKIPPABLE = new Set([2, 3, 6, 8]);

// Resume at the first incomplete REQUIRED step; optionals are skipped over.
function computeResumeStep(u) {
  if (!u) return 1;
  if (!u.display_name?.trim()) return 1;
  if (!u.favorite_games?.length) return 4;
  if (!u.favorite_genres?.length || u.favorite_genres.length < 2) return 5;
  if (!u.gaming_personality) return 7;
  return 9;
}

export default function Onboarding() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [games, setGames] = useState([]);
  const [bio, setBio] = useState('');
  const [personality, setPersonality] = useState('');
  const [accounts, setAccounts] = useState([{ platform: 'PlayStation', username: '' }]);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.display_name || '');
      setAvatarUrl(user.avatar_url || '');
      setBannerUrl(user.banner_url || '');
      setPlatforms(user.platforms_owned || []);
      setGenres(user.favorite_genres || []);
      setGames(user.favorite_games || []);
      setBio(user.bio || '');
      setPersonality(user.gaming_personality || '');
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
    username.trim().length > 0,
    true,
    true,
    games.length > 0,
    genres.length >= 2,
    true,
    !!personality,
    true,
    !!profile,
  ][step];

  // Persist accumulated identity so a returning user never loses their place.
  const saveProgress = async () => {
    try {
      await base44.auth.updateMe({
        display_name: username.trim(),
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        platforms_owned: platforms,
        favorite_genres: genres,
        favorite_games: games,
        bio,
        gaming_personality: personality,
      });
    } catch { /* ignore — progress is best-effort */ }
  };

  const next = () => { saveProgress(); setStep(step + 1); };

  const finish = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        display_name: username.trim(),
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        platforms_owned: platforms,
        favorite_genres: genres,
        favorite_games: games,
        bio,
        gaming_personality: personality,
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
      case 1: return <StepUsername value={username} onChange={setUsername} />;
      case 2: return <StepAvatar value={avatarUrl} onUpload={setAvatarUrl} />;
      case 3: return <StepBanner value={bannerUrl} onUpload={setBannerUrl} onClear={() => setBannerUrl('')} />;
      case 4: return <StepGames value={games} toggle={toggleArr(setGames)} addCustom={(t) => setGames((p) => [...p, t])} />;
      case 5: return <StepGenres value={genres} toggle={toggleArr(setGenres)} />;
      case 6: return <StepBio value={bio} onChange={setBio} />;
      case 7: return <StepPersonality value={personality} onSelect={setPersonality} />;
      case 8: return <StepConnect platforms={platforms} togglePlatform={toggleArr(setPlatforms)} accounts={accounts} setAccounts={setAccounts} />;
      case 9: return <StepGenerate selections={{ platforms, genres, games, personality }} profile={profile} onGenerated={setProfile} />;
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
                  <Button variant="ghost" onClick={next} className="rounded-full text-muted-foreground">Skip</Button>
                )}
                <Button onClick={next} disabled={!canProceed} className="flex-1 rounded-full">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={finish} disabled={saving || !profile} className="flex-1 rounded-full">
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
            <h2 className="text-2xl font-heading font-bold">Your Gaming Identity is Ready.</h2>
            <p className="text-sm text-muted-foreground mt-2">You've built your identity layer — now connect your platforms to bring your history together, and let the activity come to you.</p>
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