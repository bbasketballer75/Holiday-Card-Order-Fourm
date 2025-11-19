'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
      className="card group h-full flex flex-col relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full h-64 bg-gradient-to-br from-destructive/10 to-primary/10 overflow-hidden flex items-center justify-center">
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
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent flex items-end justify-center pb-6 animate-in fade-in duration-300">
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
          <h3 className="text-xl md:text-2xl font-bold text-destructive mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer with price and button - elegant festive styling */}
        <div className="mt-6 pt-6 border-t-2 border-accent flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <div className="flex flex-col items-start">
            <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Price
            </span>
            <span className="text-2xl md:text-3xl font-bold text-accent-foreground drop-shadow-sm">
              ${price?.toFixed(2) ?? '1.00'}
            </span>
          </div>
          <div className="flex flex-col gap-2 items-center w-full sm:w-auto">
            <Link
              href="/order"
              aria-label={`Order ${title} - $${price?.toFixed(2) ?? '1.00'}`}
              className="bg-accent text-accent-foreground text-base font-bold px-8 py-3 rounded-full shadow-lg hover:bg-accent/80 hover:scale-105 transition-transform duration-200 border-2 border-accent w-full sm:w-auto text-center min-h-[48px]"
            >
              Order Now&nbsp;→
            </Link>
            {customizable && (
              <button
                type="button"
                className="btn btn-secondary px-6 py-2 rounded-full text-sm font-bold mt-2 w-full sm:w-auto min-h-[44px]"
                onClick={onCustomize}
              >
                Customize
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Festive badge */}
      <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
        ⭐ Popular
      </div>
    </div>
  );
}
