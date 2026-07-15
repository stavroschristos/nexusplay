import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { base44 } from '@/api/base44Client';
import { Gamepad2, Home, Compass, Settings, LogOut, Trophy, MessagesSquare, Users, Gamepad, Flame, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Compass, label: 'Discover', path: '/explore' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: Gamepad, label: 'Games', path: '/games' },
  { icon: MessagesSquare, label: 'Messages', path: '/messages' },
  { icon: Flame, label: 'Wrapped', path: '/wrapped' },
  { icon: Trophy, label: 'My Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const mobileNavItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Compass, label: 'Discover', path: '/explore' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: Trophy, label: 'Profile', path: '/profile' },
  { icon: Bell, label: 'Alerts', path: '/notifications' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    base44.entities.Notification.filter({ read: false }).then((res) => setUnreadCount(res.length)).catch(() => {});
    const unsubscribe = base44.entities.Notification.subscribe(() => {
      base44.entities.Notification.filter({ read: false }).then((res) => setUnreadCount(res.length)).catch(() => {});
    });
    return unsubscribe;
  }, []);

  const initials = (user?.display_name || user?.full_name || user?.email || 'G').charAt(0).toUpperCase();

  const NavLink = ({ item, mobile = false }) => {
    const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    return (
      <Link
        to={item.path}
        className={cn(
          mobile ? 'flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-colors relative' : 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative',
          active
            ? (mobile ? 'text-primary' : 'bg-primary text-primary-foreground glow')
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        <item.icon className={mobile ? 'w-5 h-5' : 'w-5 h-5'} />
        {mobile ? <span className="text-[10px] font-medium">{item.label}</span> : item.label}
        {item.path === '/notifications' && unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 glass border-r border-border z-40">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow">
            <Gamepad2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">NEXUS</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => <NavLink key={item.path} item={item} />)}
          <div className="px-3 py-2 mt-2">
            <NavLink item={{ icon: Bell, label: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`, path: '/notifications' }} />
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
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5" /> Log out
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-border z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => <NavLink key={item.path} item={item} mobile />)}
        </div>
      </nav>

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}