'use client';

import { useState, useCallback } from 'react';
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

      <div id="tabpanel-description" role="tabpanel" aria-labelledby="tab-description" className={`tab-content${activeTab === 'description' ? ' active' : ''}`} style={{ display: activeTab === 'description' ? 'block' : 'none' }}>
        <h3 style={{ marginBottom: '1rem' }}>Product Description</h3>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
      </div>

      {about && (
        <div id="tabpanel-about" role="tabpanel" aria-labelledby="tab-about" className={`tab-content${activeTab === 'about' ? ' active' : ''}`} style={{ display: activeTab === 'about' ? 'block' : 'none' }}>
          <div className="product-about" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(about) }} />
        </div>
      )}

      <div id="tabpanel-specifications" role="tabpanel" aria-labelledby="tab-specifications" className={`tab-content${activeTab === 'specifications' ? ' active' : ''}`} style={{ display: activeTab === 'specifications' ? 'block' : 'none' }}>
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
      </div>

      {careInstructions && (
        <div id="tabpanel-care" role="tabpanel" aria-labelledby="tab-care" className={`tab-content${activeTab === 'care' ? ' active' : ''}`} style={{ display: activeTab === 'care' ? 'block' : 'none' }}>
          <h3 style={{ marginBottom: '1rem' }}>Care & Safety</h3>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(careInstructions) }} />
        </div>
      )}
    </div>
  );
}
