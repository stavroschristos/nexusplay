import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, ArrowRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// First-session welcome screen shown on the home dashboard before the user
// has dismissed it. Explains that completing their profile unlocks the full
// experience and routes them into the onboarding checklist.
export default function WelcomeBanner({ user, onSeen }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const name = user?.display_name || user?.full_name || 'Gamer';

  const markSeen = async () => {
    setDismissed(true);
    try {
      await base44.auth.updateMe({ has_seen_welcome: true });
      onSeen?.();
    } catch {}
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-card/60 p-6 sm:p-8 glow"
    >
      <div className="absolute -top-16 -right-10 w-56 h-56 bg-[radial-gradient(circle,hsl(271_81%_56%/0.25),transparent_65%)] blur-2xl" />
      <button onClick={markSeen} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/40 hover:bg-background/70 flex items-center justify-center text-muted-foreground" aria-label="Dismiss welcome"><X className="w-4 h-4" /></button>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome to NexusPlay</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
        Let's build your gaming identity, <span className="text-primary text-glow">{name}</span>.
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        Completing your profile unlocks the full experience — discovery, communities, your trophy room, and gamers who match your taste. It takes about two minutes.
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        <button onClick={() => navigate('/settings')} className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors glow">
          <Sparkles className="w-4 h-4" /> Start building <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={markSeen} className="inline-flex items-center px-5 h-11 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors font-medium">
          I'll explore first
        </button>
      </div>

      <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="text-amber-400">🏆</span> Earn XP & badges</span>
        <span className="flex items-center gap-1.5"><span className="text-emerald-400">🎮</span> Unlock your trophy room</span>
        <span className="flex items-center gap-1.5"><span className="text-primary">🤝</span> Find your people</span>
      </div>
    </motion.div>
  );
}