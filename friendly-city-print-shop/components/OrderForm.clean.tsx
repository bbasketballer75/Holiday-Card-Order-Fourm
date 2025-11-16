"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Template {
  id: string
  title: string
  price: number
  image_url?: string | null
}

export default function OrderForm() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [template, setTemplate] = useState('')
  const [name, setName] = useState('')
  const [recipient, setRecipient] = useState('')
  const [message, setMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    async function loadTemplates() {
      if (!supabase) return
      const { data } = await supabase.from('templates').select('id, title, price, image_url')
      if (data) {
        setTemplates(data)
        if (data.length > 0) setTemplate(data[0].id)
      }
    }
    loadTemplates()
  }, [])

  const selected = templates.find((t) => t.id === template)
  const total = selected ? selected.price * quantity : 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selected) {
      alert('Please select a template')
      return
    }
    setLoading(true)
    try {
      const price = selected.price * 100
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ price_data: { currency: 'usd', product_data: { name: selected.title }, unit_amount: price }, quantity }] }),
      })
      const data = await resp.json()
      if (data.id) window.location.href = `https://checkout.stripe.com/pay/${data.id}`
      else alert('Checkout failed')
    } catch (err) {
      alert('Error creating checkout session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <div className="flex gap-4">
        <button type="button" onClick={() => setCurrentStep(1)} className={`px-3 py-2 rounded ${currentStep === 1 ? 'bg-holiday-green text-white' : 'bg-holiday-silver'}`}>
          1
        </button>
        <button type="button" onClick={() => setCurrentStep(2)} className={`px-3 py-2 rounded ${currentStep === 2 ? 'bg-holiday-green text-white' : 'bg-holiday-silver'}`}>
          2
        </button>
        <button type="button" onClick={() => setCurrentStep(3)} className={`px-3 py-2 rounded ${currentStep === 3 ? 'bg-holiday-green text-white' : 'bg-holiday-silver'}`}>
          3
        </button>
        <button type="button" onClick={() => setCurrentStep(4)} className={`px-3 py-2 rounded ${currentStep === 4 ? 'bg-holiday-green text-white' : 'bg-holiday-silver'}`}>
          4
        </button>
      </div>

      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <label key={t.id} className={`p-4 border rounded cursor-pointer ${template === t.id ? 'border-holiday-gold' : ''}`}>
              <input type="radio" className="hidden" value={t.id} checked={template === t.id} onChange={(e) => setTemplate(e.target.value)} />
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 relative">
                  {t.image_url ? <Image src={t.image_url} alt={t.title} fill className="object-cover" /> : <div className="bg-holiday-cream w-full h-full flex items-center justify-center">🎁</div>}
                </div>
                <div>
                  <div className="font-bold">{t.title}</div>
                  <div className="text-sm text-holiday-dark">${t.price.toFixed(2)}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block">Your Name</label>
            <input className="input-holiday" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block">Recipient</label>
            <input className="input-holiday" value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <label className="block">Message</label>
          <textarea className="textarea-holiday" value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="flex items-center gap-4">
            <label className="block">Quantity</label>
            <input className="input-holiday w-20" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="font-bold">Review</div>
          <div>{selected?.title} — {selected ? `$${selected.price.toFixed(2)} ea` : ''}</div>
          <div>Quantity: {quantity}</div>
          <div>Total: ${total.toFixed(2)}</div>
          <div>From: {name}</div>
          <div>To: {recipient}</div>
          <div>Message: {message}</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCurrentStep(3)} className="btn-holiday-secondary">Back</button>
            <button className="btn-holiday" type="submit" disabled={loading || !name || !recipient}> {loading ? 'Processing...' : 'Checkout'} </button>
          </div>
        </div>
      )}
    </form>
  )
}
