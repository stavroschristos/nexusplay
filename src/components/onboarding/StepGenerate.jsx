import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUSES = ['Analyzing your platforms…', 'Mapping your favorite genres…', 'Studying your game taste…', 'Crafting your gamer archetype…', 'Finalizing your identity…'];

export default function StepGenerate({ selections, onGenerated, profile }) {
  const [status, setStatus] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) return;
    let cancelled = false;
    const statusTimer = setInterval(() => setStatus((s) => Math.min(s + 1, STATUSES.length - 1)), 900);

    (async () => {
      try {
        const prompt = `You are generating a gamer identity for a new user. Based on these preferences:
Platforms: ${selections.platforms.join(', ') || 'none yet'}
Genres: ${selections.genres.join(', ') || 'none yet'}
Favorite games: ${selections.games.join(', ') || 'none yet'}

Write a punchy gaming identity. Respond as JSON:
{ "archetype": "a combined archetype label like 'The Completionist Explorer' (max 4 words)",
  "personality": "one of: The Completionist, The Explorer, The Competitor, The Story Lover",
  "summary": "2 fun sentences in second person ('You are…') describing this gamer's vibe based on their taste" }`;
        const res = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              archetype: { type: 'string' },
              personality: { type: 'string' },
              summary: { type: 'string' },
            },
          },
        });
        if (!cancelled) onGenerated(res);
      } catch (e) {
        if (!cancelled) {
          setError('Could not generate — you can continue anyway.');
          onGenerated({
            archetype: 'The Versatile Gamer',
            personality: 'The Explorer',
            summary: 'You are a gamer with broad tastes and an appetite for new experiences. Your profile is ready to grow with you.',
          });
        }
      } finally {
        clearInterval(statusTimer);
      }
    })();

    return () => { cancelled = true; clearInterval(statusTimer); };
  }, []);

  if (!profile) {
    return (
      <div className="text-center py-8">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center shadow-2xl glow">
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <motion.p key={status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-sm text-muted-foreground">{STATUSES[status]}</motion.p>
        <div className="flex justify-center gap-1.5 mt-4">
          {STATUSES.map((_, i) => <div key={i} className={`h-1 w-6 rounded-full transition-all ${i <= status ? 'bg-primary' : 'bg-secondary'}`} />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/15 border border-primary/30 grid place-items-center mb-4">
        <Check className="w-7 h-7 text-primary" />
      </div>
      <p className="text-xs uppercase tracking-widest text-primary">Your gamer archetype</p>
      <h2 className="font-heading font-bold text-2xl mt-1 text-gradient bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">{profile.archetype}</h2>
      <span className="inline-block mt-3 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">{profile.personality}</span>
      <p className="text-sm text-muted-foreground mt-5 max-w-sm mx-auto leading-relaxed">{profile.summary}</p>
    </motion.div>
  );
}