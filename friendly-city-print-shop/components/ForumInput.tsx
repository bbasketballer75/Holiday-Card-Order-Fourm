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
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea value={value} onChange={(e) => setValue(e.target.value)} className="w-full p-2 border rounded" placeholder="Ask a question or share your feedback" />
      <div className="text-right mt-2">
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Post</button>
      </div>
    </form>
  )
}
