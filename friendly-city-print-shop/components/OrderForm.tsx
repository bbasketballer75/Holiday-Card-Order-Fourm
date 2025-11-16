"use client"

import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Template {
  id: string
  title: string
  price: number
}

export default function OrderForm() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [template, setTemplate] = useState('')
  const [name, setName] = useState('')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!supabase) return
      const { data } = await supabase.from('templates').select('id, title, price')
      if (data) {
        setTemplates(data)
        if (data.length > 0) setTemplate(data[0].id)
      }
    }
    fetchTemplates()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const selectedTemplate = templates.find(t => t.id === template)
      if (!selectedTemplate) return
      const price = selectedTemplate.price * 100 // cents
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            price_data: {
              currency: 'usd',
              product_data: { name: `Holiday Card - ${selectedTemplate.title}` },
              unit_amount: price,
            },
            quantity,
          }],
        }),
      })
      const data = await response.json()
      if (data.id) {
        window.location.href = `https://checkout.stripe.com/pay/${data.id}`
      } else {
        alert('Error: ' + data.error?.message)
      }
    } catch (err) {
      alert('Error creating checkout session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <label className="block">
        <span className="text-sm">Template</span>
        <select className="mt-1 block w-full" value={template} onChange={(e) => setTemplate(e.target.value)}>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.title} - ${t.price.toFixed(2)}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Your Name</span>
        <input className="mt-1 block w-full" value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm">Recipient</span>
        <input className="mt-1 block w-full" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm">Message</span>
        <textarea className="mt-1 block w-full" value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      <label className="block">
        <span className="text-sm">Quantity</span>
        <input type="number" min={1} className="mt-1 block w-24" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </label>

      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
        {loading ? 'Processing...' : 'Continue to Checkout'}
      </button>
    </form>
  )
}
