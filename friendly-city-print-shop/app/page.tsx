export default function Home() {
  return (
    <main id="main-content" className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16 md:py-24 relative overflow-hidden flex flex-col items-center justify-center border-b-4 border-accent">
        <div className="container relative z-10 flex flex-col items-center justify-center">
          <div className="max-w-3xl w-full mx-auto text-center flex flex-col items-center justify-center">
            <div className="mb-8 text-6xl md:text-7xl animate-bounce drop-shadow-lg">🎄</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Spread Holiday Joy
            </h1>
            <p className="text-xl md:text-2xl text-foreground mb-10 leading-relaxed">
              Craft beautiful, personalized holiday cards with{' '}
              <span className="font-bold text-primary">Friendly City Print Shop</span>. Perfect for
              sharing warmth and cheer with everyone you care about.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full px-4">
              <a
                href="/templates"
                className="btn btn-primary text-lg w-full sm:w-auto shadow-lg min-h-[48px] px-8 py-3 text-center"
              >
                🎨 Browse Templates
              </a>
              <a
                href="/order"
                className="btn btn-secondary text-lg w-full sm:w-auto shadow-lg min-h-[48px] px-8 py-3 text-center"
              >
                � Order Now
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
      <section className="container py-16">
        <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card p-8 text-center hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-destructive mb-3">Beautiful Designs</h3>
            <p className="text-foreground/70">
              Handcrafted templates designed to spread holiday cheer with stunning, professional
              layouts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card p-8 text-center hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">💌</div>
            <h3 className="text-2xl font-bold text-primary mb-3">Personalization</h3>
            <p className="text-foreground/70">
              Add your own message, photos, and personal touches to make each card truly unique.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card p-8 text-center hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-accent mb-3">Quick & Easy</h3>
            <p className="text-foreground/70">
              Order from template selection to checkout in minutes. Perfect for last-minute holiday
              needs!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - soft festive redesign */}
      <section className="bg-secondary py-16 md:py-20 border-t-4 border-accent">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">Ready to Spread Joy?</h2>
          <p className="text-xl mb-8 text-foreground/80">
            Join hundreds of happy customers sharing personalized holiday cards with their loved
            ones.
          </p>
          <a
            href="/templates"
            className="btn btn-accent text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 inline-block"
          >
            Get Started Today&nbsp;→
          </a>
        </div>
      </section>

      {/* Community Section */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">Community Corner</h2>
          <p className="text-center text-foreground/70 mb-8 text-lg">
            Join our community forum to share holiday card designs, get inspiration, and connect
            with other creative card enthusiasts!
          </p>
          <div className="text-center">
            <a href="/forum" className="btn btn-secondary text-lg">
              💬 Visit Our Forum
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
