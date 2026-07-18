import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { MessagesSquare, Loader2 } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    base44.functions.invoke('publicUsers', { action: 'list' }).then((r) => {
      const map = {};
      (r.data.users || []).forEach((u) => { map[u.id] = u; });
      setUsers(map);
    });
    loadConversations();
  }, [user?.id]);

  useEffect(() => {
    const targetId = location.state?.conversationId;
    if (targetId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === targetId);
      if (conv) setActiveConv(conv);
    }
  }, [location.state, conversations]);

  const loadConversations = async () => {
    const all = await base44.entities.Conversation.list('-last_message_at', 100);
    const mine = all.filter((c) => c.participant_ids?.includes(user?.id));
    setConversations(mine);
    setLoading(false);

    const unsubscribe = base44.entities.Conversation.subscribe((event) => {
      if (!event.data?.participant_ids?.includes(user?.id)) return;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === event.data.id);
        if (event.type === 'create' && idx === -1) return [...prev, event.data];
        if (event.type === 'update' && idx >= 0) {
          const next = [...prev];
          next[idx] = event.data;
          next.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
          return next;
        }
        if (event.type === 'delete' && idx >= 0) return prev.filter((c) => c.id !== event.data.id);
        return prev;
      });
    });
    return unsubscribe;
  };

  const otherUser = activeConv ? users[activeConv.participant_ids.find((id) => id !== user?.id)] : null;

  const showChat = !!activeConv;

  return (
    <div className="max-w-4xl mx-auto px-0 md:px-4 md:py-6">
      <div className="px-4 md:px-0">
        <PageHeader icon={MessagesSquare} title="Messages" />
      </div>

      <div className="md:rounded-2xl md:border border-border bg-card/50 md:backdrop-blur-sm overflow-hidden h-[calc(100vh-12rem)] md:h-[calc(100vh-9rem)] flex">
        {/* Conversation List */}
        <div className={`w-full md:w-80 md:border-r border-border flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={MessagesSquare}
                title="No messages yet"
                description="NexusPlay connects you with gamers who match your taste — start a conversation."
                action={<Link to="/explore" className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Find Gamers</Link>}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                users={users}
                activeId={activeConv?.id}
                onSelect={setActiveConv}
              />
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 ${showChat ? 'flex' : 'hidden md:flex'} flex-col`}>
          <ChatWindow
            conversation={activeConv}
            otherUser={otherUser}
            onBack={() => setActiveConv(null)}
          />
        </div>
      </div>
    </div>
  );
}