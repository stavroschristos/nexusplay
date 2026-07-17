import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ConversationList({ conversations, users, activeId, onSelect }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [conversations]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm font-medium">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1">Start chatting from a gamer's profile or Explore page.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const otherId = conv.participant_ids.find((id) => id !== user?.id);
        const other = users[otherId];
        const initials = (other?.display_name || other?.full_name || 'G').charAt(0).toUpperCase();

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors',
              activeId === conv.id ? 'bg-primary/10' : 'hover:bg-secondary/40'
            )}
          >
            <Avatar className="w-11 h-11 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src={other?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm truncate">{other?.display_name || other?.full_name || 'Gamer'}</p>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {conv.last_message_preview || 'Say hi! 👋'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}