import { motion } from 'framer-motion';
import { Home, User, Trophy, Gamepad2, MessagesSquare, Users, Radio, Compass } from 'lucide-react';

const features = [
  { icon: Home, title: 'Home Feed', desc: 'The social pulse of your network — activity and milestones from across every platform.', grad: 'from-violet-500 to-fuchsia-500' },
  { icon: User, title: 'Gamer Profile', desc: 'Identity — who you are as a gamer, across every platform, on one page.', grad: 'from-blue-500 to-cyan-500' },
  { icon: Trophy, title: 'Trophy Room', desc: 'Memories — your rarest achievements, showcased front and center.', grad: 'from-amber-500 to-orange-500' },
  { icon: Gamepad2, title: 'Game Pages', desc: 'Discovery — reviews, discussions, and community for every game you love.', grad: 'from-emerald-500 to-green-500' },
  { icon: MessagesSquare, title: 'Messaging', desc: 'Community — real-time DMs with the gamers you meet here.', grad: 'from-rose-500 to-red-500' },
  { icon: Users, title: 'Communities', desc: 'Community — spaces built around the games and genres you love.', grad: 'from-indigo-500 to-blue-600' },
  { icon: Radio, title: 'Gaming Radar', desc: 'See who is online, playing, streaming, or looking for group — across every platform.', grad: 'from-cyan-500 to-teal-500' },
  { icon: Compass, title: 'Discovery', desc: 'Find compatible gamers, communities, and games based on your actual taste.', grad: 'from-fuchsia-500 to-purple-600' },
];

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6 } };

export default function FeatureShowcase() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 py-24">
      <motion.div {...reveal} className="text-center mb-12">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">Feature Showcase</span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold">Not another app to juggle. The layer that ties them together.</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">NexusPlay connects the platforms you already use — so your identity, discovery, memories, and community live in one place.</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group rounded-2xl border border-border bg-card/40 backdrop-blur p-6 hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-xl transition-all">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.grad} grid place-items-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <f.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}