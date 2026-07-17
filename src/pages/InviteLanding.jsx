import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Gamepad2, Crown, Sparkles, Users, Trophy, ArrowRight, Check } from 'lucide-react';
import { markOpened } from '@/lib/invites';

const FEATURES = [
  { icon: Crown, title: 'Gaming Identity', desc: 'Your trophies, history & personality in one living profile.' },
  { icon: Users, title: 'Find Your People', desc: 'Communities, LFG, and compatibility-matched gamers.' },
  { icon: Trophy, title: 'Build Your Legacy', desc: 'Collections, top 10 lists, and milestones that tell your story.' },
];

export default function InviteLanding() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!code) return;
    try { localStorage.setItem('nexus_invite_code', code); } catch {}
    markOpened(code).catch(() => {});
    setReady(true);
  }, [code]);

  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/50 via-background to-background" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[40vh] bg-[radial-gradient(ellipse_at_center,hsl(271_81%_56%/0.18),transparent_60%)]" />
      <div className="absolute bottom-0 right-0 w-[60vw] h-[40vh] bg-[radial-gradient(ellipse_at_center,hsl(200_70%_50%/0.1),transparent_60%)]" />

      <div className="max-w-lg w-full">
        <div className="flex items-center justify-center gap-2 mb-7">
          <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center glow"><Gamepad2 className="w-6 h-6 text-primary-foreground" /></div>
          <span className="font-heading font-bold text-2xl">NexusPlay</span>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-md p-7 shadow-2xl text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-4">
            <Crown className="w-3.5 h-3.5" /> Alpha Invitation
          </div>
          <h1 className="text-2xl font-heading font-bold">You're invited to NexusPlay</h1>
          <p className="text-sm text-muted-foreground mt-2">
            You've been hand-invited to the closed alpha. Build your gaming identity, find your community, and help shape the platform before anyone else.
          </p>

          {code && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Invite code</span>
              <code className="text-sm font-mono font-semibold">{code}</code>
            </div>
          )}

          <div className="grid gap-2 my-6 text-left">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30">
                <div className="w-9 h-9 rounded-lg bg-primary/15 grid place-items-center shrink-0"><f.icon className="w-4.5 h-4.5 text-primary" /></div>
                <div><p className="text-sm font-semibold">{f.title}</p><p className="text-xs text-muted-foreground">{f.desc}</p></div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button onClick={goRegister} disabled={!ready} className="w-full h-12 rounded-full text-base">
              Create your account <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={goLogin} variant="outline" className="w-full rounded-full">
              <Check className="w-4 h-4" /> I already have an account
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-5">
            By creating an account you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> & <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}