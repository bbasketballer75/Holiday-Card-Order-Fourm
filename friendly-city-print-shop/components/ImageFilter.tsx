'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageFilterProps {
  imageUrl: string;
  onFilterChange: (_filteredImageUrl: string) => void;
}

const filterPresets = [
  { name: 'Original', value: 'none' },
  { name: 'Vintage', value: 'sepia(0.3) contrast(1.1) brightness(0.9)' },
  { name: 'Black & White', value: 'grayscale(1)' },
  { name: 'Cool', value: 'hue-rotate(180deg) saturate(0.8)' },
  { name: 'Warm', value: 'sepia(0.2) saturate(1.2) hue-rotate(-10deg)' },
  { name: 'Dramatic', value: 'contrast(1.3) saturate(1.2) brightness(0.8)' },
  { name: 'Soft', value: 'blur(0.5px) brightness(1.1) saturate(0.9)' },
  { name: 'Vivid', value: 'saturate(1.5) contrast(1.1)' },
];

export default function ImageFilter({ imageUrl, onFilterChange }: ImageFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const applyFilter = useCallback(async () => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply CSS filters
      let filterString = selectedFilter;
      if (selectedFilter === 'none') {
        filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      } else {
        filterString += ` brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
      }

      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      // Convert to data URL
      const filteredImageUrl = canvas.toDataURL('image/png');
      onFilterChange(filteredImageUrl);
    };

    img.src = imageUrl;
  }, [imageUrl, selectedFilter, brightness, contrast, saturation, blur, onFilterChange]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  const resetFilters = () => {
    setSelectedFilter('none');
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">🎨 Image Filters & Effects</h3>

      {/* Filter Presets */}
      <div className="space-y-3">
        <label className="block font-bold text-primary">Quick Filters</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {filterPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setSelectedFilter(preset.value)}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all touch-manipulation ${
                selectedFilter === preset.value
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-muted bg-background hover:bg-muted'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Adjustments */}
      <div className="space-y-4">
        <label className="block font-bold text-primary">Fine-tune Adjustments</label>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">Brightness</span>
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{brightness}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">Contrast</span>
            <input
              type="range"
              min="50"
              max="150"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{contrast}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">Saturation</span>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{saturation}%</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20">Blur</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12">{blur}px</span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={resetFilters}
        className="btn btn-secondary w-full min-h-[48px] touch-manipulation"
      >
        🔄 Reset All Filters
      </button>

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" width={800} height={600} />
    </div>
  );
}
