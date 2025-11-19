'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Suggestion {
  text: string;
  fontSize: string;
  fontFamily: string;
  textColor: string;
  textPosition: { x: number; y: number };
}

interface AIDesignSuggestionsProps {
  onSuggestionSelect: (_suggestion: Suggestion) => void;
  occasion?: string;
  recipientType?: string;
}

const aiSuggestions: Record<string, Record<string, Suggestion[]>> = {
  holiday: {
    family: [
      {
        text: 'Warmest wishes for a joyful holiday season filled with love and laughter!',
        fontSize: '24',
        fontFamily: 'serif',
        textColor: '#dc2626',
        textPosition: { x: 50, y: 30 },
      },
      {
        text: 'May your holidays be merry and bright, surrounded by those you love most.',
        fontSize: '28',
        fontFamily: 'cursive',
        textColor: '#16a34a',
        textPosition: { x: 50, y: 70 },
      },
      {
        text: "Season's Greetings! Wishing you peace, joy, and happiness this holiday.",
        fontSize: '32',
        fontFamily: 'serif',
        textColor: '#ffffff',
        textPosition: { x: 50, y: 50 },
      },
    ],
    friends: [
      {
        text: "Cheers to the holidays! Here's to good times and great friends like you!",
        fontSize: '26',
        fontFamily: 'sans-serif',
        textColor: '#9333ea',
        textPosition: { x: 50, y: 40 },
      },
      {
        text: 'Happy Holidays! May your season be as awesome as our friendship!',
        fontSize: '24',
        fontFamily: 'cursive',
        textColor: '#ea580c',
        textPosition: { x: 50, y: 60 },
      },
    ],
    business: [
      {
        text: "Season's Greetings from our team to yours. Wishing you success in the new year!",
        fontSize: '20',
        fontFamily: 'serif',
        textColor: '#000000',
        textPosition: { x: 50, y: 50 },
      },
      {
        text: 'Happy Holidays! Thank you for your partnership and trust throughout the year.',
        fontSize: '22',
        fontFamily: 'sans-serif',
        textColor: '#2563eb',
        textPosition: { x: 50, y: 45 },
      },
    ],
  },
  birthday: {
    family: [
      {
        text: 'Happy Birthday to someone who makes life more beautiful!',
        fontSize: '28',
        fontFamily: 'cursive',
        textColor: '#dc2626',
        textPosition: { x: 50, y: 50 },
      },
      {
        text: 'Celebrating YOU today! Wishing you the happiest of birthdays!',
        fontSize: '32',
        fontFamily: 'serif',
        textColor: '#9333ea',
        textPosition: { x: 50, y: 40 },
      },
    ],
    friends: [
      {
        text: 'Another year older, another year wiser! Happy Birthday, my friend!',
        fontSize: '24',
        fontFamily: 'sans-serif',
        textColor: '#ea580c',
        textPosition: { x: 50, y: 45 },
      },
    ],
  },
};

export default function AIDesignSuggestions({
  onSuggestionSelect,
  occasion = 'holiday',
  recipientType = 'family',
}: AIDesignSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const occasionData = aiSuggestions[occasion] || aiSuggestions.holiday;
    const categorySuggestions =
      (occasionData as Record<string, Suggestion[]>)[recipientType] || aiSuggestions.holiday.family;
    setSuggestions(categorySuggestions);
    setIsGenerating(false);
  }, [occasion, recipientType]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  const regenerateSuggestions = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real implementation, this would call an AI service
    // For now, we'll shuffle the existing suggestions
    const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
    setSuggestions(shuffled);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary">🤖 AI Design Suggestions</h3>
        <button
          type="button"
          onClick={regenerateSuggestions}
          disabled={isGenerating}
          className="btn btn-secondary min-h-[48px] touch-manipulation disabled:opacity-50"
        >
          {isGenerating ? '🔄 Generating...' : '🔄 More Ideas'}
        </button>
      </div>

      {isGenerating ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="animate-pulse delay-75">
            <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 border-2 border-muted rounded-lg hover:border-accent transition-all cursor-pointer"
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary mb-2">Suggestion {index + 1}</p>
                <p
                  className="text-lg leading-relaxed"
                  style={{
                    fontSize: `${parseInt(suggestion.fontSize) * 0.7}px`,
                    fontFamily: suggestion.fontFamily,
                    color: suggestion.textColor,
                  }}
                >
                  {suggestion.text}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-muted rounded">{suggestion.fontFamily}</span>
                  <span className="px-2 py-1 bg-muted rounded">{suggestion.fontSize}px</span>
                  <span
                    className="px-2 py-1 rounded border"
                    style={{ borderColor: suggestion.textColor }}
                  >
                    Color
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        💡 AI analyzes your occasion and recipient to suggest the perfect message and styling
      </div>
    </div>
  );
}
