import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { SkeletonList } from '@/components/shared/Skeleton';
import { Bell, Heart, MessageCircle, UserPlus, Repeat2, Trophy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig = {
  like: { icon: Heart, color: 'text-rose-400' },
  comment: { icon: MessageCircle, color: 'text-blue-400' },
  follow: { icon: UserPlus, color: 'text-emerald-400' },
  repost: { icon: Repeat2, color: 'text-emerald-400' },
  reaction: { icon: Bell, color: 'text-amber-400' },
  achievement: { icon: Trophy, color: 'text-amber-400' },
  system: { icon: Bell, color: 'text-muted-foreground' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.Notification.list('-created_date', 100).then(setNotifications).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    await base44.entities.Notification.updateMany({ id: { $in: unread.map((n) => n.id) } }, { $set: { read: true } });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PageHeader icon={Bell} title="Notifications" subtitle="Stay on top of your gaming social activity">
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </PageHeader>

      <div className="flex gap-1 mb-4 p-1 rounded-xl bg-card/50 border border-border">
        {['all', 'unread'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all', filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{f}</button>
        ))}
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title="All caught up" description="You have no notifications right now." />
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map((n) => {
            const config = typeConfig[n.type] || typeConfig.system;
            const Icon = config.icon;
            const link = n.link && n.link !== '' ? n.link : null;
            const Wrapper = link ? Link : 'div';
            const wrapperProps = link ? { to: link } : {};
            return (
              <Wrapper key={n.id} {...wrapperProps} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-colors', n.read ? 'border-border/50 bg-card/30' : 'border-primary/30 bg-primary/5', link && 'hover:bg-secondary/30 cursor-pointer')}>
                <div className="relative">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/20"><AvatarFallback className="bg-primary/20 text-primary">{(n.actor_name || 'G').charAt(0)}</AvatarFallback></Avatar>
                  <div className={cn('absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center', config.color)}><Icon className="w-3 h-3" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_date).toLocaleDateString()}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}