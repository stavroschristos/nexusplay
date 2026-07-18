import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function CTA({ primaryHref = '/register', primaryLabel = 'Create Free Account' }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-background p-12 sm:p-16 text-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[60vw] h-48 bg-primary/30 blur-3xl rounded-full" />
        <div className="relative">
          <h2 className="font-heading font-bold text-3xl sm:text-5xl leading-tight">Bring your gaming<br />identity together.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Keep Steam, Discord, and your console — just add the layer that connects them. Free, yours, and ready in 30 seconds.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full h-12 px-8 text-base glow w-full sm:w-auto"><Link to={primaryHref}>{primaryLabel}</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base w-full sm:w-auto"><Link to="/login">Sign In</Link></Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}