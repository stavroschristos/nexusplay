import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedBackground from './AnimatedBackground';

export default function Hero({ primaryHref = '/register', primaryLabel = 'Create Free Account' }) {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      <AnimatedBackground />
      <div className="relative text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" /> The identity layer of gaming
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="font-heading font-bold tracking-tight text-balance text-4xl sm:text-6xl lg:text-7xl leading-[1.05]">
          Your whole gaming life,<br /><span className="text-gradient bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">in one identity.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          NexusPlay doesn't replace Steam, Discord, or your console — it connects them. Bring your games, achievements, friends, and memories together into one identity that travels with you across every platform.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full h-12 px-8 text-base glow w-full sm:w-auto">
            <Link to={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base w-full sm:w-auto">
            <Link to="/login">Sign In</Link>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-1.5 text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}