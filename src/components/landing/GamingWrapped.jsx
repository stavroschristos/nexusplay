import { motion } from 'framer-motion';
import { Flame, Trophy, Clock, Star } from 'lucide-react';

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };

export default function GamingWrapped() {
  return (
    <section id="wrapped" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...reveal} transition={{ delay: 0.1 }} className="order-2 lg:order-1">
          {/* Mock wrapped card */}
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-600/5 p-8 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 mb-4"><Flame className="w-5 h-5" /><span className="text-sm font-bold uppercase tracking-widest">Your Year in Gaming</span></div>
            <p className="font-heading font-bold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">1,247 hrs</p>
            <p className="text-sm text-muted-foreground mt-1">played across 38 games</p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[['Top Game', 'Elden Ring', '62 hrs', Star], ['Rarest Trophy', 'Legend', '0.1%', Trophy], ['Most Active', 'March', '180 hrs', Clock], ['Completion', '87%', '+12%', Flame]].map(([t, v, s, Icon]) => (
                <div key={t} className="rounded-xl bg-background/40 border border-white/5 p-3">
                  <Icon className="w-4 h-4 text-amber-300 mb-1" />
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t}</p>
                  <p className="text-sm font-semibold">{v}</p>
                  <p className="text-xs text-amber-300/80">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...reveal} className="order-1 lg:order-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Gaming Memories</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold leading-tight">Your gaming journey, preserved.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Achievements vanish inside each platform's walled garden. Here they live together. Get shareable recaps of your most-played games, rarest trophies, and streaks — the story of who you are as a gamer, across every platform, kept forever.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Yearly Recap', 'Monthly Digests', 'Shareable Cards', 'Personality Insights'].map((t) => (
              <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">{t}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}