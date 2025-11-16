export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="gradient-holiday py-16 md:py-24 relative overflow-hidden">
        <div className="container-holiday relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 text-6xl md:text-7xl animate-bounce-subtle">🎄</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Spread Holiday Joy
            </h1>
            <p className="text-xl md:text-2xl text-holiday-dark/80 mb-8 leading-relaxed">
              Craft beautiful, personalized holiday cards with Friendly City Print Shop. Perfect for
              sharing warmth and cheer with everyone you care about.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/templates" className="btn-holiday text-lg">
                🎨 Browse Beautiful Templates
              </a>
              <a href="/order" className="btn-holiday-secondary text-lg">
                🛒 Order Your Custom Card
              </a>
            </div>
          </div>
        </div>

        {/* Decorative snowflakes background */}
        <div className="absolute top-10 left-5 text-3xl opacity-20">❄️</div>
        <div className="absolute top-20 right-10 text-4xl opacity-30">✨</div>
        <div className="absolute bottom-10 left-1/4 text-2xl opacity-20">🎁</div>
        <div className="absolute bottom-20 right-1/4 text-3xl opacity-25">🎀</div>
      </section>

      {/* Features Section */}
      <section className="container-holiday py-16">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card-holiday p-8 text-center hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-holiday-red mb-3">Beautiful Designs</h3>
            <p className="text-holiday-dark/70">
              Handcrafted templates designed to spread holiday cheer with stunning, professional
              layouts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-holiday p-8 text-center hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">💌</div>
            <h3 className="text-2xl font-bold text-holiday-green mb-3">Personalization</h3>
            <p className="text-holiday-dark/70">
              Add your own message, photos, and personal touches to make each card truly unique.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-holiday p-8 text-center hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-holiday-gold mb-3">Quick & Easy</h3>
            <p className="text-holiday-dark/70">
              Order from template selection to checkout in minutes. Perfect for last-minute holiday
              needs!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-holiday-red to-holiday-green py-16 md:py-20">
        <div className="container-holiday text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Spread Joy?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join hundreds of happy customers sharing personalized holiday cards with their loved
            ones.
          </p>
          <a
            href="/templates"
            className="btn-holiday bg-white text-holiday-red hover:text-white text-lg inline-block"
          >
            Get Started Today →
          </a>
        </div>
      </section>

      {/* Community Section */}
      <section className="container-holiday py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">Community Corner</h2>
          <p className="text-center text-holiday-dark/70 mb-8 text-lg">
            Join our community forum to share holiday card designs, get inspiration, and connect
            with other creative card enthusiasts!
          </p>
          <div className="text-center">
            <a href="/forum" className="btn-holiday-secondary text-lg">
              💬 Visit Our Forum
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
