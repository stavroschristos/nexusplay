import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function ChatWindow({ conversation, otherUser, onBack }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;
    let active = true;
    setLoading(true);
    base44.entities.Message.filter({ conversation_id: conversation.id }, 'created_date', 100)
      .then((res) => {
        if (active) setMessages(res);
      })
      .finally(() => { if (active) setLoading(false); });

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== conversation.id) return;
      if (event.type === 'create') {
        setMessages((m) => [...m, event.data]);
      } else if (event.type === 'delete') {
        setMessages((m) => m.filter((msg) => msg.id !== event.data.id));
      }
    });

    return () => { active = false; unsubscribe(); };
  }, [conversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      const msg = await base44.entities.Message.create({ conversation_id: conversation.id, content });
      setMessages((m) => [...m, msg]);
      await base44.entities.Conversation.update(conversation.id, {
        last_message_preview: content,
        last_message_at: new Date().toISOString(),
      });
    } catch {
      setText(content);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full text-muted-foreground">
        <Send className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  const initials = (otherUser?.display_name || otherUser?.full_name || otherUser?.email || 'G').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass">
        <button onClick={onBack} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link to={`/profile/${otherUser?.id}`}>
          <Avatar className="w-9 h-9 ring-2 ring-primary/20">
            <AvatarImage src={otherUser?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <Link to={`/profile/${otherUser?.id}`} className="hover:underline">
          <p className="font-semibold text-sm">{otherUser?.display_name || otherUser?.full_name || 'Gamer'}</p>
        </Link>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hi! 👋</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.created_by_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    mine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-secondary text-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border glass">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type a message..."
            className="flex-1 h-10 rounded-full bg-secondary/50 border border-border px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}