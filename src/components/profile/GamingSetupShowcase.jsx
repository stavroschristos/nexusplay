import { Monitor, Camera } from 'lucide-react';

export default function GamingSetupShowcase({ setups }) {
  if (!setups || setups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Monitor className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">No gaming setup showcased yet.</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {setups.map((s) => (
        <div key={s.id} className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          {s.image_url ? (
            <div className="aspect-video bg-secondary/30 overflow-hidden">
              <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
              <Monitor className="w-10 h-10 text-primary/40" />
            </div>
          )}
          <div className="p-4">
            <h4 className="font-semibold text-sm">{s.title}</h4>
            {s.description && <p className="text-xs text-muted-foreground mt-1">{s.description}</p>}
            {s.components?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {s.components.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-secondary/60 text-muted-foreground">{c}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}