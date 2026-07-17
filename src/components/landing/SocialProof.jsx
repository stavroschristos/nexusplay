import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, Gamepad2, Trophy, UsersRound } from 'lucide-react';

const stats = [
  { icon: Users, value: 128000, suffix: '+', label: 'Gamers onboarded' },
  { icon: Gamepad2, value: 4200, suffix: '+', label: 'Games tracked' },
  { icon: Trophy, value: 1900000, suffix: '+', label: 'Achievements shared' },
  { icon: UsersRound, value: 8600, suffix: '+', label: 'Communities created' },
];

function useCountUp(target) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const dur = 1600, start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return { val, ref };
}

function Stat({ icon: Icon, value, suffix, label }) {
  const { val, ref } = useCountUp(value);
  const formatted = val >= 1000 ? val.toLocaleString() : val;
  return (
    <div ref={ref} className="text-center">
      <Icon className="w-6 h-6 mx-auto text-primary mb-3" />
      <p className="font-heading font-bold text-3xl sm:text-4xl text-gradient bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">{formatted}{suffix}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="rounded-3xl border border-border bg-card/30 backdrop-blur p-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => <Stat key={s.label} {...s} />)}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">Placeholder metrics — editable from the admin dashboard.</p>
      </motion.div>
    </section>
  );
}