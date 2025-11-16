'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Templates', href: '/templates' },
    { label: 'Order', href: '/order' },
    { label: 'Forum', href: '/forum' },
    { label: 'Admin', href: '/admin' },
  ];

  return (
    <header className="sticky top-0 z-50 gradient-holiday border-b-4 border-holiday-gold shadow-lg">
      <div className="container-holiday">
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white/80 focus:px-3 focus:py-2 rounded-md"
        >
          Skip to content
        </a>

        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-4xl transform group-hover:rotate-12 transition-transform duration-300">
              🎄
            </div>
            <div>
              <div className="text-gradient-holiday font-bold text-2xl md:text-3xl">
                Friendly City
              </div>
              <div className="text-holiday-green text-xs md:text-sm font-semibold">Print Shop</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-holiday-dark font-semibold rounded-lg transition-all duration-300 relative group focus:outline-none focus:ring-2 focus:ring-holiday-gold focus:ring-offset-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-holiday-red to-holiday-green group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-holiday-gold focus:ring-offset-2"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6 text-holiday-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={`md:hidden mt-4 pb-4 space-y-2 transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-64' : 'max-h-0'
          }`}
          aria-label="Mobile navigation"
        >
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  role="menuitem"
                  className="block px-4 py-3 text-holiday-dark font-semibold rounded-lg hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-holiday-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
