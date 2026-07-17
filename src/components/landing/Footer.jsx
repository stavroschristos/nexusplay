import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const cols = [
  { title: 'Platform', links: [['About', '#'], ['Careers', '#'], ['Blog', '#'], ['Contact', '#']] },
  { title: 'Legal', links: [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Community Guidelines', '#'], ['Cookie Policy', '#']] },
  { title: 'Community', links: [['Communities', '#'], ['Games', '#'], ['Gaming Radar', '#'], ['Gaming Wrapped', '#']] },
];

const socials = ['Discord', 'X', 'Twitch', 'YouTube', 'Instagram'];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
            NexusPlay
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">Your entire gaming life, in one profile. Connect every platform, showcase every achievement, find your people.</p>
          <div className="flex flex-wrap gap-2 mt-5">
            {socials.map((s) => (
              <span key={s} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer">{s}</span>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold mb-3">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map(([label, href]) => (
                <li key={label}><a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NexusPlay. All rights reserved.</p>
          <p>Built for gamers, by gamers.</p>
        </div>
      </div>
    </footer>
  );
}