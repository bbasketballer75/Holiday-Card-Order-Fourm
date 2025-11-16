export default function TemplateCard({ title, description, price }: { title: string, description: string, price?: number }) {
  return (
    <div className="border rounded-md p-4 shadow-sm">
      <div className="h-40 bg-gray-100 mb-3 flex items-center justify-center">Image</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm font-medium">${price?.toFixed(2) ?? '1.00'}</span>
        <a href="/order" className="px-3 py-1 bg-green-600 text-white rounded-md">Order</a>
      </div>
    </div>
  )
}
