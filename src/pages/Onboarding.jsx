import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Gamepad2, Trophy, Users, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const identities = [
  { key: 'The Completionist', desc: 'I hunt every trophy and 100% my games.', icon: Trophy },
  { key: 'The Explorer', desc: 'I love discovering worlds and secrets.', icon: Sparkles },
  { key: 'The Competitor', desc: 'I play to win and climb the ranks.', icon: Gamepad2 },
  { key: 'The Story Lover', desc: 'I play for narrative and characters.', icon: Users },
];

const genres = ['RPG', 'Action', 'Adventure', 'Shooter', 'Strategy', 'Horror', 'Racing', 'Sports', 'Fighting', 'Puzzle', 'Roguelike', 'Indie', 'MMO', 'Sandbox'];
const platforms = ['PlayStation 5', 'Xbox Series X', 'PC', 'Nintendo Switch', 'Mobile'];

export default function Onboarding() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState('');
  const [favGenres, setFavGenres] = useState([]);
  const [platformsOwned, setPlatformsOwned] = useState([]);
  const [accounts, setAccounts] = useState([{ platform: 'PlayStation', username: '' }]);
  const [saving, setSaving] = useState(false);

  const toggleGenre = (g) => setFavGenres((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  const togglePlatform = (p) => setPlatformsOwned((p2) => p2.includes(p) ? p2.filter((x) => x !== p) : [...p2, p]);

  const finish = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        gaming_personality: identity,
        favorite_genres: favGenres,
        platforms_owned: platformsOwned,
        has_onboarded: true,
      });
      for (const acc of accounts) {
        if (acc.username.trim()) await base44.entities.GameAccount.create({ platform: acc.platform, username: acc.username.trim(), level: 0 });
      }
      await checkUserAuth();
      toast({ title: 'Welcome to NEXUS! 🎮' });
      navigate('/');
    } catch {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      title: 'Choose Your Gamer Identity',
      desc: 'What kind of gamer are you?',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {identities.map((id) => (
            <button key={id.key} onClick={() => setIdentity(id.key)} className={`p-4 rounded-2xl border text-left transition-all ${identity === id.key ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <id.icon className={`w-6 h-6 mb-2 ${identity === id.key ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-semibold text-sm">{id.key}</p>
              <p className="text-xs text-muted-foreground mt-1">{id.desc}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Pick Your Favorite Genres',
      desc: 'Select at least 2 to personalize your feed.',
      content: (
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${favGenres.includes(g) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}>{g}</button>
          ))}
        </div>
      ),
    },
    {
      title: 'What Do You Play On?',
      desc: 'Select your platforms.',
      content: (
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button key={p} onClick={() => togglePlatform(p)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${platformsOwned.includes(p) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}>{p}</button>
          ))}
        </div>
      ),
    },
    {
      title: 'Connect Your Accounts',
      desc: 'Link your gaming profiles (optional).',
      content: (
        <div className="space-y-3">
          {accounts.map((acc, i) => (
            <div key={i} className="flex gap-2">
              <select value={acc.platform} onChange={(e) => setAccounts((a) => a.map((x, j) => j === i ? { ...x, platform: e.target.value } : x))} className="w-32 rounded-lg border border-input bg-secondary/30 px-3 text-sm">
                {['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Riot', 'Battle.net'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input value={acc.username} onChange={(e) => setAccounts((a) => a.map((x, j) => j === i ? { ...x, username: e.target.value } : x))} placeholder="Username" className="flex-1 rounded-lg border border-input bg-secondary/30 px-3 text-sm" />
            </div>
          ))}
          <button onClick={() => setAccounts((a) => [...a, { platform: 'Steam', username: '' }])} className="text-sm text-primary hover:underline">+ Add another</button>
        </div>
      ),
    },
  ];

  const canProceed = step === 0 ? !!identity : step === 1 ? favGenres.length >= 2 : step === 2 ? platformsOwned.length > 0 : true;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
          <span className="font-heading font-bold text-2xl">NEXUS</span>
        </div>

        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />)}
        </div>

        <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6">
          <h2 className="text-xl font-bold font-heading mb-1">{steps[step].title}</h2>
          <p className="text-sm text-muted-foreground mb-5">{steps[step].desc}</p>
          <div key={step} className="animate-slide-up">{steps[step].content}</div>
          <div className="flex gap-2 mt-6">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full">Back</Button>}
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed} className="flex-1 rounded-full">Continue <ArrowRight className="w-4 h-4" /></Button>
            ) : (
              <Button onClick={finish} disabled={saving} className="flex-1 rounded-full">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Enter NEXUS</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}