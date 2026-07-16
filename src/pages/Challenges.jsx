import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Loader2, Target, CheckCircle2, Circle, Flame, Award, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const categoryColors = {
  weekly: 'border-blue-500/30 bg-blue-500/5',
  monthly: 'border-purple-500/30 bg-purple-500/5',
  community: 'border-emerald-500/30 bg-emerald-500/5',
  special: 'border-amber-500/30 bg-amber-500/5',
};

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [ch, uc] = await Promise.all([
      base44.entities.Challenge.list('-created_date', 50),
      base44.entities.UserChallenge.filter({ created_by_id: user?.id }),
    ]);
    setChallenges(ch); setProgress(uc);
  };

  useEffect(() => { if (user?.id) load().finally(() => setLoading(false)); }, [user]);

  const getProgress = (cid) => progress.find((p) => p.challenge_id === cid);

  const join = async (challenge) => {
    const existing = getProgress(challenge.id);
    if (existing) return;
    const uc = await base44.entities.UserChallenge.create({ challenge_id: challenge.id, progress: 0, completed: false });
    setProgress((p) => [...p, uc]);
    toast({ title: 'Challenge joined!' });
  };

  const increment = async (challenge) => {
    const uc = getProgress(challenge.id);
    if (!uc || uc.completed) return;
    const newProg = uc.progress + 1;
    const done = newProg >= challenge.target;
    await base44.entities.UserChallenge.update(uc.id, { progress: newProg, completed: done, completed_at: done ? new Date().toISOString() : undefined });
    setProgress((p) => p.map((x) => x.id === uc.id ? { ...x, progress: newProg, completed: done } : x));
    if (done) toast({ title: `Challenge complete! +${challenge.xp_reward} XP`, description: challenge.badge_icon || '🏆' });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">Gaming Challenges</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Complete challenges to earn XP and badges.</p>

      {challenges.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No active challenges right now. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => {
            const uc = getProgress(c.id);
            const pct = uc ? Math.min(100, (uc.progress / c.target) * 100) : 0;
            return (
              <div key={c.id} className={`rounded-2xl border p-5 ${categoryColors[c.category] || 'border-border bg-card/50'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.badge_icon || '🎯'}</span>
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{c.category} · {c.type}</p>
                    </div>
                  </div>
                  {uc?.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">+{c.xp_reward} XP</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                {uc && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{uc.progress} / {c.target}</span>
                      <span className="font-medium">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
                {!uc ? (
                  <button onClick={() => join(c)} className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Join Challenge</button>
                ) : !uc.completed ? (
                  <button onClick={() => increment(c)} className="w-full py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                    <Zap className="w-4 h-4" /> Log Progress (+1)
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium text-center flex items-center justify-center gap-1.5">
                    <Award className="w-4 h-4" /> Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}