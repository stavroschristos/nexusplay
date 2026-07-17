import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, X, Upload, Loader2, Check, Sparkles, Bug, Lightbulb, MonitorSmartphone, Palette, Gauge, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { collectFeedbackContext } from '@/lib/feedback-context';
import StarRating from '@/components/feedback/StarRating';

const CATEGORIES = [
  { key: 'bug', label: 'Bug Report', icon: Bug },
  { key: 'feature', label: 'Feature Request', icon: Lightbulb },
  { key: 'ux', label: 'UX Issue', icon: MonitorSmartphone },
  { key: 'design', label: 'Design Feedback', icon: Palette },
  { key: 'performance', label: 'Performance Issue', icon: Gauge },
  { key: 'content', label: 'Content Issue', icon: FileText },
  { key: 'general', label: 'General Feedback', icon: MessageSquareText },
];

export default function FeedbackWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setCategory('general');
    setTitle('');
    setDescription('');
    setRating(0);
    setFile(null);
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      let screenshot_url = '';
      if (file) {
        const up = await base44.integrations.Core.UploadFile({ file });
        screenshot_url = up?.file_url || '';
      }
      const ctx = collectFeedbackContext(user);
      await base44.entities.Feedback.create({
        category,
        title: title.trim(),
        description: description.trim(),
        rating: rating || undefined,
        screenshot_url,
        ...ctx,
      });
      setDone(true);
    } catch (err) {
      toast({ title: 'Could not submit feedback', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setDone(false); }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 h-12 px-4 rounded-full bg-primary text-primary-foreground shadow-lg glow hover:scale-105 active:scale-95 transition-transform"
        aria-label="Send feedback"
      >
        <MessageSquareText className="w-5 h-5" />
        <span className="text-sm font-semibold hidden sm:inline">Send Feedback</span>
      </button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-xl font-heading font-bold">Thanks for helping improve the platform</h2>
              <p className="text-sm text-muted-foreground mt-2">Your feedback has been received. Our team reviews every submission.</p>
              <div className="flex flex-col gap-2 mt-6">
                <Button asChild variant="outline" className="rounded-full"><Link to="/roadmap" onClick={() => setOpen(false)}>See the roadmap & vote <Sparkles className="w-4 h-4" /></Link></Button>
                <Button variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>Close</Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><MessageSquareText className="w-5 h-5 text-primary" /> Send Feedback</DialogTitle>
                <DialogDescription>Report an issue or suggest an improvement. We automatically attach technical context so you don't have to.</DialogDescription>
              </DialogHeader>

              {user?.is_alpha_tester && (
                <div className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" /> Alpha Tester feedback — prioritized by the team.
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {CATEGORIES.map((c) => {
                      const Icon = c.icon;
                      const active = category === c.key;
                      return (
                        <button key={c.key} type="button" onClick={() => setCategory(c.key)}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${active ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                          <Icon className="w-3.5 h-3.5" /> <span className="truncate">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief summary"
                    className="w-full h-10 rounded-xl border border-input bg-secondary/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Details</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="What happened? What did you expect? Any steps to reproduce?"
                    className="w-full rounded-xl border border-input bg-secondary/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">How was your experience on this page?</label>
                  <div className="flex items-center gap-3">
                    <StarRating value={rating} onChange={setRating} />
                    <span className="text-xs text-muted-foreground">{rating ? ['', 'Very poor', 'Poor', 'OK', 'Good', 'Excellent'][rating] : 'Tap to rate'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Screenshot / recording (optional)</label>
                  <label className="flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-border cursor-pointer hover:border-primary/50 text-sm text-muted-foreground transition-colors">
                    <Upload className="w-4 h-4" />
                    {file ? <span className="text-foreground truncate max-w-[60%]">{file.name}</span> : 'Attach a screenshot or clip'}
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="text-[11px] text-muted-foreground/80 rounded-lg bg-secondary/20 border border-border/50 px-3 py-2">
                  We'll automatically include your page, browser, device, OS, and account so you don't have to type them.
                </div>

                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="rounded-full flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="rounded-full flex-1">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit feedback'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}