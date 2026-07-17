import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-10 pb-20 animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <Shield className="w-4 h-4" /> NexusPlay
        </Link>
        <h1 className="text-3xl font-bold font-heading">{title}</h1>
        {lastUpdated && <p className="text-xs text-muted-foreground mt-1">Last updated: {lastUpdated}</p>}
        <div className="prose prose-invert max-w-none mt-8 space-y-4 text-sm leading-relaxed text-foreground/85">
          {children}
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          <Link to="/guidelines" className="hover:text-foreground">Community Guidelines</Link>
          <Link to="/data-usage" className="hover:text-foreground">Data Usage</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}