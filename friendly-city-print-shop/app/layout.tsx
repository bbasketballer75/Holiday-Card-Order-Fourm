import './globals.css'
import type { ReactNode } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Friendly City Print Shop - Beautiful Holiday Cards',
  description:
    'Create and order personalized holiday cards with Friendly City Print Shop. Beautiful designs, quick ordering, and fast shipping.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#185c37" />
      </head>
      <body
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: 'var(--holiday-cream)', color: 'var(--holiday-dark)' }}
      >
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
