"use client"

import { useState } from 'react'
import type { FormEvent } from 'react'

// The name in the function type parameter is a type-level identifier. ESLint's
// `no-unused-vars` can incorrectly flag this for TypeScript types; disable it here.
/* eslint-disable no-unused-vars */
type ForumInputProps = { onAdd: (payload: string) => void }
/* eslint-enable no-unused-vars */

export default function ForumInput({ onAdd }: ForumInputProps) {
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      setIsLoading(true);
      try {
        await Promise.resolve(onAdd(value.trim()));
        setValue('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // programmatic submit used for keyboard shortcuts
  const submitNow = async () => {
    if (!value.trim()) return;
    setIsLoading(true);
    try {
      await Promise.resolve(onAdd(value.trim()));
      setValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const charCount = value.length;
  const maxChars = 500;
  const isNearLimit = charCount > maxChars * 0.8;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="card-holiday p-6 bg-gradient-to-b from-holiday-white to-holiday-cream/50">
        {/* Header */}
        <div className="mb-4">
          <label className="block font-bold text-holiday-green text-lg mb-2">
            💬 Share Your Holiday Spirit
          </label>
          <p className="text-holiday-dark/60 text-sm">
            Ask questions, share feedback, or spread holiday cheer!
          </p>
        </div>

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              void submitNow();
            }
          }}
          className="textarea-holiday mb-4"
          placeholder="What's on your mind? Share your holiday thoughts, questions, or festive wishes..."
          rows={4}
          maxLength={maxChars}
          disabled={isLoading}
        />

        {/* Footer with character count and button */}
        <div className="flex justify-between items-end gap-4">
          {/* Character counter */}
          <div className="text-xs font-semibold">
            <span className={isNearLimit ? 'text-holiday-red' : 'text-holiday-dark/60'}>
              {charCount}
            </span>
            <span className="text-holiday-dark/40 ml-1">/ {maxChars}</span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            aria-label="Post message to forum"
            disabled={isLoading || !value.trim()}
            className="btn-holiday disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">🎄</span>
                Posting...
              </>
            ) : (
              <>✨ Post Message</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
