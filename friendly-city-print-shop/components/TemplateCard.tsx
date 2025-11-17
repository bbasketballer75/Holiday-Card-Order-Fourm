'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function TemplateCard({
  title,
  description,
  price,
  imageUrl,
  customizable = false,
  onCustomize,
}: {
  title: string;
  description: string;
  price?: number;
  imageUrl?: string | null;
    customizable?: boolean;
    onCustomize?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card-holiday group h-full flex flex-col relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* Image Container */}
        <div className="relative w-full h-64 bg-gradient-to-br from-holiday-red/10 to-holiday-green/10 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            // Decorative fallback
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-30 transform group-hover:scale-110 transition-transform duration-500">
                {title.includes('Elegant') ? '✨' : title.includes('Classic') ? '🎄' : '🎁'}
              </div>
            </div>
          )}

          {/* Hover overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-holiday-dark/60 via-transparent to-transparent flex items-end justify-center pb-6 animate-in fade-in duration-300">
              <span className="text-white font-bold text-lg">View Details</span>
            </div>
          )}

          {/* Corner decorations */}
          <div className="absolute top-2 right-2 text-2xl">🎀</div>
          <div className="absolute bottom-2 left-2 text-2xl">❄️</div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          {/* Header */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-holiday-red mb-2 group-hover:text-holiday-green transition-colors">
              {title}
            </h3>
            <p className="text-holiday-dark/70 text-sm md:text-base leading-relaxed">
              {description}
            </p>
          </div>

        {/* Footer with price and button - elegant festive styling */}
        <div className="mt-6 pt-6 border-t-2 border-holiday-gold flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex flex-col items-start">
            <span className="text-xs text-holiday-dark/60 uppercase tracking-wide mb-1">Price</span>
            <span className="text-2xl md:text-3xl font-bold text-holiday-gold drop-shadow-sm">
                ${price?.toFixed(2) ?? '1.00'}
              </span>
            </div>
          <div className="flex flex-col gap-2 items-center">
            <Link href="/order" aria-label={`Order ${title} - $${price?.toFixed(2) ?? '1.00'}`}
              className="bg-holiday-gold text-holiday-dark text-base font-bold px-8 py-3 rounded-full shadow-lg hover:bg-holiday-gold-light hover:scale-105 transition-transform duration-200 border-2 border-holiday-gold">
              Order Now&nbsp;→
            </Link>
            {customizable && (
              <button
                type="button"
                className="btn-holiday-secondary px-6 py-2 rounded-full text-sm font-bold mt-2"
                onClick={onCustomize}
              >
                Customize
              </button>
            )}
          </div>
          </div>
        </div>

        {/* Festive badge */}
        <div className="absolute top-4 left-4 bg-holiday-red text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ Popular
        </div>
    </div>
  );
}
