import { Plus, Trash2 } from 'lucide-react';

const PLATFORMS = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Riot', 'Battle.net', 'Twitch'];

export default function StepConnect({ accounts, setAccounts }) {
  const update = (i, field, val) => setAccounts((a) => a.map((x, j) => (j === i ? { ...x, [field]: val } : x)));
  const remove = (i) => setAccounts((a) => a.filter((_, j) => j !== i));
  const add = () => setAccounts((a) => [...a, { platform: 'Steam', username: '' }]);

  return (
    <div>
      <div className="space-y-3">
        {accounts.map((acc, i) => (
          <div key={i} className="flex gap-2">
            <select value={acc.platform} onChange={(e) => update(i, 'platform', e.target.value)}
              className="w-36 rounded-xl border border-input bg-secondary/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input value={acc.username} onChange={(e) => update(i, 'username', e.target.value)} placeholder="Username / handle"
              className="flex-1 rounded-xl border border-input bg-secondary/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            {accounts.length > 1 && (
              <button onClick={() => remove(i)} className="rounded-xl border border-border px-3 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><Plus className="w-4 h-4" /> Add another account</button>
      <p className="text-xs text-muted-foreground mt-4">Optional — you can always connect these later from Settings.</p>
    </div>
  );
}