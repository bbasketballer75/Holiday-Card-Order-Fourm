export default function ForumList({
  items,
}: {
  items: { id: string; user: string; text: string; created_at?: string }[];
}) {
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div key={it.id} className="border rounded p-3 shadow-sm">
          <strong>{it.user}</strong>
          <p className="text-sm text-gray-700">{it.text}</p>
          {it.created_at && (
            <div className="text-xs text-gray-500 mt-2">
              {new Date(it.created_at).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
