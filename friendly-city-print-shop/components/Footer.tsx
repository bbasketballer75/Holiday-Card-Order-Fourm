'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ];

  const socialLinks = [
    { label: '📘', href: '#', title: 'Facebook' },
    { label: '📷', href: '#', title: 'Instagram' },
    { label: '🐦', href: '#', title: 'Twitter' },
    { label: '📧', href: 'mailto:hello@friendlycityprint.shop', title: 'Email' },
  ];

  return (
    <footer className="gradient border-t-4 border-accent mt-16">
      <div className="container">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🎄</span>
              <div>
                <h4 className="font-bold text-lg text-primary">Friendly City</h4>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Print Shop
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Creating beautiful holiday cards to spread joy and warmth this season.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-primary mb-4 text-lg">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-foreground/70 hover:text-primary transition-colors">
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link
                  href="/templates"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  🎨 Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/order"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  🛒 Order Now
                </Link>
              </li>
              <li>
                <Link
                  href="/forum"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  💬 Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-bold text-primary mb-4 text-lg">Support</h5>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h5 className="font-bold text-primary mb-4 text-lg">Connect</h5>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  title={link.title}
                  className="text-2xl hover:scale-125 transition-transform duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="text-sm text-muted-foreground/60">
              <p className="font-semibold mb-2">Holiday Hours:</p>
              <p>Mon - Fri: 9 AM - 6 PM</p>
              <p>Sat - Sun: 10 AM - 4 PM</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-holiday"></div>

        {/* Bottom footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-muted-foreground/60">
            © {currentYear} Friendly City Print Shop. All rights reserved. 🎄
          </div>
          <div className="flex items-center gap-3 text-lg">
            <span>Made with</span>
            <span className="animate-pulse-glow">❤️</span>
            <span>for the holidays</span>
          </div>
        </div>

        {/* Festive message */}
        <div className="mt-8 p-4 bg-destructive/10 border-l-4 border-destructive rounded text-center">
          <p className="text-foreground font-semibold">
            ✨ Spread the holiday cheer! Share your favorite cards with friends and family. ✨
          </p>
        </div>
      </div>
    </footer>
  );
}
