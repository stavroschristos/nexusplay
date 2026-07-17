import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

// Premium auth shell matching the landing aesthetic. Same props as before
// (icon, title, subtitle, footer, children) so existing auth pages work unchanged.
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* gradient + grid background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/40 via-background to-background" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,hsl(271_81%_56%/0.18),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(hsl(0_0%_100%)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 font-heading font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
          NexusPlay
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-center mb-7">
          {Icon && (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 mb-4">
              <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
            </div>
          )}
          <h1 className="text-2xl font-heading font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          className="glass rounded-3xl border border-border/70 shadow-2xl p-7">
          {children}
        </motion.div>

        {footer && <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>}
      </div>
    </div>
  );
}