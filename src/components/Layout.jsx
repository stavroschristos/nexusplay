import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { trackPageView } from '@/lib/analytics';
import { Gamepad2, Home, Compass, Settings, LogOut, Trophy, MessagesSquare, Users, Gamepad, Flame, Bell, Radio, Target, Sparkles, ShieldAlert, Megaphone, X, Rocket, Search, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import FeedbackWidget from '@/components/feedback/FeedbackWidget';
import { usePresence } from '@/hooks/usePresence';

const navGroups = [
  {
    items: [
      { icon: Home, label: 'Home', path: '/home' },
      { icon: Search, label: 'Search', path: '/search' },
      { icon: Radio, label: 'Gaming Radar', path: '/radar' },
      { icon: Compass, label: 'Discover', path: '/explore' },
    ],
  },
  {
    items: [
      { icon: Users, label: 'Communities', path: '/communities' },
      { icon: Gamepad, label: 'Games', path: '/games' },
      { icon: Target, label: 'Challenges', path: '/challenges' },
    ],
  },
  {
    items: [
      { icon: Sparkles, label: 'AI Assistant', path: '/assistant' },
      { icon: MessagesSquare, label: 'Messages', path: '/messages' },
      { icon: Flame, label: 'Wrapped', path: '/wrapped' },
      { icon: Rocket, label: 'Roadmap', path: '/roadmap' },
      { icon: GitBranch, label: 'Changelog', path: '/changelog' },
      { icon: Trophy, label: 'My Profile', path: '/profile' },
    ],
  },
];

const mobileNavItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Compass, label: 'Discover', path: '/explore' },
  { icon: Trophy, label: 'Profile', path: '/profile' },
  { icon: MessagesSquare, label: 'Messages', path: '/messages' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  usePresence();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [announcement, setAnnouncement] = useState(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnread = () => base44.entities.Notification.filter({ recipient_id: user?.id, read: false }).then((res) => setUnreadCount(res.length)).catch(() => {});
    fetchUnread();
    const unsubscribe = base44.entities.Notification.subscribe(fetchUnread);
    return unsubscribe;
  }, []);

  useEffect(() => {
    base44.entities.AdminSettings.list('-created_date', 5).then((res) => {
      if (res.length > 0 && res[0].announcement_active && res[0].announcement_title) {
        setAnnouncement({ title: res[0].announcement_title, body: res[0].announcement_body, type: res[0].announcement_type || 'info' });
      }
    }).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';
  const allGroups = isAdmin
    ? [...navGroups, { items: [{ icon: ShieldAlert, label: 'Admin', path: '/admin' }] }]
    : navGroups;
  const initials = (user?.display_name || user?.full_name || user?.email || 'G').charAt(0).toUpperCase();

  const ANNOUNCEMENT_STYLES = {
    info: 'bg-primary/10 border-primary/30 text-primary',
    update: 'bg-chart-2/10 border-chart-2/30 text-chart-2',
    warning: 'bg-chart-5/10 border-chart-5/30 text-chart-5',
    maintenance: 'bg-destructive/10 border-destructive/30 text-destructive',
  };

  const NavLink = ({ item, mobile = false }) => {
    const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        to={item.path}
        className={cn(
          mobile
            ? 'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors relative flex-1 min-w-0'
            : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
          active
            ? (mobile ? 'text-primary' : 'bg-primary text-primary-foreground glow')
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <item.icon className={mobile ? 'w-5 h-5' : 'w-5 h-5'} />
        {mobile ? <span className="text-[10px] font-medium truncate">{item.label}</span> : item.label}
        {item.path === '/notifications' && unreadCount > 0 && (
          <span className="absolute top-1 right-2 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:shadow-lg">Skip to content</a>
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 glass border-r border-border z-40">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow">
            <Gamepad2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">NEXUS</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-thin">
          {allGroups.map((group, gi) => (
            <div key={gi} className="space-y-0.5">
              {group.items.map((item) => <NavLink key={item.path} item={item} />)}
            </div>
          ))}
          <div className="space-y-0.5 pt-2 border-t border-border/50">
            <NavLink item={{ icon: Bell, label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, path: '/notifications' }} />
            <NavLink item={{ icon: Settings, label: 'Settings', path: '/settings' }} />
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Avatar className="w-9 h-9 ring-2 ring-primary/30">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.display_name || user?.full_name || 'Gamer'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.gamer_tag ? `@${user.gamer_tag}` : 'Set your gamer tag'}</p>
            </div>
          </Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" /> Log out
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-border z-40 safe-bottom">
        <div className="flex items-center justify-around px-1 py-2">
          {mobileNavItems.map((item) => <NavLink key={item.path} item={item} mobile />)}
        </div>
      </nav>

      <main id="main-content" className="flex-1 md:ml-64 pb-20 md:pb-0">
        {announcement && !announcementDismissed && (
          <div className={`mx-4 mt-4 p-3 rounded-xl border flex items-start gap-3 animate-slide-up ${ANNOUNCEMENT_STYLES[announcement.type] || ANNOUNCEMENT_STYLES.info}`}>
            <Megaphone className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{announcement.title}</p>
              {announcement.body && <p className="text-xs opacity-90 mt-0.5">{announcement.body}</p>}
            </div>
            <button onClick={() => setAnnouncementDismissed(true)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity" aria-label="Dismiss announcement"><X className="w-4 h-4" /></button>
          </div>
        )}
        <Outlet />
      </main>

      <FeedbackWidget />
    </div>
  );
}