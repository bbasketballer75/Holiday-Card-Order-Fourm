export default function ForumList({ items }: { items: { id: string, user: string, text: string }[] }) {
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.id} className="border rounded p-3 shadow-sm">
          <strong>{it.user}</strong>
          <p className="text-sm text-gray-700">{it.text}</p>
        </div>
      ))}
    </div>
  )
}
