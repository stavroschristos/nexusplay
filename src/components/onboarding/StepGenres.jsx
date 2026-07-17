const GENRES = ['RPG', 'Action', 'Adventure', 'Shooter', 'Strategy', 'Horror', 'Racing', 'Sports', 'Fighting', 'Puzzle', 'Roguelike', 'Indie', 'MMO', 'Sandbox', 'Soulslike', 'Survival', 'Platformer', 'Sim'];

export default function StepGenres({ value, toggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((g) => {
        const active = value.includes(g);
        return (
          <button key={g} onClick={() => toggle(g)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${active ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60'}`}>
            {g}
          </button>
        );
      })}
    </div>
  );
}