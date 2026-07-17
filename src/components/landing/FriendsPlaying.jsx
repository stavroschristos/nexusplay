import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Radio, Award, CheckCircle2 } from 'lucide-react';

const activities = [
  { user: 'Alex', text: 'started playing', target: 'Elden Ring', icon: Gamepad2, color: 'text-blue-300', time: 'just now' },
  { user: 'Sarah', text: 'unlocked a', target: 'Platinum Trophy', icon: Trophy, color: 'text-amber-300', time: '2m ago' },
  { user: 'Mike', text: 'is streaming', target: 'Valorant', icon: Radio, color: 'text-rose-300', time: '5m ago' },
  { user: 'Chris', text: 'completed', target: "Baldur's Gate 3", icon: CheckCircle2, color: 'text-emerald-300', time: '12m ago' },
  { user: 'Jordan', text: 'earned a new', target: 'Achievement', icon: Award, color: 'text-violet-300', time: '20m ago' },
];

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };

export default function FriendsPlaying() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...reveal} className="order-2 lg:order-1 space-y-3">
          {activities.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 backdrop-blur p-4 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent grid place-items-center font-bold text-sm">{a.user[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm"><span className="font-semibold">{a.user}</span> <span className="text-muted-foreground">{a.text}</span> <span className="font-medium">{a.target}</span></p>
                <p className="text-xs text-muted-foreground">{a.time}</p>
              </div>
              <a.icon className={`w-5 h-5 ${a.color} shrink-0`} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...reveal} transition={{ delay: 0.1 }} className="order-1 lg:order-2">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">See What Friends Are Playing</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold leading-tight">Never play alone.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A real-time social feed built for gamers. Watch your friends earn trophies, start streams, finish games, and find groups — all in one place. The social pulse of your gaming world.
          </p>
        </motion.div>
      </div>
    </section>
  );
}