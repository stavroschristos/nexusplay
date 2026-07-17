import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Gamepad2, User, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function Card({ icon: Icon, title, sub, grad }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 backdrop-blur p-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} grid place-items-center shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}

const ARCHETYPES = [
  { name: 'The Completionist', match: 'Hunts 100% trophies', grad: 'from-amber-500 to-orange-500' },
  { name: 'The Speedrunner', match: 'Loves tight, replayable games', grad: 'from-cyan-500 to-blue-500' },
  { name: 'The Storyteller', match: 'Lives for narrative RPGs', grad: 'from-violet-500 to-fuchsia-500' },
];

export default function StepRecommend({ genres, games }) {
  const [communities, setCommunities] = useState([]);
  const [recGames, setRecGames] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [cs, gs] = await Promise.all([
          base44.entities.Community.list('-created_date', 12),
          base44.entities.Game.list('-created_date', 12),
        ]);
        setCommunities((cs || []).slice(0, 3));
        setRecGames((gs || []).slice(0, 3));
      } catch {
        // keep placeholder recs below
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Communities for you</p>
        <div className="space-y-2.5">
          {communities.length ? communities.map((c) => (
            <Card key={c.id} icon={Users} title={c.name || 'Community'} sub={c.description || 'Join the conversation'} grad="from-indigo-500 to-blue-600" />
          )) : (
            <Card icon={Users} title="RPG Fans" sub="Matches your genre picks" grad="from-indigo-500 to-blue-600" />
          )}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Gamepad2 className="w-3.5 h-3.5" /> Games you might love</p>
        <div className="space-y-2.5">
          {recGames.length ? recGames.map((g) => (
            <Card key={g.id} icon={Gamepad2} title={g.title} sub={(g.genres || []).join(' · ') || 'Trending now'} grad="from-emerald-500 to-green-500" />
          )) : (
            <>
              <Card icon={Gamepad2} title="Hades II" sub="Roguelike · matches your taste" grad="from-emerald-500 to-green-500" />
              <Card icon={Gamepad2} title="Baldur's Gate 3" sub="RPG · highly rated" grad="from-rose-500 to-red-500" />
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Gamers like you</p>
        <div className="grid grid-cols-3 gap-2.5">
          {ARCHETYPES.map((a, i) => (
            <motion.div key={a.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-card/40 p-3 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${a.grad} grid place-items-center text-white font-bold text-sm`}>{a.name.split(' ').pop()[0]}</div>
              <p className="text-xs font-medium mt-2">{a.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.match}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}