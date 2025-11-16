import ForumApp from '../../components/ForumApp';

export default function ForumPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Header Section */}
      <section className="gradient-holiday py-12 border-b-4 border-holiday-gold">
        <div className="container-holiday">
          <div className="text-center">
            <div className="text-5xl mb-4">💬</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Holiday Card Community</h1>
            <p className="text-lg md:text-xl text-holiday-dark/70 max-w-2xl mx-auto">
              Connect with fellow holiday card enthusiasts. Share ideas, ask questions, and spread
              festive cheer!
            </p>
          </div>
        </div>
      </section>

      {/* Forum Content */}
      <section className="container-holiday py-16">
        <div className="max-w-3xl mx-auto">
          <ForumApp />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-holiday-green/10 to-holiday-red/10 py-12 border-t-4 border-holiday-gold">
        <div className="container-holiday text-center">
          <h2 className="text-2xl font-bold text-holiday-green mb-4">Love Our Cards?</h2>
          <p className="text-holiday-dark/70 mb-6">
            Browse our templates and create your perfect holiday card today!
          </p>
          <a href="/templates" className="btn-holiday">
            🎨 Explore Templates
          </a>
        </div>
      </section>
    </main>
  );
}
