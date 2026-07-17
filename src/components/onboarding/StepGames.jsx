import { useState } from 'react';
import { Plus, X } from 'lucide-react';

const SUGGESTED = [
  'Elden Ring', 'Baldur\'s Gate 3', 'The Witcher 3', 'God of War Ragnarök', 'Hades', 'Hollow Knight',
  'Stardew Valley', 'Cyberpunk 2077', 'Red Dead Redemption 2', 'Valorant', 'Minecraft', 'Apex Legends',
  'Final Fantasy XVI', 'Zelda: Tears of the Kingdom', 'Persona 5 Royal', 'Disco Elysium', 'Sekiro',
  'Resident Evil 4', 'Overwatch 2', 'League of Legends', 'Super Mario Odyssey', 'Helldivers 2',
];

export default function StepGames({ value, toggle, addCustom }) {
  const [custom, setCustom] = useState('');
  const submitCustom = (e) => {
    e.preventDefault();
    const t = custom.trim();
    if (t && !value.includes(t)) addCustom(t);
    setCustom('');
  };

  return (
    <div>
      <form onSubmit={submitCustom} className="flex gap-2 mb-4">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add a game you love…"
          className="flex-1 rounded-xl border border-input bg-secondary/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-3 grid place-items-center"><Plus className="w-5 h-5" /></button>
      </form>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {value.map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm">
              {g}
              <button onClick={() => toggle(g)}><X className="w-3.5 h-3.5" /></button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Popular picks</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.filter((g) => !value.includes(g)).map((g) => (
          <button key={g} onClick={() => toggle(g)}
            className="px-3.5 py-2 rounded-full text-sm bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">
            + {g}
          </button>
        ))}
      </div>
    </div>
  );
}