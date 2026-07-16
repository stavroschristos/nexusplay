import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Bell, Shield, ToggleLeft, ToggleRight, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const FEATURE_TOGGLES = [
  { key: 'feature_communities', label: 'Communities' },
  { key: 'feature_messaging', label: 'Messaging' },
  { key: 'feature_lfg', label: 'Looking For Group' },
  { key: 'feature_challenges', label: 'Challenges' },
  { key: 'feature_radar', label: 'Gaming Radar' },
  { key: 'feature_assistant', label: 'AI Assistant' },
  { key: 'feature_wrapped', label: 'Gaming Wrapped' },
  { key: 'feature_streams', label: 'Live Streams' },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.AdminSettings.list('-created_date', 10);
        if (list.length > 0) {
          setSettings(list[0]);
          setSettingsId(list[0].id);
        } else {
          const created = await base44.entities.AdminSettings.create({ platform_name: 'NexusPlay' });
          setSettings(created);
          setSettingsId(created.id);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  const update = async (patch) => {
    if (!settingsId) return;
    try {
      const updated = await base44.entities.AdminSettings.update(settingsId, patch);
      setSettings(updated);
      toast({ title: 'Settings saved' });
    } catch (e) { toast({ title: 'Failed to save', variant: 'destructive' }); }
  };

  const toggleFeature = (key) => {
    update({ [key]: !settings[key] });
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    const rules = [...(settings.community_rules || []), newRule.trim()];
    update({ community_rules: rules });
    setNewRule('');
  };

  const removeRule = (idx) => {
    const rules = (settings.community_rules || []).filter((_, i) => i !== idx);
    update({ community_rules: rules });
  };

  if (!settings) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Platform Settings</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Platform Name</Label>
            <Input value={settings.platform_name || ''} onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })} onBlur={(e) => update({ platform_name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Platform Tagline</Label>
            <Input value={settings.platform_tagline || ''} onChange={(e) => setSettings({ ...settings, platform_tagline: e.target.value })} onBlur={(e) => update({ platform_tagline: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Default User Role</Label>
            <select value={settings.default_user_role || 'user'} onChange={(e) => update({ default_user_role: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <Label className="text-xs">Max Collection Size</Label>
            <Input type="number" value={settings.max_collection_size || 100} onChange={(e) => setSettings({ ...settings, max_collection_size: Number(e.target.value) })} onBlur={(e) => update({ max_collection_size: Number(e.target.value) })} className="mt-1" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div>
            <p className="text-sm font-medium">Allow Public Signups</p>
            <p className="text-xs text-muted-foreground">Let new users self-register</p>
          </div>
          <Button size="sm" variant={settings.allow_public_signups ? 'default' : 'outline'} onClick={() => update({ allow_public_signups: !settings.allow_public_signups })}>
            {settings.allow_public_signups ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />} {settings.allow_public_signups ? 'On' : 'Off'}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ToggleLeft className="w-4 h-4 text-primary" /> Feature Toggles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {FEATURE_TOGGLES.map(f => (
            <button key={f.key} onClick={() => toggleFeature(f.key)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${settings[f.key] ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border opacity-60'}`}>
              <span className="font-medium">{f.label}</span>
              {settings[f.key] ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> App Announcement</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={settings.announcement_title || ''} onChange={(e) => setSettings({ ...settings, announcement_title: e.target.value })} onBlur={(e) => update({ announcement_title: e.target.value })} className="mt-1" placeholder="New feature available!" />
          </div>
          <div>
            <Label className="text-xs">Body</Label>
            <Textarea value={settings.announcement_body || ''} onChange={(e) => setSettings({ ...settings, announcement_body: e.target.value })} onBlur={(e) => update({ announcement_body: e.target.value })} className="mt-1" placeholder="Announce something to all users..." rows={2} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={settings.announcement_type || 'info'} onChange={(e) => update({ announcement_type: e.target.value })} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="info">Info</option>
              <option value="update">Update</option>
              <option value="warning">Warning</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <Button size="sm" variant={settings.announcement_active ? 'default' : 'outline'} onClick={() => update({ announcement_active: !settings.announcement_active })}>
              <Bell className="w-4 h-4" /> {settings.announcement_active ? 'Active' : 'Inactive'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card/50 border-border">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Community Rules</h3>
        <div className="space-y-2 mb-3">
          {(settings.community_rules || []).map((rule, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
              <span className="text-sm">{rule}</span>
              <Button size="sm" variant="ghost" onClick={() => removeRule(idx)}><span className="text-destructive">Remove</span></Button>
            </div>
          ))}
          {(settings.community_rules || []).length === 0 && <p className="text-xs text-muted-foreground">No rules defined yet.</p>}
        </div>
        <div className="flex gap-2">
          <Input value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Add a community rule..." onKeyDown={(e) => e.key === 'Enter' && addRule()} />
          <Button onClick={addRule}>Add</Button>
        </div>
      </Card>
    </div>
  );
}