import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAdminAction } from '@/lib/admin-audit';
import { refreshFlags } from '@/lib/feature-flags';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Plus, Flag } from 'lucide-react';

const DEFAULT_FLAGS = [
  { key: 'ai_assistant', label: 'AI Gaming Assistant', description: 'Conversational gaming assistant', release_status: 'beta', visibility: 'global', enabled: true, category: 'AI' },
  { key: 'gaming_radar', label: 'Gaming Radar', description: 'Recommendation engine for new games', release_status: 'beta', visibility: 'global', enabled: true, category: 'AI' },
  { key: 'demo_mode', label: 'Demo Mode', description: 'Show seeded demo content across the app', release_status: 'internal', visibility: 'admins', enabled: false, category: 'Internal' },
  { key: 'streaming', label: 'Streaming Integration', description: 'Live stream discovery and embeds', release_status: 'alpha', visibility: 'alpha_testers', enabled: false, category: 'Social' },
  { key: 'marketplace', label: 'Marketplace', description: 'Buy, sell, and trade game items', release_status: 'alpha', visibility: 'alpha_testers', enabled: false, category: 'Commerce' },
  { key: 'ai_recommendations', label: 'AI Recommendations', description: 'Personalized content recommendations', release_status: 'beta', visibility: 'global', enabled: true, category: 'AI' },
  { key: 'communities', label: 'Communities', description: 'User-created community spaces', release_status: 'stable', visibility: 'global', enabled: true, category: 'Social' },
  { key: 'messaging', label: 'Messaging', description: 'Direct messages between users', release_status: 'stable', visibility: 'global', enabled: true, category: 'Social' },
  { key: 'collections', label: 'Collections', description: 'Curated game collections', release_status: 'stable', visibility: 'global', enabled: true, category: 'Social' },
  { key: 'wrapped', label: 'Gaming Wrapped', description: 'Annual gaming summary', release_status: 'beta', visibility: 'global', enabled: true, category: 'Engagement' },
  { key: 'creator_features', label: 'Creator Features', description: 'Enhanced tools for content creators', release_status: 'alpha', visibility: 'alpha_testers', enabled: false, category: 'Social' },
  { key: 'beta_features', label: 'Beta Features', description: 'Master gate for all beta-tier features', release_status: 'beta', visibility: 'alpha_testers', enabled: false, category: 'Internal' },
];

const VISIBILITY_LABEL = { global: 'Global', alpha_testers: 'Alpha testers', admins: 'Admins only' };
const STATUS_COLOR = { stable: 'text-emerald-400', beta: 'text-primary', alpha: 'text-amber-400', internal: 'text-muted-foreground', deprecated: 'text-rose-400' };

export default function AdminFeatureFlags() {
  const { toast } = useToast();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: '', label: '', description: '', visibility: 'global' });

  const load = async () => {
    setLoading(true);
    let f = await base44.entities.FeatureFlag.list().catch(() => []);
    if (f.length === 0) {
      await Promise.all(DEFAULT_FLAGS.map((d) => base44.entities.FeatureFlag.create({ ...d, last_modified: new Date().toISOString(), modified_by: 'system' })));
      f = await base44.entities.FeatureFlag.list();
    }
    setFlags(f);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (flag) => {
    const me = await base44.auth.me().catch(() => null);
    const enabled = !flag.enabled;
    await base44.entities.FeatureFlag.update(flag.id, { enabled, last_modified: new Date().toISOString(), modified_by: me?.display_name || me?.full_name || 'Admin' });
    await logAdminAction({ action: 'feature_status_change', targetType: 'settings', targetId: flag.key, targetLabel: flag.label, details: `${flag.label} ${enabled ? 'enabled' : 'disabled'}` });
    refreshFlags();
    toast({ title: `${flag.label} ${enabled ? 'enabled' : 'disabled'}` });
    load();
  };

  const setVisibility = async (flag, visibility) => {
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.FeatureFlag.update(flag.id, { visibility, last_modified: new Date().toISOString(), modified_by: me?.display_name || me?.full_name || 'Admin' });
    refreshFlags();
    toast({ title: `${flag.label} → ${VISIBILITY_LABEL[visibility]}` });
    load();
  };

  const create = async () => {
    if (!newFlag.key || !newFlag.label) { toast({ title: 'Key and label required', variant: 'destructive' }); return; }
    const me = await base44.auth.me().catch(() => null);
    await base44.entities.FeatureFlag.create({ ...newFlag, enabled: false, release_status: 'beta', category: 'custom', last_modified: new Date().toISOString(), modified_by: me?.display_name || 'Admin' });
    await logAdminAction({ action: 'feature_flag_create', targetType: 'settings', targetId: newFlag.key, targetLabel: newFlag.label, details: `Created flag ${newFlag.key}` });
    refreshFlags();
    setNewFlag({ key: '', label: '', description: '', visibility: 'global' });
    setShowNew(false);
    toast({ title: 'Flag created' });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  const categories = [...new Set(flags.map((f) => f.category || 'general'))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Toggle features without redeploying. Visibility controls who sees an enabled feature.</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
          <Button size="sm" onClick={() => setShowNew(!showNew)}><Plus className="w-4 h-4" /> New Flag</Button>
        </div>
      </div>

      {showNew && (
        <Card className="p-4 bg-card/50 border-border space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="key (e.g. my_feature)" value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })} />
            <Input placeholder="Display label" value={newFlag.label} onChange={(e) => setNewFlag({ ...newFlag, label: e.target.value })} />
          </div>
          <Input placeholder="Description" value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} />
          <div className="flex items-center justify-between">
            <select value={newFlag.visibility} onChange={(e) => setNewFlag({ ...newFlag, visibility: e.target.value })} className="text-sm bg-secondary/50 border border-border rounded-md px-2 py-1.5">
              <option value="global">Global</option>
              <option value="alpha_testers">Alpha testers</option>
              <option value="admins">Admins only</option>
            </select>
            <Button size="sm" onClick={create}>Create</Button>
          </div>
        </Card>
      )}

      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
          <div className="space-y-2">
            {flags.filter((f) => (f.category || 'general') === cat).map((flag) => (
              <Card key={flag.id} className="p-3 bg-card/50 border-border flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Flag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{flag.label}</span>
                    <Badge variant="outline" className={`text-[9px] ${STATUS_COLOR[flag.release_status] || ''}`}>{flag.release_status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{flag.description || flag.key}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{flag.modified_by ? `Modified by ${flag.modified_by}` : ''} {flag.last_modified ? `· ${new Date(flag.last_modified).toLocaleDateString()}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select value={flag.visibility || 'global'} onChange={(e) => setVisibility(flag, e.target.value)} className="text-[10px] bg-secondary/50 border border-border rounded-md px-1.5 py-1">
                    <option value="global">Global</option>
                    <option value="alpha_testers">Alpha</option>
                    <option value="admins">Admins</option>
                  </select>
                  <button
                    onClick={() => toggle(flag)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${flag.enabled ? 'bg-primary' : 'bg-secondary'}`}
                    aria-label={`Toggle ${flag.label}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${flag.enabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}