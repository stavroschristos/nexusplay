import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
};

export default function UserAvatar({ user, size = 'md', className }) {
  const initials = (user?.display_name || user?.full_name || 'G').charAt(0).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], 'ring-2 ring-primary/30', className)}>
      <AvatarImage src={user?.avatar_url} />
      <AvatarFallback className="bg-gradient-to-br from-primary/40 to-accent text-primary-foreground font-semibold">
        {initials !== 'G' ? (
          initials
        ) : (
          <Gamepad2 className={cn(iconSizes[size], 'opacity-80')} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}