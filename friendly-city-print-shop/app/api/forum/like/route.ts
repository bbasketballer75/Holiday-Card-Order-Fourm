import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Body = {
  messageId?: string
  action?: 'like' | 'unlike'
  userName?: string
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json()
    const { messageId, action, userName } = body
    if (!messageId || !action) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

    const supabase = createClient(supabaseUrl, serviceKey)

    const user = userName || 'Visitor'

    if (action === 'like') {
      // Try insert, ignore unique constraint errors
      const { error } = await supabase.from('forum_likes').insert({ message_id: messageId, user_name: user })
      if (error && !/duplicate|unique/i.test(String(error.message))) {
        return NextResponse.json({ error: String(error.message) }, { status: 500 })
      }
    } else if (action === 'unlike') {
      const { error } = await supabase.from('forum_likes').delete().match({ message_id: messageId, user_name: user })
      if (error) return NextResponse.json({ error: String(error.message) }, { status: 500 })
    }

    // Return updated like count for the message
    const { data: likes, error: likeErr } = await supabase.from('forum_likes').select('id').eq('message_id', messageId)
    if (likeErr) return NextResponse.json({ error: String(likeErr.message) }, { status: 500 })
    const count = Array.isArray(likes) ? likes.length : 0

    return NextResponse.json({ ok: true, count })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
