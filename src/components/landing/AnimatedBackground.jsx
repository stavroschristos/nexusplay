import { motion } from 'framer-motion';

// Floating mock UI cards that drift behind the hero copy.
const cards = [
  { top: '8%', left: '4%', delay: 0, label: 'PLATINUM', title: 'Elden Ring', sub: 'All trophies unlocked', color: 'from-cyan-500/20 to-blue-500/10', accent: 'text-cyan-300' },
  { top: '18%', right: '5%', delay: 0.6, label: 'TROPHY', title: 'Sarah unlocked', sub: 'Legend achievement', color: 'from-amber-500/20 to-orange-500/10', accent: 'text-amber-300' },
  { bottom: '14%', left: '7%', delay: 1.1, label: 'LIVE', title: 'Mike · Valorant', sub: '412 watching', color: 'from-rose-500/20 to-red-500/10', accent: 'text-rose-300' },
  { bottom: '8%', right: '8%', delay: 0.3, label: 'LFG', title: 'Raid team looking', sub: '2 spots open', color: 'from-emerald-500/20 to-green-500/10', accent: 'text-emerald-300' },
  { top: '42%', left: '12%', delay: 0.9, label: 'LEVEL 47', title: 'Alex', sub: 'Online · PlayStation', color: 'from-violet-500/20 to-purple-500/10', accent: 'text-violet-300' },
];

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/40 via-background to-background" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,hsl(271_81%_56%/0.18),transparent_60%)]" />
      {/* grid */}
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(hsl(0_0%_100%)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%)_1px,transparent_1px)] [background-size:48px_48px]" />

      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -14, 0] }}
          transition={{ opacity: { duration: 0.6, delay: c.delay }, y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: c.delay } }}
          style={{ position: 'absolute', top: c.top, left: c.left, right: c.right, bottom: c.bottom }}
          className="hidden md:block w-52 rounded-2xl glass border border-white/10 p-4 shadow-2xl"
        >
          <div className={`text-[10px] font-bold tracking-widest mb-2 ${c.accent}`}>{c.label}</div>
          <div className="text-sm font-semibold text-foreground">{c.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}