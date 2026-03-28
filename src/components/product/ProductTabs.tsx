'use client';

import { useState, useCallback, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useHaptics } from '@/hooks/useHaptics';

interface ProductTabsProps {
  description: string;
  about?: string;
  specifications: Record<string, string>;
  careInstructions?: string;
  hideDescription?: boolean;
}

const allTabs = [
  { id: 'description', label: 'Description' },
  { id: 'about', label: 'About' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'care', label: 'Care & Safety' },
];

export function ProductTabs({ description, about, specifications, careInstructions, hideDescription }: ProductTabsProps) {
  const tabs = allTabs.filter(t => {
    if (t.id === 'description' && hideDescription) return false;
    if (t.id === 'about' && !about) return false;
    if (t.id === 'care' && !careInstructions) return false;
    return true;
  });
  const [activeTab, setActiveTab] = useState(hideDescription ? 'specifications' : 'description');
  const [isMobile, setIsMobile] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { trigger } = useHaptics();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(tabs[newIndex].id);
    const btn = e.currentTarget.parentElement?.querySelector(`[data-tab-id="${tabs[newIndex].id}"]`) as HTMLButtonElement | null;
    btn?.focus();
  }, [activeTab, tabs]);

  const toggleAccordion = (id: string) => {
    trigger('tap');
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const renderContent = (tabId: string) => {
    switch (tabId) {
      case 'description':
        return (
          <>
            <h3 style={{ marginBottom: '1rem' }}>Product Description</h3>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
          </>
        );
      case 'about':
        return about ? (
          <div className="product-about" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(about) }} />
        ) : null;
      case 'specifications':
        return (
          <>
            <h3 style={{ marginBottom: '1rem' }}>Product Specifications</h3>
            <table className="specs-table">
              <tbody>
                {Object.entries(specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      case 'care':
        return careInstructions ? (
          <>
            <h3 style={{ marginBottom: '1rem' }}>Care &amp; Safety</h3>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(careInstructions) }} />
          </>
        ) : null;
      default:
        return null;
    }
  };

  // Mobile: accordion layout
  if (isMobile) {
    return (
      <div className="product-tabs">
        {tabs.map(tab => {
          const isOpen = openAccordion === tab.id;
          return (
            <div key={tab.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <button
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${tab.id}`}
                id={`accordion-header-${tab.id}`}
                onClick={() => toggleAccordion(tab.id)}
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
                  color: isOpen ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  transition: 'color 0.15s',
                }}
              >
                <span>{tab.label}</span>
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
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                id={`accordion-panel-${tab.id}`}
                role="region"
                aria-labelledby={`accordion-header-${tab.id}`}
                style={{
                  maxHeight: isOpen ? 1000 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <div style={{ padding: '0 24px 20px' }}>
                  {renderContent(tab.id)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: tabs layout
  return (
    <div className="product-tabs">
      <div className="tabs-header" role="tablist" aria-label="Product information">
        {tabs.map(tab => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => { trigger('select'); setActiveTab(tab.id); }}
            onKeyDown={handleTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          className={`tab-content${activeTab === tab.id ? ' active' : ''}`}
          style={{ display: activeTab === tab.id ? 'block' : 'none' }}
        >
          {renderContent(tab.id)}
        </div>
      ))}
    </div>
  );
}
