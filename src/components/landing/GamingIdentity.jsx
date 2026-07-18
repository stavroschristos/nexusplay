import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Star, Clock, Award, Heart } from 'lucide-react';

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };

export default function GamingIdentity() {
  return (
    <section id="identity" className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...reveal}>
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Gaming Identity</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold leading-tight">One identity for everything you've ever played.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We don't replace your consoles or storefronts — we give them a home. Build a living profile that represents everything you've played, earned, and loved across every platform. Your trophy room, timeline, and personality, finally in one place you actually own.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              ['Trophy room', 'Showcase your rarest achievements front and center'],
              ['Favorite games', 'Curate the titles that define you'],
              ['Gaming timeline', 'Every milestone, mapped chronologically'],
              ['Gaming personality', 'Discover your gamer archetype'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <div className="w-1.5 mt-2 rounded-full bg-primary shrink-0 h-6" />
                <div><p className="font-medium text-sm">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div {...reveal} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
          {/* Mock gamer profile card */}
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-2xl font-bold">A</div>
              <div>
                <p className="font-heading font-bold text-lg">Alex Crossfire</p>
                <p className="text-xs text-muted-foreground">The Completionist · Level 47</p>
              </div>
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-5">
              {[['248', Trophy, 'text-amber-300'], ['1.4k', Clock, 'text-blue-300'], ['37', Award, 'text-violet-300'], ['12', Heart, 'text-rose-300']].map(([v, Icon, c]) => (
                <div key={v} className="rounded-xl bg-secondary/40 p-3 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${c}`} />
                  <p className="font-bold text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Trophy Room</p>
              <div className="grid grid-cols-5 gap-2">
                {['Elden Ring', 'Hades', 'GOW', 'Hollow', 'Celeste'].map((g, i) => (
                  <div key={g} className="aspect-square rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/10 grid place-items-center text-[10px] font-bold text-amber-200">{['PL', 'PL', 'PL', 'GD', 'PL'][i]}</div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              {['Action RPG', 'Soulslike', 'Indie'].map((g) => (
                <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{g}</span>
              ))}
            </div>
          </div>
          {/* floating accent card */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}
            className="hidden sm:block absolute -bottom-6 -right-6 rounded-2xl glass border border-white/10 p-3 shadow-xl flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-300" />
            <div><p className="text-xs font-semibold">New trophy!</p><p className="text-[10px] text-muted-foreground">2 minutes ago</p></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}