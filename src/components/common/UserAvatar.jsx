import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function UserAvatar({ user, size = 'md', className }) {
  const initials = (user?.display_name || user?.full_name || user?.email || 'G').charAt(0).toUpperCase();
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Avatar className={cn(sizeClasses[size], 'ring-2 ring-primary/30', className)}>
      <AvatarImage src={user?.avatar_url} />
      <AvatarFallback className="bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
    </Avatar>
  );
}