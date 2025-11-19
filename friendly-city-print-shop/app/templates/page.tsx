'use client';

import TemplateCard from '../../components/TemplateCard';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string | null;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data, error } = await supabase!
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  return (
    <main id="main-content" className="min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12 border-b-4 border-accent">
        <div className="container">
          <div className="text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Holiday Card</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of beautifully designed holiday card templates. Each one is
              carefully crafted to spread joy and cheer.
            </p>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="container py-16">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-2xl text-muted-foreground">Loading beautiful templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❄️</div>
            <p className="text-2xl text-muted-foreground">
              No templates available yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <p className="text-muted-foreground text-lg">
                Showing <span className="font-bold text-primary">{templates.length}</span> beautiful
                templates
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((t: Template) => (
                <TemplateCard
                  key={t.id}
                  title={t.title}
                  description={t.description}
                  price={t.price}
                  imageUrl={t.image_url}
                  customizable={true}
                  onCustomize={() => router.push(`/order?template=${t.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16 border-t-4 border-accent">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">Can&apos;t Decide?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Visit our community forum to see what other customers love!
          </p>
          <a href="/forum" className="btn btn-secondary">
            💬 Explore Community Feedback
          </a>
        </div>
      </section>
    </main>
  );
}
