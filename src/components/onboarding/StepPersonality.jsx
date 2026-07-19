const PERSONALITIES = [
  { key: 'The Completionist', emoji: '🏆', desc: '100%, every achievement, no game left behind.' },
  { key: 'The Explorer', emoji: '🧭', desc: 'Open worlds, hidden corners, every side path.' },
  { key: 'The Competitor', emoji: '⚔️', desc: 'Ranked grind, competitive, always improving.' },
  { key: 'The Story Lover', emoji: '📖', desc: 'Narrative-first, emotional arcs, great characters.' },
];

export default function StepPersonality({ value, onSelect }) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground mb-4">Which sounds most like you? We'll tune your identity around it.</p>
      <div className="grid grid-cols-1 gap-2.5">
        {PERSONALITIES.map((p) => {
          const active = value === p.key;
          return (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${active ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary/50'}`}
            >
              <div className="w-11 h-11 rounded-xl bg-secondary/50 grid place-items-center text-xl shrink-0">{p.emoji}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{p.key}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
              {active && <span className="ml-auto w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}