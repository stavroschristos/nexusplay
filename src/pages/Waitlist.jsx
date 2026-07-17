import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Check, Loader2, Mail, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PLATFORMS = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Battle.net', 'Riot', 'Twitch', 'PC', 'Mobile'];

export default function Waitlist() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState('PlayStation');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.WaitlistEntry.create({ name: name.trim(), email: email.trim(), favorite_platform: platform });
      setDone(true);
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/40 via-background to-background" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[50vh] bg-[radial-gradient(ellipse_at_center,hsl(271_81%_56%/0.18),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(hsl(0_0%_100%)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 font-heading font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-primary grid place-items-center glow"><Gamepad2 className="w-5 h-5 text-primary-foreground" /></div>
          NexusPlay
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="glass rounded-3xl border border-border/70 shadow-2xl p-7">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h1 className="text-xl font-heading font-bold">You're on the list!</h1>
              <p className="text-sm text-muted-foreground mt-2">We'll review your request and email you when your access is approved. See you soon, gamer.</p>
              <Button asChild variant="outline" className="mt-6 rounded-full"><Link to="/">Back to home</Link></Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-heading font-bold">Join the Waitlist</h1>
                <p className="text-sm text-muted-foreground mt-2">We are rolling out access in waves. Reserve your spot and we'll be in touch.</p>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full h-12 rounded-xl border border-input bg-secondary/30 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-12 rounded-xl border border-input bg-secondary/30 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Favorite platform</label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full h-12 rounded-xl border border-input bg-secondary/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <Button type="submit" disabled={saving} className="w-full h-12 rounded-full glow">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reserve my spot'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-5">
                Already have access?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}