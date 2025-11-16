'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Template {
  id: string;
  title: string;
  price: number;
  image_url?: string | null;
}

export default function OrderForm() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [template, setTemplate] = useState('');
  const [name, setName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('templates').select('id, title, price, image_url');
      if (data) {
        setTemplates(data);
        if (data.length > 0) setTemplate(data[0].id);
      }
    };
    fetchTemplates();
  }, []);

  const selectedTemplate = templates.find((t) => t.id === template);
  const totalPrice = selectedTemplate ? selectedTemplate.price * quantity : 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!selectedTemplate) return;
      const price = selectedTemplate.price * 100; // cents
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              price_data: {
                currency: 'usd',
                product_data: { name: `Holiday Card - ${selectedTemplate.title}` },
                unit_amount: price,
              },
              quantity,
            },
          ],
        }),
      });
      const data = await response.json();
      if (data.id) {
        window.location.href = `https://checkout.stripe.com/pay/${data.id}`;
      } else {
        alert('Error: ' + data.error?.message);
      }
    } catch (err) {
      alert('Error creating checkout session');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Select Card', icon: '🎄' },
    { num: 2, label: 'Your Details', icon: '👤' },
    { num: 3, label: 'Message', icon: '💌' },
    { num: 4, label: 'Review', icon: '✓' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex flex-col items-center flex-1">
              {/* Step button */}
              <button
                type="button"
                onClick={() => setCurrentStep(step.num)}
                aria-label={`Go to step ${step.num} - ${step.label}`}
                aria-current={currentStep === step.num ? 'step' : undefined}
                className={`w-14 h-14 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center mb-2 ${
                  currentStep >= step.num
                    ? 'bg-gradient-to-br from-holiday-red to-holiday-gold text-white shadow-lg'
                    : 'bg-holiday-silver text-holiday-dark/50'
                }`}
              >
                {step.icon}
              </button>
              <span
                className={`text-xs font-bold text-center ${
                  currentStep >= step.num ? 'text-holiday-green' : 'text-holiday-dark/40'
                }`}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute h-1 w-12 mt-7 ml-12 ${
                    currentStep > step.num ? 'bg-holiday-green' : 'bg-holiday-silver'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Template Selection */}
        {currentStep === 1 && (
          <div className="card-holiday p-8 animate-in fade-in">
            <h3 className="text-2xl font-bold text-holiday-green mb-6">
              🎄 Select Your Holiday Card
            </h3>
            <div className="space-y-3">
              {templates.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:border-holiday-gold hover:bg-holiday-gold/5"
                  style={{
                    borderColor:
                      template === t.id ? 'var(--holiday-green)' : 'var(--holiday-silver)',
                  }}
                >
                  <input
                    type="radio"
                    value={t.id}
                    checked={template === t.id}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div className="ml-3 flex items-center w-full">
                    <div className="w-28 h-16 relative flex-shrink-0 rounded-md overflow-hidden bg-holiday-cream/50">
                      {t.image_url ? (
                        <Image src={t.image_url} alt={t.title} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-2xl opacity-40">
                          🎁
                        </div>
                      )}
                    </div>
                    <span className="ml-4 flex-1">
                      <span className="font-bold text-holiday-green">{t.title}</span>
                      <span className="text-holiday-dark/60 ml-2">${t.price.toFixed(2)} each</span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-holiday mt-6 w-full"
            >
              Next: Your Details →
            </button>
          </div>
        )}

        {/* Step 2: Personal Details */}
        {currentStep === 2 && (
          <div className="card-holiday p-8 animate-in fade-in space-y-5">
            <h3 className="text-2xl font-bold text-holiday-green mb-6">👤 Your Information</h3>

            <div>
              <label className="block font-bold text-holiday-green mb-2">Your Name</label>
              <input
                type="text"
                required
                className="input-holiday"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold text-holiday-green mb-2">Recipient Name</label>
              <input
                type="text"
                required
                className="input-holiday"
                placeholder="Who will receive this card?"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-holiday-secondary flex-1"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-holiday flex-1"
              >
                Next: Message →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Message */}
        {currentStep === 3 && (
          <div className="card-holiday p-8 animate-in fade-in space-y-5">
            <h3 className="text-2xl font-bold text-holiday-green mb-6">💌 Your Holiday Message</h3>

            <div>
              <label className="block font-bold text-holiday-green mb-2">Personal Message</label>
              <textarea
                className="textarea-holiday"
                placeholder="Write a special holiday message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-holiday-dark/50 mt-2">{message.length} characters</p>
            </div>

            <div>
              <label className="block font-bold text-holiday-green mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn-holiday-secondary px-4"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-holiday-green w-12 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn-holiday-secondary px-4"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-holiday-secondary flex-1"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-holiday flex-1"
              >
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Checkout */}
        {currentStep === 4 && (
          <div className="card-holiday p-8 animate-in fade-in space-y-6">
            <h3 className="text-2xl font-bold text-holiday-green mb-6">✓ Review Your Order</h3>

            {/* Order Summary */}
            <div className="bg-holiday-gold/10 border-l-4 border-holiday-gold p-6 rounded-lg space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 relative rounded-md overflow-hidden bg-holiday-cream/50">
                  {selectedTemplate?.image_url ? (
                    <Image
                      src={selectedTemplate.image_url}
                      alt={selectedTemplate.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl opacity-40">
                      🎁
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-holiday-green">{selectedTemplate?.title}</div>
                  <div className="text-sm text-holiday-dark/60">
                    {selectedTemplate ? `$${selectedTemplate.price.toFixed(2)} each` : ''}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-holiday-green">Card Template:</span>
                <span className="text-holiday-dark">{selectedTemplate?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-holiday-green">From:</span>
                <span className="text-holiday-dark">{name || '(Not provided)'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-holiday-green">To:</span>
                <span className="text-holiday-dark">{recipient || '(Not provided)'}</span>
              </div>
              <div className="border-t border-holiday-gold/30 pt-3 mt-3 flex justify-between items-center text-lg font-bold">
                <span className="text-holiday-green">Total ({quantity}x):</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-holiday-gold to-holiday-red">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Message preview */}
            {message && (
              <div className="card-holiday p-4 bg-gradient-to-br from-holiday-white to-holiday-cream">
                <p className="text-sm font-bold text-holiday-green mb-2">Message Preview:</p>
                <p className="italic text-holiday-dark">{message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-holiday-secondary flex-1"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !name || !recipient}
                className="btn-holiday flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '💳 Processing...' : '💳 Checkout'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
