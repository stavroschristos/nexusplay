import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Mail, Download, Trash2, Shield, AlertTriangle, Loader2, LogOut, Pencil, FileText,
} from 'lucide-react';

export default function AccountSection() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const downloadData = async () => {
    setDownloading(true);
    try {
      const [accounts, achievements, collections, posts, reviews, topLists, setups, memories, milestones] = await Promise.all([
        base44.entities.GameAccount.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.Achievement.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.Collection.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.Post.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.GameReview.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.TopList.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.GamingSetup.filter({ created_by_id: user?.id }, '-created_date', 500),
        base44.entities.Memory.filter({ created_by_id: user?.id }, '-memory_date', 500),
        base44.entities.Timeline.filter({ created_by_id: user?.id }, '-year', 500),
      ]);
      const payload = {
        exported_at: new Date().toISOString(),
        account: {
          display_name: user?.display_name,
          gamer_tag: user?.gamer_tag,
          full_name: user?.full_name,
          email: user?.email,
          role: user?.role,
          bio: user?.bio,
          created_date: user?.created_date,
        },
        privacy: {
          privacy_profile: user?.privacy_profile,
          privacy_activity: user?.privacy_activity,
          privacy_achievements: user?.privacy_achievements,
          privacy_trophies: user?.privacy_trophies,
          privacy_library: user?.privacy_library,
          privacy_stats: user?.privacy_stats,
          privacy_friends: user?.privacy_friends,
          privacy_communities: user?.privacy_communities,
          privacy_current_game: user?.privacy_current_game,
          privacy_streaming: user?.privacy_streaming,
          dm_permission: user?.dm_permission,
        },
        game_accounts: accounts,
        achievements,
        collections,
        posts,
        reviews,
        top_lists: topLists,
        gaming_setups: setups,
        memories,
        milestones,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexusplay-data-${(user?.gamer_tag || user?.display_name || 'user').toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Your data has been downloaded' });
    } catch {
      toast({ title: 'Failed to download data', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      // Best-effort cleanup of personal content before removing the account.
      const owned = [
        base44.entities.GameAccount.filter({ created_by_id: user?.id }, '-created_date', 500).then((r) => base44.entities.GameAccount.deleteMany({ created_by_id: user?.id }).catch(() => {})),
        base44.entities.Achievement.filter({ created_by_id: user?.id }, '-created_date', 500).then((r) => base44.entities.Achievement.deleteMany({ created_by_id: user?.id }).catch(() => {})),
        base44.entities.Post.filter({ created_by_id: user?.id }, '-created_date', 500).then((r) => base44.entities.Post.deleteMany({ created_by_id: user?.id }).catch(() => {})),
        base44.entities.Block.deleteMany({ created_by_id: user?.id }).catch(() => {}),
      ];
      await Promise.allSettled(owned);
      await base44.auth.updateMe({ bio: '', avatar_url: '', banner_url: '', display_name: 'Deleted Gamer' });
      toast({ title: 'Account data cleared' });
      logout(false);
      navigate('/');
    } catch {
      toast({ title: 'Failed to delete account', variant: 'destructive' });
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Shield className="w-4 h-4" /> Account</h2>
        <p className="text-xs text-muted-foreground mt-1">Private account information is visible only to you. Your email is never shown publicly.</p>
      </div>

      {/* Private account info — owner only */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Account information</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">Private</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Email</p><p className="font-medium truncate">{user?.email || '—'}</p></div>
          <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Gamer tag</p><p className="font-medium truncate">{user?.gamer_tag || 'Not set'}</p></div>
          <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Display name</p><p className="font-medium truncate">{user?.display_name || 'Not set'}</p></div>
          <div className="rounded-lg bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Role</p><p className="font-medium capitalize">{user?.role || 'user'}</p></div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Button asChild variant="outline" className="rounded-xl h-auto py-4 justify-start">
          <div><Pencil className="w-4 h-4" /> <span className="text-sm font-medium">Edit profile & gaming identity</span></div>
        </Button>
        <Button variant="outline" className="rounded-xl h-auto py-4 justify-start" onClick={downloadData} disabled={downloading}>
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} <span className="text-sm font-medium">Download my data</span>
        </Button>
      </div>

      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Danger zone</h3>
        </div>
        <p className="text-xs text-muted-foreground">Deleting your account clears your profile, posts, achievements, connected accounts, and blocks. This cannot be undone.</p>
        {!confirmDelete ? (
          <Button variant="destructive" className="rounded-full" onClick={() => setConfirmDelete(true)}><Trash2 className="w-4 h-4" /> Delete account</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" className="rounded-full" onClick={deleteAccount} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Confirm delete
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Legal & policies</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/guidelines" className="hover:text-foreground">Community Guidelines</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookie Policy</Link>
          <Link to="/data-usage" className="hover:text-foreground">Data Usage</Link>
        </div>
      </div>

      <Button variant="ghost" className="rounded-full text-muted-foreground" onClick={() => logout()}>
        <LogOut className="w-4 h-4" /> Log out
      </Button>
    </div>
  );
}