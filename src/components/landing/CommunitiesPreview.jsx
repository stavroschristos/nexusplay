import { motion } from 'framer-motion';
import { Users, ArrowUpRight } from 'lucide-react';

const communities = [
  { name: 'RPG Fans', members: '12.4k', grad: 'from-violet-500 to-fuchsia-600', emoji: '⚔️' },
  { name: 'Achievement Hunters', members: '8.1k', grad: 'from-amber-500 to-orange-600', emoji: '🏆' },
  { name: 'Speedrunners', members: '4.7k', grad: 'from-cyan-500 to-blue-600', emoji: '⚡' },
  { name: 'Indie Games', members: '9.3k', grad: 'from-emerald-500 to-green-600', emoji: '🎮' },
  { name: 'Retro Gaming', members: '6.0k', grad: 'from-rose-500 to-red-600', emoji: '👾' },
  { name: 'Competitive FPS', members: '15.2k', grad: 'from-indigo-500 to-blue-700', emoji: '🎯' },
];

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };

export default function CommunitiesPreview() {
  return (
    <section id="communities" className="max-w-7xl mx-auto px-4 py-24">
      <motion.div {...reveal} className="text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Communities</span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold">Find your people — around shared games, not just servers.</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Communities here form around what you actually play. Meet gamers who share your taste across every platform. Preview a few before you even sign up.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {communities.map((c, i) => (
          <motion.div key={c.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur p-6 hover:border-primary/40 hover:-translate-y-1 transition-all">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.grad} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
            <div className="text-3xl mb-3">{c.emoji}</div>
            <h3 className="font-heading font-semibold text-lg">{c.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {c.members} members</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Preview community <ArrowUpRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}