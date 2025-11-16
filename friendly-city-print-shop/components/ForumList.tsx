'use client';

import { useState, useEffect } from 'react';

type ForumItem = {
  id: string;
  user: string;
  text: string;
  created_at?: string;
  pending?: boolean;
  failed?: boolean;
};

export default function ForumList({
  items,
  onReply,
  onLike,
}: {
  items: ForumItem[];
  onReply?: Function;
  onLike?: Function;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  const submitReply = async (user: string) => {
    if (!replyText.trim()) return;
    if (onReply) await onReply(user, replyText.trim());
    setReplyText('');
    setReplyingTo(null);
  };

  useEffect(() => {
    if (!replyingTo) return;
    const id = `reply-textarea-${replyingTo}`;
    const el = document.getElementById(id) as HTMLTextAreaElement | null;
    if (el) {
      try {
        el.focus();
        el.selectionStart = el.value.length;
      } catch (err) {
        /* ignore focus errors */
      }
    }
  }, [replyingTo]);

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    return `${day}d ago`;
  };

  const avatarColor = (name: string) => {
    const colors = ['#0b6b2d', '#7b4f2d', '#c23d3d', '#0b4c6b', '#6b2d6b'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
    return colors[Math.abs(h) % colors.length];
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎄</div>
        <p className="text-holiday-dark/60 text-lg">
          No messages yet. Be the first to share your holiday spirit!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div
          key={it.id}
          className="card-holiday p-6 group hover:shadow-xl transition-all duration-300"
        >
          {/* Message header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* User avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{ background: avatarColor(it.user) }}
                aria-hidden
              >
                {it.user.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-holiday-green text-lg">{it.user}</p>
                <p className="text-xs text-holiday-dark/50">
                  {it.pending
                    ? 'Sending...'
                    : it.failed
                      ? 'Failed to send'
                      : timeAgo(it.created_at)}
                </p>
              </div>
            </div>

            {/* Decorative icon */}
            <span
              className="text-2xl opacity-40 group-hover:opacity-70 transition-opacity"
              aria-hidden
            >
              ✨
            </span>
          </div>

          {/* Message content */}
          <div className="pl-13">
            <p className="text-holiday-dark leading-relaxed text-base">{it.text}</p>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-holiday-silver/50 flex justify-end gap-2 items-center">
            <button
              className="text-holiday-gold hover:text-holiday-red transition-colors text-sm font-semibold"
              aria-label={`${liked.has(it.id) ? 'Unlike' : 'Like'} message by ${it.user}`}
              aria-pressed={liked.has(it.id)}
              disabled={pendingLikes.has(it.id)}
              onClick={async () => {
                const currentlyLiked = liked.has(it.id);
                // optimistic local toggle
                setLiked((prev) => {
                  const next = new Set(prev);
                  if (next.has(it.id)) next.delete(it.id);
                  else next.add(it.id);
                  return next;
                });

                // mark pending
                setPendingLikes((prev) => new Set(prev).add(it.id));

                try {
                  if (onLike) {
                    await onLike(it.id, currentlyLiked ? 'unlike' : 'like');
                  }
                } catch (err) {
                  // revert on error
                  setLiked((prev) => {
                    const next = new Set(prev);
                    if (currentlyLiked) next.add(it.id);
                    else next.delete(it.id);
                    return next;
                  });
                } finally {
                  setPendingLikes((prev) => {
                    const next = new Set(prev);
                    next.delete(it.id);
                    return next;
                  });
                }
              }}
            >
              {liked.has(it.id) ? '💚 Liked' : '❤️ Like'}
            </button>

            <button
              className="text-holiday-green hover:text-holiday-red transition-colors text-sm font-semibold"
              onClick={() => setReplyingTo(replyingTo === it.id ? null : it.id)}
              aria-expanded={replyingTo === it.id}
              aria-controls={`reply-${it.id}`}
            >
              💬 Reply
            </button>
          </div>

          {replyingTo === it.id && (
            <div id={`reply-${it.id}`} className="mt-3">
              <textarea
                id={`reply-textarea-${it.id}`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    void submitReply(it.user);
                  }
                }}
                className="textarea-holiday w-full mb-2"
                placeholder={`Reply to ${it.user}...`}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setReplyText('');
                    setReplyingTo(null);
                  }}
                  className="btn-holiday-secondary"
                >
                  Cancel
                </button>
                <button onClick={() => void submitReply(it.user)} className="btn-holiday">
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
