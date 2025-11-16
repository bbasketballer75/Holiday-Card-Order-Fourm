'use client'

import { useState, useEffect } from 'react'
import ForumList from './ForumList'
import ForumInput from './ForumInput'
import { supabase } from '../lib/supabaseClient'

interface Message {
  id: string;
  user: string;
  text: string;
  created_at: string;
  // UI-only fields for optimistic updates
  pending?: boolean;
  failed?: boolean;
  local?: boolean;
}

export default function ForumApp() {
  const [items, setItems] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(10);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    if (!supabase) {
      // If Supabase isn't configured (e.g., local dev without env vars),
      // we should stop loading so the client-side UI (input form) can render.
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('forum_messages')
      .select('id, "user", text, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async (text: string) => {
    // Optimistic UI: insert a temporary pending message immediately
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tempMsg: Message = {
      id: tempId,
      user: 'Visitor',
      text,
      created_at: new Date().toISOString(),
      pending: !!supabase,
      local: true,
    };
    setItems((prev) => [tempMsg, ...prev]);
    setAnnouncement(`New message by ${tempMsg.user}`);
    // clear announcement after a short delay
    setTimeout(() => setAnnouncement(''), 3000);

    if (!supabase) return;

    const { data, error } = await supabase
      .from('forum_messages')
      .insert([{ user: 'Visitor', text }])
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      // mark temp message as failed
      setItems((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)),
      );
    } else {
      // replace temp message with server-provided record
      setItems((prev) => prev.map((m) => (m.id === tempId ? (data as Message) : m)));
    }
  };

  // Reply handler: create a new message that references the original user in text
  const handleReply = async (parentUser: string, replyText: string) => {
    const text = `Reply to ${parentUser}: ${replyText}`;
    await handleAdd(text);
  };

  const handleLike = async (messageId: string, action: 'like' | 'unlike') => {
    try {
      const resp = await fetch('/api/forum/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action, userName: 'Visitor' }),
      })
      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || 'Like API error')
      }
      // refresh messages to reflect counts/state
      await fetchMessages()
    } catch (err) {
      console.error('Like API error', err)
    }
  }

  const loadMore = () => setVisibleCount((v) => v + 10);

  if (loading)
    return (
      <div role="status" aria-live="polite">
        Loading messages…
      </div>
    );

  return (
    <div>
      <ForumInput onAdd={handleAdd} />
      {/* Announce new messages for screen readers */}
      <div aria-live="polite" className="sr-only">{announcement}</div>
      <ForumList items={items.slice(0, visibleCount)} onReply={handleReply} onLike={handleLike} />
      {items.length > visibleCount && (
        <div className="text-center mt-6">
          <button onClick={loadMore} className="btn-holiday-secondary">
            Load more messages
          </button>
        </div>
      )}
    </div>
  );
}
