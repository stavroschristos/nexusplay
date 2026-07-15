import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import GameAccountBadge from '@/components/profile/GameAccountBadge';
import AchievementCard from '@/components/profile/AchievementCard';
import { Loader2, Save, Plus, Trash2, Gamepad2, Trophy, X } from 'lucide-react';

const platforms = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Riot', 'Battle.net'];
const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export default function Settings() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ platform: 'PlayStation', username: '', level: 0 });
  const [savingAccount, setSavingAccount] = useState(false);

  const [achievements, setAchievements] = useState([]);
  const [showAchForm, setShowAchForm] = useState(false);
  const [newAch, setNewAch] = useState({ title: '', description: '', game: '', platform: 'PlayStation', rarity: 'Rare', earned_date: '' });
  const [savingAch, setSavingAch] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDisplayName(user?.display_name || '');
    setBio(user?.bio || '');
    setAvatarUrl(user?.avatar_url || '');
    setBannerUrl(user?.banner_url || '');
    Promise.all([
      base44.entities.GameAccount.filter({ created_by_id: user?.id }, '-created_date', 50),
      base44.entities.Achievement.filter({ created_by_id: user?.id }, '-earned_date', 50),
    ]).then(([accs, achs]) => {
      setAccounts(accs);
      setAchievements(achs);
    }).finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await base44.auth.updateMe({
        display_name: displayName,
        bio: bio,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
      await checkUserAuth();
      toast({ title: 'Profile updated!' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const addAccount = async () => {
    if (!newAccount.username.trim()) return;
    setSavingAccount(true);
    try {
      const acc = await base44.entities.GameAccount.create({
        platform: newAccount.platform,
        username: newAccount.username.trim(),
        level: Number(newAccount.level) || 0,
      });
      setAccounts((a) => [acc, ...a]);
      setNewAccount({ platform: 'PlayStation', username: '', level: 0 });
      setShowAccountForm(false);
    } catch {
      toast({ title: 'Failed to add account', variant: 'destructive' });
    } finally {
      setSavingAccount(false);
    }
  };

  const removeAccount = async (id) => {
    await base44.entities.GameAccount.delete(id);
    setAccounts((a) => a.filter((x) => x.id !== id));
  };

  const addAchievement = async () => {
    if (!newAch.title.trim() || !newAch.game.trim()) return;
    setSavingAch(true);
    try {
      const ach = await base44.entities.Achievement.create({
        ...newAch,
        earned_date: newAch.earned_date || undefined,
      });
      setAchievements((a) => [ach, ...a]);
      setNewAch({ title: '', description: '', game: '', platform: 'PlayStation', rarity: 'Rare', earned_date: '' });
      setShowAchForm(false);
    } catch {
      toast({ title: 'Failed to add achievement', variant: 'destructive' });
    } finally {
      setSavingAch(false);
    }
  };

  const removeAchievement = async (id) => {
    await base44.entities.Achievement.delete(id);
    setAchievements((a) => a.filter((x) => x.id !== id));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 pb-12">
      <h1 className="text-2xl font-bold font-heading">Settings</h1>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile</h2>
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your gamer tag" className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." className="bg-secondary/30 resize-none" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="bg-secondary/30" />
          </div>
          <div className="space-y-2">
            <Label>Banner URL</Label>
            <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." className="bg-secondary/30" />
          </div>
          <Button onClick={saveProfile} disabled={savingProfile} className="w-full">
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </div>
      </section>

      {/* Game Accounts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" /> Game Accounts
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowAccountForm(!showAccountForm)} className="rounded-full">
            {showAccountForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAccountForm ? 'Cancel' : 'Add'}
          </Button>
        </div>

        {showAccountForm && (
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Platform</Label>
                <select
                  value={newAccount.platform}
                  onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm"
                >
                  {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Level (optional)</Label>
                <Input type="number" value={newAccount.level} onChange={(e) => setNewAccount({ ...newAccount, level: e.target.value })} className="bg-secondary/30" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Username / Gamertag</Label>
              <Input value={newAccount.username} onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })} placeholder="YourHandle" className="bg-secondary/30" />
            </div>
            <Button onClick={addAccount} disabled={savingAccount || !newAccount.username.trim()} className="w-full">
              {savingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Account
            </Button>
          </div>
        )}

        {accounts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">No game accounts linked yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {accounts.map((a) => <GameAccountBadge key={a.id} account={a} onRemove={() => removeAccount(a.id)} />)}
          </div>
        )}
      </section>

      {/* Achievements Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Achievements
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowAchForm(!showAchForm)} className="rounded-full">
            {showAchForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAchForm ? 'Cancel' : 'Add'}
          </Button>
        </div>

        {showAchForm && (
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Achievement Title</Label>
              <Input value={newAch.title} onChange={(e) => setNewAch({ ...newAch, title: e.target.value })} placeholder="Platinum Trophy" className="bg-secondary/30" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea value={newAch.description} onChange={(e) => setNewAch({ ...newAch, description: e.target.value })} placeholder="Earned by completing all challenges..." className="bg-secondary/30 resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Game</Label>
                <Input value={newAch.game} onChange={(e) => setNewAch({ ...newAch, game: e.target.value })} placeholder="Game title" className="bg-secondary/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Platform</Label>
                <select
                  value={newAch.platform}
                  onChange={(e) => setNewAch({ ...newAch, platform: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm"
                >
                  {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Rarity</Label>
                <select
                  value={newAch.rarity}
                  onChange={(e) => setNewAch({ ...newAch, rarity: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm"
                >
                  {rarities.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date Earned</Label>
                <Input type="date" value={newAch.earned_date} onChange={(e) => setNewAch({ ...newAch, earned_date: e.target.value })} className="bg-secondary/30" />
              </div>
            </div>
            <Button onClick={addAchievement} disabled={savingAch || !newAch.title.trim() || !newAch.game.trim()} className="w-full">
              {savingAch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Achievement
            </Button>
          </div>
        )}

        {achievements.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">No achievements shared yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="relative group">
                <AchievementCard achievement={a} />
                <button
                  onClick={() => removeAchievement(a.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}