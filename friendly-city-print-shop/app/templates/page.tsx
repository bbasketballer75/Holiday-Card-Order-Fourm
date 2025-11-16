import TemplateCard from '../../components/TemplateCard'
import { supabase } from '../../lib/supabaseClient'

interface Template {
  id: string
  title: string
  description: string
  price: number
}

export default async function TemplatesPage() {
  let templates: Template[] = []
  if (supabase) {
    const { data } = await supabase.from('templates').select('*')
    templates = data || []
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Templates</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((t: Template) => (
          <TemplateCard key={t.id} title={t.title} description={t.description} price={t.price} />
        ))}
      </div>
    </section>
  )
}
