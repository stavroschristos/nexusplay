import { Trophy } from 'lucide-react';

export default function TopListCard({ list }) {
  if (!list) return null;
  return (
    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <h4 className="font-semibold text-sm">{list.title}</h4>
        {list.description && <p className="text-xs text-muted-foreground mt-0.5">{list.description}</p>}
      </div>
      <ol className="divide-y divide-border/30">
        {(list.items || []).slice(0, 10).map((item, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-700/20 text-orange-400' : 'bg-secondary/50 text-muted-foreground'
            }`}>{i + 1}</span>
            <span className="text-sm font-medium flex-1 min-w-0 truncate">{item}</span>
            {i === 0 && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          </li>
        ))}
      </ol>
    </div>
  );
}