import TemplateUploader from '../../components/TemplateUploader';

export default function AdminPage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <p className="text-sm text-holiday-dark/70 mb-6">Manage orders and templates below.</p>

      <div className="grid grid-cols-1 gap-6">
        <TemplateUploader />
      </div>
    </section>
  );
}
