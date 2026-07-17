import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonList } from '@/components/shared/Skeleton';
import { Bell, Heart, MessageCircle, UserPlus, Repeat2, Trophy, Check, MessageSquare, Users, Target, Sparkles, Award, Flag, Megaphone, Star, Gift } from 'lucide-react';
import { createNotification, markAllNotificationsRead, trackNotificationOpen } from '@/lib/notifications';
import { cn } from '@/lib/utils';

const typeConfig = {
  like: { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/15', category: 'social' },
  comment: { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/15', category: 'social' },
  reply: { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/15', category: 'social' },
  follow: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/15', category: 'social' },
  friend_request: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/15', category: 'social' },
  friend_accept: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/15', category: 'social' },
  repost: { icon: Repeat2, color: 'text-emerald-400', bg: 'bg-emerald-500/15', category: 'social' },
  reaction: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/15', category: 'social' },
  mention: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/15', category: 'social' },
  achievement: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/15', category: 'gaming' },
  trophy: { icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/15', category: 'gaming' },
  milestone: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/15', category: 'gaming' },
  challenge: { icon: Target, color: 'text-primary', bg: 'bg-primary/15', category: 'gaming' },
  compatibility: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/15', category: 'gaming' },
  community_invite: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/15', category: 'community' },
  community_announcement: { icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/15', category: 'community' },
  trending: { icon: Flag, color: 'text-emerald-400', bg: 'bg-emerald-500/15', category: 'community' },
  message: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/15', category: 'messaging' },
  featured: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/15', category: 'system' },
  announcement: { icon: Megaphone, color: 'text-amber-400', bg: 'bg-amber-500/15', category: 'system' },
  system: { icon: Bell, color: 'text-muted-foreground', bg: 'bg-secondary/40', category: 'system' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'social', label: 'Social' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'community', label: 'Community' },
  { key: 'messaging', label: 'Messages' },
];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await base44.entities.Notification.filter({ recipient_id: user.id }, '-created_date', 100);
      setNotifications(res);
    } catch {} finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Notification.subscribe(() => load());
    return unsubscribe;
  }, [user?.id]);

  const unread = notifications.filter((n) => !n.read);

  const handleMarkAllRead = async () => {
    if (unread.length === 0) return;
    await markAllNotificationsRead(unread);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true, read_at: n.read_at || new Date().toISOString() })));
  };

  const handleClick = async (n) => {
    if (!n.read) {
      const updated = await base44.entities.Notification.update(n.id, { read: true, read_at: new Date().toISOString() }).catch(() => n);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      void updated;
    }
    await trackNotificationOpen(n.id);
    if (n.link) navigate(n.link);
  };

  let filtered = notifications;
  if (filter === 'unread') filtered = unread;
  else if (filter !== 'all') filtered = notifications.filter((n) => (typeConfig[n.type]?.category || 'system') === filter);

  const countFor = (key) => {
    if (key === 'all') return notifications.length;
    if (key === 'unread') return unread.length;
    return notifications.filter((n) => (typeConfig[n.type]?.category || 'system') === key).length;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader icon={Bell} title="Notifications" subtitle="Your gaming world is always active">
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </PageHeader>

      {/* Category filters */}
      <div className="flex gap-1 mb-4 p-1 rounded-xl bg-card/50 border border-border overflow-x-auto scrollbar-thin">
        {FILTERS.map((f) => {
          const count = countFor(f.key);
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} className={cn('flex items-center gap-1.5 flex-1 min-w-max py-2 px-3 rounded-lg text-sm font-medium transition-all', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {f.label}
              {count > 0 && <span className={cn('text-[10px] px-1.5 rounded-full', active ? 'bg-primary-foreground/20' : 'bg-secondary')}>{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title={filter === 'unread' ? 'All caught up' : 'Nothing here yet'} description={filter === 'unread' ? 'You have no unread notifications.' : 'Notifications about your gaming activity will show up here.'} />
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map((n) => {
            const config = typeConfig[n.type] || typeConfig.system;
            const Icon = config.icon;
            const actorName = n.actor_name;
            const actorInitial = (actorName || 'G').charAt(0).toUpperCase();
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn('w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all', n.read ? 'border-border/50 bg-card/30' : 'border-primary/30 bg-primary/5 hover:bg-primary/10')}
              >
                <div className="relative shrink-0">
                  {actorName ? (
                    <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                      <AvatarImage src={null} />
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">{actorInitial}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={cn('w-10 h-10 rounded-full grid place-items-center', config.bg)}><Icon className={cn('w-5 h-5', config.color)} /></div>
                  )}
                  <div className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center ring-1 ring-border', config.bg)}>
                    <Icon className={cn('w-3 h-3', config.color)} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-sm font-semibold">{n.icon} {n.title}</p>}
                  <p className={cn('text-sm', n.read ? 'text-muted-foreground' : 'text-foreground')}>{n.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.created_date)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}