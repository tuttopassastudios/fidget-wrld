'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { useHaptics } from '@/hooks/useHaptics';

// Mobile media query with useSyncExternalStore
const mobileQuery = '(max-width: 768px)';
function subscribeMobile(callback: () => void) {
  const mq = window.matchMedia(mobileQuery);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}
function getMobileSnapshot() {
  return window.matchMedia(mobileQuery).matches;
}
function getMobileServerSnapshot() {
  return false; // SSR default to desktop
}

interface ProductTabsProps {
  description: string;
  about?: string;
  specifications: Record<string, string>;
  careInstructions?: string;
  hideDescription?: boolean;
  showMagnetWarning?: boolean;
  defaultTab?: string;
}

const allTabs = [
  { id: 'description', label: 'Description' },
  { id: 'about', label: 'About' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'warning', label: 'Warning' },
  { id: 'care', label: 'Care & Safety' },
];

export function ProductTabs({ description, about, specifications, careInstructions, hideDescription, showMagnetWarning, defaultTab }: ProductTabsProps) {
  const tabs = allTabs.filter(t => {
    if (t.id === 'description' && hideDescription) return false;
    if (t.id === 'about' && !about) return false;
    if (t.id === 'warning' && !showMagnetWarning) return false;
    if (t.id === 'care' && !careInstructions) return false;
    return true;
  });

  // Determine initial tab: use defaultTab if provided, otherwise fall back to existing logic
  const getInitialTab = () => {
    if (defaultTab && tabs.some(t => t.id === defaultTab)) return defaultTab;
    if (hideDescription) return 'specifications';
    return 'description';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { trigger } = useHaptics();

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
      case 'warning':
        return (
          <div className="magnet-warning" style={{
            padding: '1.5rem',
            backgroundColor: 'var(--color-error-bg, #fef2f2)',
            border: '2px solid var(--color-error, #dc2626)',
            borderRadius: '8px',
          }}>
            <h3 style={{
              marginBottom: '1rem',
              color: 'var(--color-error, #dc2626)',
              fontSize: '1.25rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              INTERNAL INJURY HAZARD
            </h3>
            <p style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
            }}>
              Swallowed magnets can damage internal organs and have resulted in <strong>DEATH</strong> and <strong>SERIOUS INJURIES</strong>.
            </p>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text-primary)',
              lineHeight: 1.8,
            }}>
              <li>Keep away from <strong>ALL</strong> children.</li>
              <li>Be aware of dropped or separated magnets.</li>
              <li><strong>NEVER</strong> put near mouth or nose.</li>
            </ul>
            <p style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--color-error, #dc2626)',
              padding: '0.75rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '4px',
            }}>
              Seek prompt medical attention if you think magnet(s) have been swallowed or inhaled.
            </p>
          </div>
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
