export default function Home() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Welcome to Friendly City Print Shop</h1>
      <p className="mb-6">Create and order custom holiday cards for your friends and family — quick, friendly, and local.</p>
      <div className="space-x-4">
        <a href="/templates" className="px-4 py-2 bg-blue-600 text-white rounded-md">Browse Templates</a>
        <a href="/order" className="px-4 py-2 border rounded-md">Order a Custom Card</a>
      </div>
    </section>
  )
}
