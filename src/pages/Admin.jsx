import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { LayoutDashboard, Gamepad2, Flag, BarChart3, Settings as SettingsIcon, ShieldAlert, UserCheck, MessageSquare, Crown, Gift, LineChart, Activity, Database } from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminGaming from '@/components/admin/AdminGaming';
import AdminModeration from '@/components/admin/AdminModeration';
import AdminFeatures from '@/components/admin/AdminFeatures';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminRegistration from '@/components/admin/AdminRegistration';
import AdminFeedback from '@/components/admin/AdminFeedback';
import AdminNotifications from '@/components/admin/AdminNotifications';
import AdminInvites from '@/components/admin/AdminInvites';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminFounder from '@/components/admin/AdminFounder';
import AdminHealth from '@/components/admin/AdminHealth';
import AdminObservability from '@/components/admin/AdminObservability';
import AdminFeatureFlags from '@/components/admin/AdminFeatureFlags';
import AdminBackups from '@/components/admin/AdminBackups';
import AdminReports from '@/components/admin/AdminReports';
import { Bell } from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'health', label: 'Health', icon: Activity },
  { key: 'observability', label: 'Observability', icon: BarChart3 },
  { key: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { key: 'moderation', label: 'Moderation', icon: Flag },
  { key: 'registration', label: 'Registration', icon: UserCheck },
  { key: 'invites', label: 'Invites', icon: Gift },
  { key: 'founder', label: 'Founder', icon: Crown },
  { key: 'feedback', label: 'Feedback', icon: MessageSquare },
  { key: 'analytics', label: 'Analytics', icon: LineChart },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'features', label: 'Features', icon: BarChart3 },
  { key: 'featureflags', label: 'Flags', icon: Flag },
  { key: 'reports', label: 'Reports', icon: LineChart },
  { key: 'backups', label: 'Backups', icon: Database },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Admin() {
  const { user, isLoadingAuth } = useAuth();
  const [tab, setTab] = useState('overview');
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    base44.entities.Report.filter({ status: 'pending' }).then(r => setPendingReports(r.length)).catch(() => {});
  }, [tab]);

  if (isLoadingAuth) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <ShieldAlert className="w-14 h-14 text-destructive/50 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-sm text-muted-foreground">You need administrator privileges to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow">
          <ShieldAlert className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Platform operations &amp; analytics</p>
        </div>
      </div>

      <div className="flex gap-1 my-4 p-1 rounded-xl bg-card/50 border border-border overflow-x-auto scrollbar-thin">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 min-w-max py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.key === 'moderation' && pendingReports > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{pendingReports > 9 ? '9+' : pendingReports}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'health' && <AdminHealth />}
      {tab === 'observability' && <AdminObservability />}
      {tab === 'gaming' && <AdminGaming />}
      {tab === 'moderation' && <AdminModeration />}
      {tab === 'features' && <AdminFeatures />}
      {tab === 'featureflags' && <AdminFeatureFlags />}
      {tab === 'reports' && <AdminReports />}
      {tab === 'backups' && <AdminBackups />}
      {tab === 'registration' && <AdminRegistration />}
      {tab === 'feedback' && <AdminFeedback />}
      {tab === 'invites' && <AdminInvites />}
      {tab === 'founder' && <AdminFounder />}
      {tab === 'analytics' && <AdminAnalytics />}
      {tab === 'notifications' && <AdminNotifications />}
      {tab === 'settings' && <AdminSettings />}
    </div>
  );
}