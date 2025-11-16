'use client'

import { useState, useEffect } from 'react'
import ForumList from './ForumList'
import ForumInput from './ForumInput'
import { supabase } from '../lib/supabaseClient'

interface Message {
  id: string
  user: string
  text: string
  created_at: string
}

export default function ForumApp() {
  const [items, setItems] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('forum_messages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleAdd = async (text: string) => {
    if (!supabase) {
      // Fallback to local state
      const id = String(Date.now())
      setItems((prev) => [{ id, user: 'Visitor', text, created_at: new Date().toISOString() }, ...prev])
      return
    }
    const { data, error } = await supabase
      .from('forum_messages')
      .insert([{ user: 'Visitor', text }])
      .select()
      .single()
    if (error) {
      console.error('Error adding message:', error)
    } else {
      setItems((prev) => [data, ...prev])
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <ForumInput onAdd={handleAdd} />
      <ForumList items={items} />
    </div>
  )
}
