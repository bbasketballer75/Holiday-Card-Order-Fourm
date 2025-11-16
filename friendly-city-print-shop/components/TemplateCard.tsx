'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function TemplateCard({
  title,
  description,
  price,
  imageUrl,
}: {
  title: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href="/order" aria-label={`Order ${title} - $${price?.toFixed(2) ?? '1.00'}`}>
      <div
        className="card-holiday cursor-pointer group h-full flex flex-col relative overflow-hidden"
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

          {/* Footer with price */}
          <div className="mt-6 pt-6 border-t-2 border-holiday-silver flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-holiday-dark/60 uppercase tracking-wide">Price</span>
              <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-holiday-gold to-holiday-red">
                ${price?.toFixed(2) ?? '1.00'}
              </span>
            </div>
            <button className="btn-holiday text-sm md:text-base transform group-hover:scale-110 transition-transform duration-300">
              Order Now →
            </button>
          </div>
        </div>

        {/* Festive badge */}
        <div className="absolute top-4 left-4 bg-holiday-red text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ Popular
        </div>
      </div>
    </Link>
  );
}
