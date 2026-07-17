import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Gift, Zap, ChevronRight, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { CHECKLIST_STEPS, computeProgress, currentMilestone, nextMilestone, fetchProgressData } from '@/lib/onboarding-progress';
import { createNotification } from '@/lib/notifications';
import { cn } from '@/lib/utils';

// Persistent "Complete Your Gaming Identity" checklist. Computes progress
// live from the user object + related data. Shown on the home dashboard and
// the user's own profile. Each item links to the right place to complete it.
export default function NewUserChecklist({ variant = 'home' }) {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [justCompleted, setJustCompleted] = useState(null);

  const load = async () => {
    if (!user?.id) return;
    const d = await fetchProgressData(user.id);
    setData(d);
  };

  useEffect(() => { load(); }, [user?.id]);

  if (!user || !data) return null;

  const progress = computeProgress(user, data);
  if (progress.isComplete && user?.onboarding_rewards_claimed && variant !== 'force') return null;

  const milestone = currentMilestone(progress.percent);
  const next = nextMilestone(progress.percent);

  const claimReward = async () => {
    if (!progress.isComplete || user?.onboarding_rewards_claimed) return;
    setClaiming(true);
    try {
      const bonusXp = 100;
      const newXp = (user?.xp || 0) + progress.xpEarned + bonusXp;
      await base44.auth.updateMe({
        xp: newXp,
        onboarding_rewards_claimed: true,
        onboarding_completed_at: new Date().toISOString(),
      });
      await createNotification({
        recipientId: user.id,
        type: 'milestone',
        title: 'Identity Unlocked!',
        content: `You completed your gaming identity and earned ${progress.xpEarned + bonusXp} XP. Your profile is fully unlocked.`,
        icon: '🏆',
        link: '/profile',
        actorId: user.id,
        force: true,
      });
      await checkUserAuth();
      setJustCompleted(true);
      toast({ title: 'Identity Unlocked! 🏆', description: `+${progress.xpEarned + bonusXp} XP earned.` });
    } catch {
      toast({ title: 'Failed to claim reward', variant: 'destructive' });
    } finally {
      setClaiming(false);
    }
  };

  const compact = variant === 'profile';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur-sm overflow-hidden', compact && 'rounded-xl')}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold">Complete Your Gaming Identity</h3>
          {milestone && <span className="ml-auto text-lg" title={milestone.label}>{milestone.badge}</span>}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {progress.isComplete ? 'You did it — identity unlocked.' : `${progress.doneCount}/${progress.totalCount} steps · ${progress.percent}% complete`}
        </p>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-secondary/50 overflow-hidden mb-1">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-chart-4"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-chart-4" /> {progress.xpEarned}/{progress.xpTotal} XP</span>
          {next && <span>Next: {next.badge} {next.label} at {next.at}%</span>}
        </div>

        {/* Checklist */}
        <div className={cn('grid gap-1.5', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
          {CHECKLIST_STEPS.map((step) => {
            const done = progress.completed[step.key];
            return (
              <button
                key={step.key}
                onClick={() => navigate(step.link)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all group',
                  done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card/40 hover:border-primary/40 hover:bg-secondary/30'
                )}
              >
                <div className={cn('w-5 h-5 rounded-full grid place-items-center shrink-0 text-[10px]', done ? 'bg-emerald-500 text-white' : 'border border-border bg-secondary/40')}>
                  {done ? <Check className="w-3 h-3" /> : <Lock className="w-2.5 h-2.5 text-muted-foreground" />}
                </div>
                <span className="text-base leading-none">{step.icon}</span>
                <span className={cn('text-xs flex-1', done ? 'text-muted-foreground line-through' : 'font-medium')}>{step.label}</span>
                <span className="text-[9px] text-chart-4 font-semibold">+{step.reward}</span>
                {!done && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Claim reward */}
        <AnimatePresence>
          {progress.isComplete && !user?.onboarding_rewards_claimed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <button
                onClick={claimReward}
                disabled={claiming}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Gift className="w-4 h-4" /> {claiming ? 'Claiming...' : `Claim ${progress.xpEarned + 100} XP reward`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}