import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';

const platforms = [
  { name: 'PlayStation', grad: 'from-blue-500 to-indigo-600' },
  { name: 'Xbox', grad: 'from-green-500 to-emerald-600' },
  { name: 'Steam', grad: 'from-slate-500 to-blue-700' },
  { name: 'Nintendo', grad: 'from-red-500 to-rose-600' },
  { name: 'Epic Games', grad: 'from-zinc-500 to-zinc-700' },
  { name: 'Battle.net', grad: 'from-cyan-500 to-sky-700' },
  { name: 'Riot Games', grad: 'from-rose-500 to-red-700' },
  { name: 'Twitch', grad: 'from-violet-500 to-purple-700' },
];

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };

export default function ConnectWorld() {
  return (
    <section id="connect" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="max-w-5xl mx-auto px-4 text-center">
        <motion.div {...reveal}>
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Connect Your Gaming World</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold">One profile. Every platform.</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            NexusPlay doesn't replace your gaming ecosystem — it unites it. Link your existing accounts and let your history flow into a single identity.
          </p>
        </motion.div>

        <motion.div {...reveal} transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {platforms.map((p) => (
            <div key={p.name} className="group rounded-2xl border border-border bg-card/40 backdrop-blur p-6 hover:border-primary/40 hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${p.grad} grid place-items-center text-white font-bold text-lg shadow-lg`}>{p.name[0]}</div>
              <p className="mt-3 text-sm font-medium">{p.name}</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"><Link2 className="w-3 h-3" /> Linked</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}