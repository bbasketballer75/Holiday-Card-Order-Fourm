'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import ImageFilter from './ImageFilter';
import AIDesignSuggestions from './AIDesignSuggestions';

interface CardCustomizerProps {
  template: { title: string; description: string; imageUrl?: string | null };
  initialText?: string;
  initialImage?: string;
  onSave: (_custom: {
    text: string;
    image: string;
    fontSize: string;
    fontFamily: string;
    textPosition: { x: number; y: number };
    textColor: string;
  }) => void;
  onCancel: () => void;
}

export default function CardCustomizer({
  template,
  initialText = '',
  initialImage = '',
  onSave,
  onCancel,
}: CardCustomizerProps) {
  const [text, setText] = useState(initialText);
  const [preview, setPreview] = useState(initialImage);
  const [filteredPreview, setFilteredPreview] = useState(initialImage);
  const [fontSize, setFontSize] = useState('24');
  const [fontFamily, setFontFamily] = useState('serif');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 80 });
  const [textColor, setTextColor] = useState('#ffffff');
  const [isDragging, setIsDragging] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPreview(result);
        setFilteredPreview(result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPreview(result);
        setFilteredPreview(result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleTextPositionChange(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTextPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }

  const handleAISuggestionSelect = (suggestion: {
    text: string;
    fontSize: string;
    fontFamily: string;
    textColor: string;
    textPosition: { x: number; y: number };
  }) => {
    setText(suggestion.text);
    setFontSize(suggestion.fontSize);
    setFontFamily(suggestion.fontFamily);
    setTextColor(suggestion.textColor);
    setTextPosition(suggestion.textPosition);
  };

  const fonts = [
    { value: 'serif', label: 'Classic Serif' },
    { value: 'sans-serif', label: 'Modern Sans' },
    { value: 'cursive', label: 'Script' },
    { value: 'monospace', label: 'Typewriter' },
  ];

  const colors = [
    { value: '#ffffff', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: '#dc2626', label: 'Red' },
    { value: '#16a34a', label: 'Green' },
    { value: '#2563eb', label: 'Blue' },
    { value: '#9333ea', label: 'Purple' },
    { value: '#ea580c', label: 'Orange' },
  ];

  return (
    <div className="card p-8 animate-in fade-in space-y-6">
      <h2 className="text-3xl font-bold text-primary mb-6">🎨 Design Your Card</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-primary">Live Preview</h3>

          <div
            ref={cardRef}
            className={`relative w-full h-80 bg-muted rounded-xl shadow-lg overflow-hidden cursor-crosshair transition-all ${
              isDragging ? 'ring-4 ring-accent ring-opacity-50' : ''
            }`}
            onClick={handleTextPositionChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Background Image */}
            {filteredPreview ? (
              <Image src={filteredPreview} alt="Custom" fill className="object-cover" />
            ) : preview ? (
              <Image src={preview} alt="Custom" fill className="object-cover" />
            ) : template.imageUrl ? (
              <Image src={template.imageUrl} alt={template.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            )}

            {/* Text Overlay */}
            {text && (
              <div
                className="absolute text-center font-bold pointer-events-none select-none"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  color: textColor,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  maxWidth: '90%',
                }}
              >
                {text}
              </div>
            )}

            {/* Drag Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <p className="text-primary font-bold">📸 Drop image here</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary w-full min-h-[48px] touch-manipulation"
            >
              📤 Upload Photo/Design
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Drag & drop images above or click to browse
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-primary">Design Tools</h3>

          {/* Filter Toggle */}
          {(preview || template.imageUrl) && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary w-full min-h-[48px] touch-manipulation"
            >
              {showFilters ? '🎨 Hide Filters' : '🎨 Show Filters'}
            </button>
          )}

          {/* Image Filter Component */}
          {showFilters && (preview || template.imageUrl) && (
            <ImageFilter
              imageUrl={preview || template.imageUrl || ''}
              onFilterChange={setFilteredPreview}
            />
          )}

          {/* AI Suggestions Toggle */}
          <button
            type="button"
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className="btn btn-secondary w-full min-h-[48px] touch-manipulation"
          >
            {showAISuggestions ? '🤖 Hide AI Ideas' : '🤖 Get AI Suggestions'}
          </button>

          {/* AI Suggestions Component */}
          {showAISuggestions && (
            <AIDesignSuggestions
              onSuggestionSelect={handleAISuggestionSelect}
              occasion="holiday"
              recipientType="family"
            />
          )}

          {/* Text Input */}
          <div className="space-y-2">
            <label className="block font-bold text-primary">Message Text</label>
            <textarea
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Write a special holiday message..."
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">{text.length}/200 characters</p>
          </div>

          {/* Font Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-bold text-primary">Font Style</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="input"
              >
                {fonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-primary">Text Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="input"
              >
                <option value="16">Small</option>
                <option value="24">Medium</option>
                <option value="32">Large</option>
                <option value="40">Extra Large</option>
              </select>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="block font-bold text-primary">Text Color</label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setTextColor(color.value)}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    textColor === color.value
                      ? 'border-accent ring-2 ring-accent/50'
                      : 'border-muted'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Position Indicator */}
          <div className="space-y-2">
            <label className="block font-bold text-primary">Text Position</label>
            <p className="text-sm text-muted-foreground">
              Click anywhere on the preview to position your text
            </p>
            <div className="text-xs text-muted-foreground">
              Current: X: {Math.round(textPosition.x)}%, Y: {Math.round(textPosition.y)}%
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className="btn btn-secondary flex-1 min-h-[48px] touch-manipulation"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1 min-h-[48px] touch-manipulation"
              onClick={() =>
                onSave({
                  text,
                  image: filteredPreview || preview || '',
                  fontSize,
                  fontFamily,
                  textPosition,
                  textColor,
                })
              }
            >
              💾 Save Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
