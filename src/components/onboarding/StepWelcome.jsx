import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, Trophy, Users, Radio } from 'lucide-react';

const perks = [
  { icon: Trophy, text: 'Showcase every achievement' },
  { icon: Users, text: 'Find your gaming community' },
  { icon: Radio, text: 'See who is playing, now' },
  { icon: Sparkles, text: 'Discovery tuned to your taste' },
];

export default function StepWelcome({ name }) {
  return (
    <div className="text-center py-4">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center shadow-2xl glow mb-6">
        <Gamepad2 className="w-10 h-10 text-white" />
      </motion.div>
      <h2 className="font-heading font-bold text-2xl">{name ? `Welcome, ${name}!` : 'Welcome to NexusPlay'}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Let's build your gaming identity — the layer that connects your platforms. Answer a few quick questions and we'll tune discovery to your actual taste. It takes under a minute.</p>
      <div className="grid grid-cols-2 gap-3 mt-7 text-left">
        {perks.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center gap-2.5 rounded-xl bg-secondary/30 border border-border/60 p-3">
            <p.icon className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs">{p.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}