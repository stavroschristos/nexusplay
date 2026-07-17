import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Gamepad2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '#identity', label: 'Identity' },
  { href: '#connect', label: 'Connect' },
  { href: '#communities', label: 'Communities' },
  { href: '#wrapped', label: 'Wrapped' },
  { href: '#features', label: 'Features' },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn('fixed top-0 inset-x-0 z-50 transition-all duration-300', scrolled ? 'glass border-b border-border/60' : 'bg-transparent')}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
          NexusPlay
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/login">Sign In</Link></Button>
          <Button asChild size="sm" className="rounded-full glow"><Link to="/register">Create Free Account</Link></Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="md:hidden glass border-t border-border/60 px-4 py-4 space-y-1 animate-slide-up">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground hover:text-foreground">{l.label}</a>
          ))}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/login">Sign In</Link></Button>
            <Button asChild size="sm" className="flex-1 rounded-full"><Link to="/register">Create Account</Link></Button>
          </div>
        </div>
      )}
    </header>
  );
}