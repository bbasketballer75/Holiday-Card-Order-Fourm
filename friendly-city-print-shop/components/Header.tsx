import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold">Friendly City Print Shop</a>
        </Link>
        <nav className="space-x-4">
          <Link href="/templates"><a>Templates</a></Link>
          <Link href="/order"><a>Order</a></Link>
          <Link href="/forum"><a>Forum</a></Link>
          <Link href="/admin"><a>Admin</a></Link>
        </nav>
      </div>
    </header>
  )
}
