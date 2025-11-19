import OrderForm from '../../components/OrderForm';

export default function OrderPage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Header Section */}
      <section className="gradient py-12 border-b-4 border-accent">
        <div className="container">
          <div className="text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Create Your Holiday Card</h1>
            <p className="text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto">
              Follow these simple steps to order your personalized holiday cards. It takes just a
              few minutes!
            </p>
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="container py-16">
        <OrderForm />
      </section>

      {/* Trust Section */}
      <section className="bg-gradient-to-r from-accent/10 to-destructive/10 py-12 border-t-4 border-accent">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">✓</div>
              <p className="font-bold text-primary mb-2">Quality Guaranteed</p>
              <p className="text-muted-foreground/70">Premium printing on beautiful cardstock</p>
            </div>
            <div>
              <div className="text-4xl mb-3">🚚</div>
              <p className="font-bold text-primary mb-2">Fast Shipping</p>
              <p className="text-muted-foreground/70">Delivered before the holidays</p>
            </div>
            <div>
              <div className="text-4xl mb-3">💚</div>
              <p className="font-bold text-primary mb-2">Spread Joy</p>
              <p className="text-muted-foreground/70">Make someone&apos;s holiday special</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
