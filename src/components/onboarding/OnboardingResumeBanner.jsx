import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowRight } from 'lucide-react';

// Shown to users who started but never finished onboarding, prompting them to
// resume exactly where they left off. Displayed on Home, Profile, and Settings.
export default function OnboardingResumeBanner({ user }) {
  const navigate = useNavigate();
  if (!user || user.has_onboarded || !user.onboarding_started) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-card/60 p-5"
    >
      <div className="absolute -top-12 -right-8 w-40 h-40 bg-[radial-gradient(circle,hsl(271_81%_56%/0.2),transparent_65%)] blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center glow"><Gamepad2 className="w-4 h-4 text-primary-foreground" /></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Welcome back</span>
        </div>
        <h3 className="text-lg font-heading font-bold">Continue building your gaming identity.</h3>
        <p className="text-sm text-muted-foreground mt-1">Pick up right where you left off — it only takes a minute to finish your setup.</p>
        <button
          onClick={() => navigate('/onboarding')}
          className="inline-flex items-center gap-2 mt-4 px-5 h-10 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Continue Setup <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}