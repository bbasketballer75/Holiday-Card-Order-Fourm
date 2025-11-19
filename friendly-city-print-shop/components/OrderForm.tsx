'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Template } from '../types';
import CardCustomizer from './CardCustomizer';
import { supabase } from '../lib/supabaseClient';

export default function OrderForm() {
  const [customizing, setCustomizing] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [template, setTemplate] = useState('');
  const [name, setName] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('templates').select('id, title, price, image_url');
      if (data) {
        setTemplates(
          (data || []).map((item) => ({
            id: item.id,
            title: item.title,
            description: '',
            price: item.price,
            image_url: item.image_url,
          })),
        );
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
      const price = selectedTemplate.price * 100;
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
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8 relative">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex flex-col items-center flex-1 relative">
              <button
                type="button"
                onClick={() => setCurrentStep(step.num)}
                aria-label={`Go to step ${step.num} - ${step.label}`}
                aria-current={currentStep === step.num ? 'step' : undefined}
                className={`w-14 h-14 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center mb-2 touch-manipulation ${
                  currentStep >= step.num
                    ? 'bg-gradient-to-br from-destructive to-accent text-white shadow-lg'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.icon}
              </button>
              <span
                className={`text-xs font-bold text-center ${
                  currentStep >= step.num ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className="absolute top-7 left-full w-16 h-2 flex items-center"
                  style={{ zIndex: 0 }}
                >
                  <div className="w-full h-1 rounded-full bg-gradient-to-r from-accent via-destructive to-primary opacity-60" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-green-600">🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-600">🛡️</span>
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-purple-600">💳</span>
            <span>Stripe Protected</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-600">📦</span>
            <span>Quality Guaranteed</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {currentStep === 1 && (
          <div className="card p-8 animate-in fade-in">
            <h3 className="text-2xl font-bold text-primary mb-6">🎄 Select Your Holiday Card</h3>
            <div className="space-y-3">
              {templates.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:border-accent hover:bg-accent/5"
                  style={{
                    borderColor: template === t.id ? 'var(--primary)' : 'var(--muted)',
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
                    <div className="w-28 h-16 relative flex-shrink-0 rounded-md overflow-hidden bg-muted/50">
                      {t.image_url ? (
                        <Image src={t.image_url} alt={t.title} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-2xl opacity-40">
                          🎁
                        </div>
                      )}
                    </div>
                    <span className="ml-4 flex-1">
                      <span className="font-bold text-primary">{t.title}</span>
                      <span className="text-muted-foreground ml-2">${t.price.toFixed(2)} each</span>
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                className="btn btn-primary flex-1 min-h-[48px] touch-manipulation"
                onClick={() => setCustomizing(true)}
                disabled={!selectedTemplate}
              >
                Customize Selected Card
              </button>
              <button
                type="button"
                className="btn btn-secondary flex-1 min-h-[48px] touch-manipulation"
                onClick={() => setCurrentStep(2)}
                disabled={!selectedTemplate}
              >
                Skip Customization
              </button>
            </div>
            {customizing && selectedTemplate && (
              <CardCustomizer
                template={{
                  title: selectedTemplate.title,
                  description: '',
                  imageUrl: selectedTemplate.image_url,
                }}
                initialText={customText}
                initialImage={customImage}
                onSave={({ text, image }) => {
                  setCustomText(text);
                  setCustomImage(image);
                  setCustomizing(false);
                  setCurrentStep(2);
                }}
                onCancel={() => setCustomizing(false)}
              />
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="card p-8 animate-in fade-in space-y-5">
            <h3 className="text-2xl font-bold text-primary mb-6">👤 Your Information</h3>
            <div>
              <label className="block font-bold text-primary mb-2">Your Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold text-primary mb-2">Recipient Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Who will receive this card?"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold text-primary mb-2">
                Upload Photo or Design (optional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="input"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setUploadedPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setUploadedPreview(null);
                  }
                }}
              />
              {uploadedPreview && (
                <div className="mt-3 flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">Preview:</span>
                  <Image
                    src={uploadedPreview}
                    alt="Uploaded preview"
                    width={320}
                    height={160}
                    className="max-h-40 rounded-lg shadow-md border border-accent"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary flex-1 min-h-[48px] touch-manipulation"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-primary flex-1 min-h-[48px] touch-manipulation"
              >
                Next: Message →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="card p-8 animate-in fade-in space-y-5">
            <h3 className="text-2xl font-bold text-primary mb-6">💌 Your Holiday Message</h3>
            <div>
              <label className="block font-bold text-primary mb-2">Personal Message</label>
              <textarea
                className="textarea"
                placeholder="Write a special holiday message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">{message.length} characters</p>
            </div>
            <div>
              <label className="block font-bold text-primary mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-secondary px-4"
                >
                  −
                </button>
                <span className="text-2xl font-bold text-primary w-12 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="btn btn-secondary px-4"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-secondary flex-1 min-h-[48px] touch-manipulation"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn btn-primary flex-1 min-h-[48px] touch-manipulation"
              >
                Review Order →
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="card p-8 animate-in fade-in space-y-6">
            <h3 className="text-2xl font-bold text-primary mb-6">✓ Review Your Order</h3>
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 relative rounded-md overflow-hidden bg-muted/50">
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
                  <div className="font-bold text-primary">{selectedTemplate?.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTemplate ? `$${selectedTemplate.price.toFixed(2)} each` : ''}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">Card Template:</span>
                <span className="text-foreground">{selectedTemplate?.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">From:</span>
                <span className="text-foreground">{name || '(Not provided)'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary">To:</span>
                <span className="text-foreground">{recipient || '(Not provided)'}</span>
              </div>
              <div className="border-t border-accent/30 pt-3 mt-3 flex justify-between items-center text-lg font-bold">
                <span className="text-primary">Total ({quantity}x):</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-destructive">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
            {message && (
              <div className="card p-4 bg-gradient-to-br from-background to-muted">
                <p className="text-sm font-bold text-primary mb-2">Message Preview:</p>
                <p className="italic text-foreground">{message}</p>
              </div>
            )}
            {uploadedPreview && (
              <div className="card p-4 bg-gradient-to-br from-background to-muted">
                <p className="text-sm font-bold text-primary mb-2">Uploaded Design:</p>
                <Image
                  src={uploadedPreview}
                  alt="Your uploaded design"
                  width={200}
                  height={120}
                  className="rounded-lg shadow-md border border-accent mx-auto"
                />
              </div>
            )}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-secondary flex-1 min-h-[48px] touch-manipulation"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || !name || !recipient}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
              >
                {loading ? '💳 Processing...' : '💳 Secure Checkout'}
              </button>
            </div>

            {/* Security messaging */}
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>🔒 Your payment information is encrypted and secure</p>
              <div className="flex justify-center items-center gap-3">
                <span className="text-blue-600 font-semibold">VISA</span>
                <span className="text-red-600 font-semibold">MC</span>
                <span className="text-blue-500 font-semibold">AMEX</span>
                <span className="text-orange-500 font-semibold">Stripe</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
