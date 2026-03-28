'use client';

import { useState } from 'react';
import { useHaptics } from '@/hooks/useHaptics';

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { trigger } = useHaptics();

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean))) as string[];
  const filtered = activeCategory ? items.filter(i => i.category === activeCategory) : items;

  return (
    <div>
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            style={{
              background: !activeCategory ? 'var(--color-accent-primary)' : 'var(--color-bg-elevated)',
              color: !activeCategory ? 'var(--color-text-on-accent, #001428)' : 'var(--color-text-secondary)',
              border: '1px solid',
              borderColor: !activeCategory ? 'var(--color-accent-primary)' : 'var(--color-border)',
              borderRadius: 9999,
              padding: '7px 18px',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'background 0.15s, color 0.15s, border-color 0.15s',
            }}
            onClick={() => { trigger('select'); setActiveCategory(null); setOpenIndex(null); }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              style={{
                background: activeCategory === cat ? 'var(--color-accent-primary)' : 'var(--color-bg-elevated)',
                color: activeCategory === cat ? 'var(--color-text-on-accent, #001428)' : 'var(--color-text-secondary)',
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--color-accent-primary)' : 'var(--color-border)',
                borderRadius: 9999,
                padding: '7px 18px',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.5px',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}
              onClick={() => { trigger('select'); setActiveCategory(cat); setOpenIndex(null); }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {filtered.map((item, i) => (
          <div
            key={`${activeCategory}-${i}`}
            style={{
              borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <button
              aria-expanded={openIndex === i}
              onClick={() => { trigger('tap'); setOpenIndex(openIndex === i ? null : i); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                width: '100%',
                padding: '18px 24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: openIndex === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                lineHeight: 1.4,
                transition: 'color 0.15s',
              }}
            >
              <span>{item.question}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  transform: openIndex === i ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              style={{
                maxHeight: openIndex === i ? 500 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}
            >
              <p style={{
                padding: '0 24px 20px',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                lineHeight: 1.7,
                margin: 0,
              }}>
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {activeCategory && (
        <p style={{
          marginTop: 16,
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}>
          Showing {filtered.length} of {items.length} questions
        </p>
      )}
    </div>
  );
}
