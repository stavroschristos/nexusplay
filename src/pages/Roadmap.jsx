import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowBigUp, Check, Sparkles, Rocket, Hammer, PartyPopper, Loader2, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const STAGES = [
  { key: 'popular', label: 'Popular', icon: TrendingUp },
  { key: 'coming_soon', label: 'Coming Soon', icon: Sparkles },
  { key: 'in_development', label: 'In Development', icon: Hammer },
  { key: 'recently_released', label: 'Recently Released', icon: PartyPopper },
];

export default function Roadmap() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('popular');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, vts] = await Promise.all([
        base44.entities.FeatureRequest.list('-created_date', 200),
        base44.entities.FeatureVote.list('-created_date', 500),
      ]);
      setRequests(reqs.filter((r) => r.is_public !== false));
      setVotes(vts);
    } catch {
      toast({ title: 'Could not load roadmap', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const voteCounts = useMemo(() => {
    const m = {};
    votes.forEach((v) => { m[v.feature_request_id] = (m[v.feature_request_id] || 0) + 1; });
    return m;
  }, [votes]);

  const myVotes = useMemo(() => new Set(votes.filter((v) => v.created_by_id === user?.id).map((v) => v.feature_request_id)), [votes, user?.id]);

  const visible = useMemo(() => {
    let list = [...requests];
    if (stage === 'popular') list.sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
    else if (stage === 'coming_soon') list = list.filter((r) => r.roadmap_stage === 'coming_soon' || r.status === 'planned');
    else if (stage === 'in_development') list = list.filter((r) => r.roadmap_stage === 'in_development' || r.status === 'in_development');
    else if (stage === 'recently_released') list = list.filter((r) => r.roadmap_stage === 'recently_released' || r.status === 'completed');
    return list;
  }, [requests, stage, voteCounts]);

  const toggleVote = async (req) => {
    if (!user) return;
    if (myVotes.has(req.id)) {
      const vote = votes.find((v) => v.feature_request_id === req.id && v.created_by_id === user.id);
      if (vote) {
        setVotes((p) => p.filter((v) => v.id !== vote.id));
        try { await base44.entities.FeatureVote.delete(vote.id); } catch { load(); }
      }
    } else {
      try {
        const created = await base44.entities.FeatureVote.create({ feature_request_id: req.id, voter_name: user.display_name || user.full_name || user.email });
        setVotes((p) => [...p, created]);
      } catch (e) {
        toast({ title: 'Vote failed', variant: 'destructive' });
      }
    }
  };

  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.FeatureRequest.create({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: 'feature',
        submitted_by_name: user?.display_name || user?.full_name || user?.email || '',
      });
      setRequests((p) => [created, ...p]);
      setNewTitle(''); setNewDesc(''); setSuggestOpen(false);
      toast({ title: 'Suggestion submitted!' });
    } catch (e) {
      toast({ title: 'Could not submit', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PageHeader icon={Rocket} title="Product Roadmap" subtitle="Vote on what we build next. Your voice shapes NexusPlay." />

      <div className="flex items-center justify-between gap-3 mt-5 mb-4">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin -mx-1 px-1">
          {STAGES.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => setStage(s.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${stage === s.key ? 'bg-primary text-primary-foreground' : 'bg-card/60 border border-border text-muted-foreground hover:text-foreground'}`}>
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>
        <Button size="sm" className="rounded-full shrink-0" onClick={() => setSuggestOpen(true)}><Lightbulb className="w-4 h-4" /> Suggest</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">Nothing here yet — be the first to shape this stage.</div>
      ) : (
        <div className="space-y-3">
          {visible.map((req, i) => {
            const count = voteCounts[req.id] || 0;
            const voted = myVotes.has(req.id);
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="flex gap-3">
                  <button onClick={() => toggleVote(req)}
                    className={`flex flex-col items-center justify-center w-14 shrink-0 rounded-xl border transition-all ${voted ? 'border-primary bg-primary/15 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground'}`}>
                    {voted ? <Check className="w-5 h-5" /> : <ArrowBigUp className="w-5 h-5" />}
                    <span className="text-sm font-bold">{count}</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm">{req.title}</h3>
                    {req.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.description}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground capitalize">{req.category}</span>
                      {req.roadmap_stage && req.roadmap_stage !== 'none' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary capitalize">{req.roadmap_stage.replace('_', ' ')}</span>
                      )}
                      {req.submitted_by_name && <span className="text-[10px] text-muted-foreground/70">by {req.submitted_by_name}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Suggest a feature</DialogTitle>
            <DialogDescription>Describe what you'd love to see in NexusPlay.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSuggestion} className="space-y-3">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="Feature title"
              className="w-full h-10 rounded-xl border border-input bg-secondary/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={4} placeholder="Why does this matter?"
              className="w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-full flex-1" onClick={() => setSuggestOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="rounded-full flex-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}