import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import ConversationList from '@/components/messages/ConversationList';
import ChatWindow from '@/components/messages/ChatWindow';
import { MessagesSquare } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState({});
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.User.list().then((all) => {
      const map = {};
      all.forEach((u) => { map[u.id] = u; });
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
      <div className="flex items-center gap-2 px-4 md:px-0 mb-4 md:mb-6">
        <MessagesSquare className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold font-heading">Messages</h1>
      </div>

      <div className="md:rounded-2xl md:border border-border bg-card/50 md:backdrop-blur-sm overflow-hidden h-[calc(100vh-12rem)] md:h-[calc(100vh-9rem)] flex">
        {/* Conversation List */}
        <div className={`w-full md:w-80 md:border-r border-border flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="flex justify-center py-12 text-muted-foreground text-sm">Loading...</div>
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