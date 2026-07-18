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
import ActivitySection from '@/components/settings/ActivitySection';
import CollectionsSection from '@/components/settings/CollectionsSection';
import MilestonesSection from '@/components/settings/MilestonesSection';
import StatsSection from '@/components/settings/StatsSection';
import CustomizeSection from '@/components/settings/CustomizeSection';
import AvatarUploader from '@/components/settings/AvatarUploader';
import BannerUploader from '@/components/settings/BannerUploader';
import { PROFILE_THEMES } from '@/components/profile/themeConfig';
import TopListsSection from '@/components/settings/TopListsSection';
import GamingSetupSection from '@/components/settings/GamingSetupSection';
import MemoriesSection from '@/components/settings/MemoriesSection';
import PrivacySection from '@/components/settings/PrivacySection';
import NotificationsSection from '@/components/settings/NotificationsSection';
import AccountSection from '@/components/settings/AccountSection';
import InviteSection from '@/components/settings/InviteSection';
import { createNotification } from '@/lib/notifications';
import { computeProfileCompletion, markActivatedIfNeeded, trackJourney } from '@/lib/journey';
import PageHeader from '@/components/shared/PageHeader';
import OnboardingResumeBanner from '@/components/onboarding/OnboardingResumeBanner';
import { Loader2, Save, Plus, Trash2, Gamepad2, Trophy, X, Palette, Settings as SettingsIcon, Shield } from 'lucide-react';

const platforms = ['PlayStation', 'Xbox', 'Steam', 'Nintendo', 'Epic Games', 'Riot', 'Battle.net'];
const allGenres = ['RPG', 'Action', 'Adventure', 'Shooter', 'Strategy', 'Horror', 'Racing', 'Sports', 'Fighting', 'Puzzle', 'Sandbox', 'MMO', 'Roguelike', 'Indie'];
const allPlatforms = ['PlayStation', 'Xbox', 'Steam', 'Nintendo Switch', 'PC', 'Mobile'];
const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export default function Settings() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [currentGame, setCurrentGame] = useState('');
  const [favoriteGames, setFavoriteGames] = useState('');
  const [favoriteFranchises, setFavoriteFranchises] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [platformsOwned, setPlatformsOwned] = useState([]);
  const [country, setCountry] = useState('');
  const [gamingQuote, setGamingQuote] = useState('');
  const [allTimeFav, setAllTimeFav] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState('');
  const [lifeChanging, setLifeChanging] = useState('');
  const [anticipated, setAnticipated] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ platform: 'PlayStation', username: '', level: 0 });
  const [savingAccount, setSavingAccount] = useState(false);

  const [achievements, setAchievements] = useState([]);
  const [showAchForm, setShowAchForm] = useState(false);
  const [newAch, setNewAch] = useState({ title: '', description: '', game: '', platform: 'PlayStation', rarity: 'Rare', earned_date: '' });
  const [savingAch, setSavingAch] = useState(false);

  const [collections, setCollections] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [topLists, setTopLists] = useState([]);
  const [setups, setSetups] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDisplayName(user?.display_name || '');
    setGamerTag(user?.gamer_tag || '');
    setBio(user?.bio || '');
    setAvatarUrl(user?.avatar_url || '');
    setBannerUrl(user?.banner_url || '');
    setCurrentGame(user?.current_game || '');
    setFavoriteGames((user?.favorite_games || []).join(', '));
    setFavoriteFranchises((user?.favorite_franchises || []).join(', '));
    setFavoriteGenres(user?.favorite_genres || []);
    setPlatformsOwned(user?.platforms_owned || []);
    setCountry(user?.country || '');
    setGamingQuote(user?.gaming_quote || '');
    setAllTimeFav((user?.all_time_favorites || []).join(', '));
    setCurrentlyPlaying((user?.currently_playing || []).join(', '));
    setLifeChanging((user?.life_changing_games || []).join(', '));
    setAnticipated((user?.anticipated_games || []).join(', '));
    Promise.all([
      base44.entities.GameAccount.filter({ created_by_id: user?.id }, '-created_date', 50),
      base44.entities.Achievement.filter({ created_by_id: user?.id }, '-earned_date', 50),
      base44.entities.Collection.filter({ created_by_id: user?.id }, '-created_date', 50),
      base44.entities.Timeline.filter({ created_by_id: user?.id }, '-year', 50),
      base44.entities.TopList.filter({ created_by_id: user?.id }, '-created_date', 50),
      base44.entities.GamingSetup.filter({ created_by_id: user?.id }, '-created_date', 50),
      base44.entities.Memory.filter({ created_by_id: user?.id }, '-memory_date', 50),
    ]).then(([accs, achs, cols, ms, tls, set, mems]) => {
      setAccounts(accs); setAchievements(achs); setCollections(cols); setMilestones(ms); setTopLists(tls); setSetups(set); setMemories(mems);
    }).finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const gamesArr = favoriteGames.split(',').map((g) => g.trim()).filter(Boolean);
      const allTimeArr = allTimeFav.split(',').map((g) => g.trim()).filter(Boolean);
      const playingArr = currentlyPlaying.split(',').map((g) => g.trim()).filter(Boolean);
      const lifeArr = lifeChanging.split(',').map((g) => g.trim()).filter(Boolean);
      const anticipArr = anticipated.split(',').map((g) => g.trim()).filter(Boolean);
      const preview = { ...user, avatar_url: avatarUrl, bio, favorite_games: gamesArr, all_time_favorites: allTimeArr, currently_playing: playingArr, gamer_tag: gamerTag, display_name: displayName, favorite_genres: favoriteGenres, platforms_owned: platformsOwned, current_game: currentGame };
      const completion = computeProfileCompletion(preview);
      await base44.auth.updateMe({
        display_name: displayName, gamer_tag: gamerTag, bio, avatar_url: avatarUrl, banner_url: bannerUrl,
        current_game: currentGame,
        favorite_games: gamesArr,
        favorite_franchises: favoriteFranchises.split(',').map((f) => f.trim()).filter(Boolean),
        favorite_genres: favoriteGenres,
        platforms_owned: platformsOwned,
        country,
        gaming_quote: gamingQuote,
        all_time_favorites: allTimeArr,
        currently_playing: playingArr,
        life_changing_games: lifeArr,
        anticipated_games: anticipArr,
        profile_completion: completion,
      });
      await checkUserAuth();
      if (avatarUrl && !user?.avatar_url) trackJourney('avatar_added');
      if (bio && !user?.bio) trackJourney('bio_added');
      if (gamesArr.length && !(user?.favorite_games || []).length) trackJourney('favorite_games_added');
      trackJourney('profile_saved', { completion });
      markActivatedIfNeeded({ ...preview, has_onboarded: user?.has_onboarded }).catch(() => {});
      toast({ title: 'Profile updated!' });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleGenre = (g) => setFavoriteGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  const togglePlatform = (p) => setPlatformsOwned((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const addAccount = async () => {
    if (!newAccount.username.trim()) return;
    setSavingAccount(true);
    try {
      const acc = await base44.entities.GameAccount.create({ platform: newAccount.platform, username: newAccount.username.trim(), level: Number(newAccount.level) || 0, connection_method: 'manual', status: 'active', connected_at: new Date().toISOString() });
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
      const ach = await base44.entities.Achievement.create({ ...newAch, earned_date: newAch.earned_date || undefined });
      setAchievements((a) => [ach, ...a]);
      setNewAch({ title: '', description: '', game: '', platform: 'PlayStation', rarity: 'Rare', earned_date: '' });
      setShowAchForm(false);
      const icon = newAch.rarity === 'Legendary' ? '🏆' : newAch.rarity === 'Epic' ? '🥇' : '🎖️';
      await createNotification({
        recipientId: user?.id, type: 'achievement', force: true,
        title: 'Achievement unlocked!', icon,
        content: `You unlocked "${newAch.title}" in ${newAch.game}.`,
        link: '/profile', actorId: user?.id,
      });
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 pb-12 animate-fade-in">
      <PageHeader icon={SettingsIcon} title="Settings" subtitle="Manage your profile, accounts, and gaming identity" />

      {user?.onboarding_started && !user?.has_onboarded && <OnboardingResumeBanner user={user} />}

      <AccountSection />

      <InviteSection />

      <section><PrivacySection /></section>

      <section><NotificationsSection /></section>

      {/* Activity Logging */}
      <ActivitySection onLogged={() => toast({ title: 'Activity shared!' })} />

      {/* Profile Customization (theme, identity dimensions, habits) */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Palette className="w-4 h-4" /> Profile Customization</h2>
        <CustomizeSection user={user} onSaved={() => checkUserAuth()} />
      </section>

      {/* Achievement Showcase pins */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Trophy className="w-4 h-4" /> Achievement Showcase</h2>
        <p className="text-xs text-muted-foreground">Pin your proudest trophies to feature them on your profile.</p>
        {achievements.length === 0 ? <p className="text-center text-muted-foreground py-4 text-sm">No achievements yet.</p> : (
          <div className="grid sm:grid-cols-2 gap-2">
            {achievements.map((a) => (
              <button
                key={a.id}
                onClick={async () => {
                  try {
                    await base44.entities.Achievement.update(a.id, { is_showcased: !a.is_showcased });
                    setAchievements((prev) => prev.map((x) => x.id === a.id ? { ...x, is_showcased: !x.is_showcased } : x));
                  } catch { toast({ title: 'Failed to update', variant: 'destructive' }); }
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${a.is_showcased ? 'border-amber-500/50 bg-amber-500/10' : 'border-border bg-card/50 hover:border-primary/40'}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.is_showcased ? 'bg-amber-500/20' : 'bg-secondary/40'}`}>
                  <Trophy className={`w-4 h-4 ${a.is_showcased ? 'text-amber-400' : 'text-muted-foreground'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.game} · {a.rarity}</p>
                </div>
                {a.is_showcased && <span className="text-[10px] font-bold uppercase text-amber-400">Pinned</span>}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Top Lists */}
      <section><TopListsSection lists={topLists} onAdded={(l) => setTopLists((prev) => [l, ...prev])} onRemoved={(id) => setTopLists((prev) => prev.filter((l) => l.id !== id))} /></section>

      {/* Gaming Setup */}
      <section><GamingSetupSection setups={setups} onAdded={(s) => setSetups((prev) => [s, ...prev])} onRemoved={(id) => setSetups((prev) => prev.filter((s) => s.id !== id))} /></section>

      {/* Gaming Memories */}
      <section><MemoriesSection memories={memories} onAdded={(m) => setMemories((prev) => [m, ...prev])} onRemoved={(id) => setMemories((prev) => prev.filter((x) => x.id !== id))} /></section>

      {/* Profile */}
      <section id="edit-profile" className="space-y-4 scroll-mt-24">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile</h2>
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Display Name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your public name" className="bg-secondary/30" /></div>
            <div className="space-y-2"><Label>Gamer Tag</Label><Input value={gamerTag} onChange={(e) => setGamerTag(e.target.value)} placeholder="Unique handle (never your email)" className="bg-secondary/30" /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Current Game</Label><Input value={currentGame} onChange={(e) => setCurrentGame(e.target.value)} placeholder="What are you playing now?" className="bg-secondary/30" /></div>
          </div>
          <div className="space-y-2"><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." className="bg-secondary/30 resize-none" rows={3} /></div>
          <div className="space-y-2"><Label>Avatar</Label><AvatarUploader value={avatarUrl} onChange={setAvatarUrl} displayName={displayName} /></div>
          <div className="space-y-2"><Label>Profile Banner</Label><BannerUploader value={bannerUrl} onChange={setBannerUrl} themeBanner={PROFILE_THEMES[user?.profile_theme || 'nebula']?.banner} /></div>
          <div className="space-y-2"><Label>Favorite Games (comma separated)</Label><Input value={favoriteGames} onChange={(e) => setFavoriteGames(e.target.value)} placeholder="Elden Ring, Valorant..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>Favorite Franchises (comma separated)</Label><Input value={favoriteFranchises} onChange={(e) => setFavoriteFranchises(e.target.value)} placeholder="Final Fantasy, Halo..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>Gaming Quote / Tagline</Label><Input value={gamingQuote} onChange={(e) => setGamingQuote(e.target.value)} placeholder="A gamer without a history is just a player..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>All-Time Favorites (comma separated)</Label><Input value={allTimeFav} onChange={(e) => setAllTimeFav(e.target.value)} placeholder="Final Fantasy IX, The Witcher 3..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>Currently Playing (comma separated)</Label><Input value={currentlyPlaying} onChange={(e) => setCurrentlyPlaying(e.target.value)} placeholder="Elden Ring, Hades II..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>Games That Changed My Life (comma separated)</Label><Input value={lifeChanging} onChange={(e) => setLifeChanging(e.target.value)} placeholder="Final Fantasy VII, Dark Souls..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>Most Anticipated (comma separated)</Label><Input value={anticipated} onChange={(e) => setAnticipated(e.target.value)} placeholder="GTA VI, Fable..." className="bg-secondary/30" /></div>
          <div className="space-y-2"><Label>Favorite Genres</Label><div className="flex flex-wrap gap-1.5">{allGenres.map((g) => <button key={g} onClick={() => toggleGenre(g)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${favoriteGenres.includes(g) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}>{g}</button>)}</div></div>
          <div className="space-y-2"><Label>Platforms Owned</Label><div className="flex flex-wrap gap-1.5">{allPlatforms.map((p) => <button key={p} onClick={() => togglePlatform(p)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${platformsOwned.includes(p) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'}`}>{p}</button>)}</div></div>
          <div className="space-y-2"><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Your country" className="bg-secondary/30" /></div>
          <Button onClick={saveProfile} disabled={savingProfile} className="w-full">{savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile</Button>
        </div>
      </section>

      {/* Stats */}
      <section><StatsSection user={user} onSaved={() => checkUserAuth()} /></section>

      {/* Game Accounts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Gamepad2 className="w-4 h-4" /> Connected Accounts</h2>
          <Button variant="outline" size="sm" onClick={() => setShowAccountForm(!showAccountForm)} className="rounded-full">{showAccountForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showAccountForm ? 'Cancel' : 'Add'}</Button>
        </div>
        <p className="text-xs text-muted-foreground -mt-2 flex items-start gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Manual handles only store your public username — we never ask for or store your platform password. You can disconnect any account at any time.</p>
        {showAccountForm && (
          <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">Platform</Label><select value={newAccount.platform} onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">{platforms.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
              <div className="space-y-2"><Label className="text-xs">Level</Label><Input type="number" value={newAccount.level} onChange={(e) => setNewAccount({ ...newAccount, level: e.target.value })} className="bg-secondary/30" /></div>
            </div>
            <div className="space-y-2"><Label className="text-xs">Username</Label><Input value={newAccount.username} onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })} placeholder="YourHandle" className="bg-secondary/30" /></div>
            <Button onClick={addAccount} disabled={savingAccount || !newAccount.username.trim()} className="w-full">{savingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Account</Button>
          </div>
        )}
        {accounts.length === 0 ? <p className="text-center text-muted-foreground py-4 text-sm">No gaming handles added yet.</p> : (
          <div className="grid sm:grid-cols-2 gap-3">{accounts.map((a) => <GameAccountBadge key={a.id} account={a} onRemove={() => removeAccount(a.id)} />)}</div>
        )}
        <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Official platform connections</h3>
            <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">Coming Soon</span>
          </div>
          <p className="text-xs text-muted-foreground">Securely import your library, achievements, and playtime using each platform's official OAuth login. Your password is never shared with or stored by NexusPlay.</p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button key={p} disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/40 text-muted-foreground cursor-not-allowed opacity-70 border border-border">
                {p} <span className="text-[9px] uppercase">Soon</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Trophy className="w-4 h-4" /> Achievements</h2>
          <Button variant="outline" size="sm" onClick={() => setShowAchForm(!showAchForm)} className="rounded-full">{showAchForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{showAchForm ? 'Cancel' : 'Add'}</Button>
        </div>
        {showAchForm && (
          <div className="rounded-2xl border border-border bg-card/50 p-5 space-y-3">
            <div className="space-y-2"><Label className="text-xs">Title</Label><Input value={newAch.title} onChange={(e) => setNewAch({ ...newAch, title: e.target.value })} placeholder="Platinum Trophy" className="bg-secondary/30" /></div>
            <div className="space-y-2"><Label className="text-xs">Description</Label><Textarea value={newAch.description} onChange={(e) => setNewAch({ ...newAch, description: e.target.value })} placeholder="..." className="bg-secondary/30 resize-none" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">Game</Label><Input value={newAch.game} onChange={(e) => setNewAch({ ...newAch, game: e.target.value })} placeholder="Game title" className="bg-secondary/30" /></div>
              <div className="space-y-2"><Label className="text-xs">Platform</Label><select value={newAch.platform} onChange={(e) => setNewAch({ ...newAch, platform: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">{platforms.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label className="text-xs">Rarity</Label><select value={newAch.rarity} onChange={(e) => setNewAch({ ...newAch, rarity: e.target.value })} className="w-full h-9 rounded-md border border-input bg-secondary/30 px-3 text-sm">{rarities.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
              <div className="space-y-2"><Label className="text-xs">Date Earned</Label><Input type="date" value={newAch.earned_date} onChange={(e) => setNewAch({ ...newAch, earned_date: e.target.value })} className="bg-secondary/30" /></div>
            </div>
            <Button onClick={addAchievement} disabled={savingAch || !newAch.title.trim() || !newAch.game.trim()} className="w-full">{savingAch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Achievement</Button>
          </div>
        )}
        {achievements.length === 0 ? <p className="text-center text-muted-foreground py-4 text-sm">No achievements yet.</p> : (
          <div className="grid sm:grid-cols-2 gap-3">{achievements.map((a) => (
            <div key={a.id} className="relative group"><AchievementCard achievement={a} />
              <button onClick={() => removeAchievement(a.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}</div>
        )}
      </section>

      {/* Collections */}
      <section><CollectionsSection collections={collections} onAdded={(c) => setCollections((prev) => [c, ...prev])} onRemoved={(id) => setCollections((prev) => prev.filter((c) => c.id !== id))} /></section>

      {/* Milestones */}
      <section><MilestonesSection milestones={milestones} onAdded={(m) => setMilestones((prev) => [...prev, m])} onRemoved={(id) => setMilestones((prev) => prev.filter((m) => m.id !== id))} /></section>
    </div>
  );
}