const PLATFORMS = [
  { key: 'PlayStation 5', emoji: '🎮', grad: 'from-blue-500 to-indigo-600' },
  { key: 'Xbox Series X', emoji: '🟢', grad: 'from-green-500 to-emerald-600' },
  { key: 'Nintendo Switch', emoji: '🍄', grad: 'from-red-500 to-rose-600' },
  { key: 'PC (Steam)', emoji: '💻', grad: 'from-slate-500 to-blue-700' },
  { key: 'PC (Epic)', emoji: '🖥️', grad: 'from-zinc-500 to-zinc-700' },
  { key: 'Mobile', emoji: '📱', grad: 'from-violet-500 to-purple-600' },
  { key: 'VR', emoji: '🥽', grad: 'from-cyan-500 to-teal-600' },
  { key: 'Retro Consoles', emoji: '👾', grad: 'from-amber-500 to-orange-600' },
];

export default function StepPlatforms({ value, toggle }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PLATFORMS.map((p) => {
        const active = value.includes(p.key);
        return (
          <button key={p.key} onClick={() => toggle(p.key)}
            className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${active ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.grad} grid place-items-center text-lg mb-2`}>{p.emoji}</div>
            <p className="text-sm font-medium">{p.key}</p>
            {active && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}