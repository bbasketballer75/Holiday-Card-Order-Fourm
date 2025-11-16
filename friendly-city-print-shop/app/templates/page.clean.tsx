import TemplateCard from '../../components/TemplateCard'
import { supabase } from '../../lib/supabaseClient'

interface Template {
    id: string
    title: string
    description?: string | null
    price: number
    image_url?: string | null
}

export default async function TemplatesPage() {
    let templates: Template[] = []
    if (supabase) {
        const { data } = await supabase.from('templates').select('*')
        templates = (data as Template[]) || []
    }

    return (
        <main id="main-content" className="min-h-screen">
            {/* Header Section */}
            <section className="gradient-holiday py-12 border-b-4 border-holiday-gold">
                <div className="container-holiday">
                    <div className="text-center">
                        <div className="text-5xl mb-4">🎨</div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Holiday Card</h1>
                        <p className="text-lg md:text-xl text-holiday-dark/70 max-w-2xl mx-auto">
                            Explore our collection of beautifully designed holiday card templates. Each one is
                            carefully crafted to spread joy and cheer.
                        </p>
                    </div>
                </div>
            </section>

            {/* Templates Grid */}
            <section className="container-holiday py-16">
                {templates.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">❄️</div>
                        <p className="text-2xl text-holiday-dark/60">No templates available yet. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 text-center">
                            <p className="text-holiday-dark/70 text-lg">
                                Showing <span className="font-bold text-holiday-green">{templates.length}</span>{' '}
                                beautiful templates
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {templates.map((t) => (
                                <TemplateCard
                                    key={t.id}
                                    title={t.title}
                                    description={t.description}
                                    price={t.price}
                                    imageUrl={t.image_url}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-holiday-red/10 to-holiday-green/10 py-16 border-t-4 border-holiday-gold">
                <div className="container-holiday text-center">
                    <h2 className="text-3xl font-bold mb-6 text-holiday-green">Can&apos;t Decide?</h2>
                    <p className="text-lg text-holiday-dark/70 mb-8">Visit our community forum to see what other customers love!</p>
                    <a href="/forum" className="btn-holiday-secondary">💬 Explore Community Feedback</a>
                </div>
            </section>
        </main>
    )
}
