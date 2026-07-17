import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { activateFounderProfile, seedFounderContent } from '@/lib/founder';
import FounderBadge from '@/components/profile/FounderBadge';
import { Crown, Sparkles, Loader2, ExternalLink, CheckCircle2, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminFounder() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState('');
  const [contentCounts, setContentCounts] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Collection.filter({ is_demo: true }).then((r) => r.length).catch(() => 0),
      base44.entities.Post.filter({ is_demo: true }).then((r) => r.length).catch(() => 0),
      base44.entities.Achievement.filter({ is_demo: true }).then((r) => r.length).catch(() => 0),
    ]).then(([c, p, a]) => setContentCounts({ collections: c, posts: p, achievements: a }));
  }, []);

  const activate = async () => {
    setBusy('identity');
    try {
      await activateFounderProfile();
      await checkUserAuth();
      toast({ title: 'Founder profile activated 👑', description: 'Your account is now the platform founder.' });
    } catch (e) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  const seed = async () => {
    setBusy('content');
    try {
      await seedFounderContent();
      toast({ title: 'Showcase content seeded', description: 'Collections, posts, achievements, top lists & milestones added.' });
      setContentCounts(null);
    } catch (e) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setBusy(''); }
  };

  const isFounder = !!user?.is_founder;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-fuchsia-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 grid place-items-center shrink-0"><Crown className="w-7 h-7 text-amber-400" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold font-heading">Founder Showcase Profile</h2>
              {isFounder && <FounderBadge size="lg" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              The founder profile is the first example new users see. It demonstrates the full potential of a gaming identity — collections, trophies, posts, top lists, and more.
            </p>
            {isFounder ? (
              <p className="text-xs text-emerald-300 mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> This account is set as the founder.</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">Your current admin account will become the founder profile.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Founder Identity</h3>
          <p className="text-xs text-muted-foreground">Sets display name, bio, gaming quote, favorite games, genres, platforms, stats, personality, and the game shelves visitors see.</p>
          <Button onClick={activate} disabled={busy === 'identity'} className="w-full">
            {busy === 'identity' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            {isFounder ? 'Re-apply Founder Identity' : 'Activate Founder Profile'}
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-primary" /> Showcase Content</h3>
          <p className="text-xs text-muted-foreground">Seeds 6 collections, 6 achievements, 6 posts, 3 top lists & 3 milestones as demo content owned by your account.</p>
          {contentCounts && (
            <p className="text-xs text-muted-foreground">Current demo content: {contentCounts.collections} collections · {contentCounts.posts} posts · {contentCounts.achievements} achievements.</p>
          )}
          <Button onClick={seed} disabled={busy === 'content'} variant="outline" className="w-full">
            {busy === 'content' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gamepad2 className="w-4 h-4" />} Seed Showcase Content
          </Button>
        </div>
      </div>

      {isFounder && (
        <div className="text-center">
          <Button asChild variant="link"><Link to={`/profile/${user.id}`} className="flex items-center gap-1.5">View the founder profile <ExternalLink className="w-3.5 h-3.5" /></Link></Button>
        </div>
      )}
    </div>
  );
}