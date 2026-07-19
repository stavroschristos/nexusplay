export default function StepBio({ value, onChange }) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted-foreground mb-4">Tell the community what you're about. What do you play? What are you chasing?</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        maxLength={240}
        rows={4}
        placeholder="Speedrunning indie metroidvanias, chasing platinums, and losing at Elden Ring…"
        className="w-full rounded-xl border border-input bg-secondary/30 px-3 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <p className="text-xs text-muted-foreground mt-2 text-right">{value.length}/240</p>
    </div>
  );
}