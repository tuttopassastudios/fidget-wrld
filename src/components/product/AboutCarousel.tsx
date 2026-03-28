'use client';

import { useMemo, useState, useEffect } from 'react';
import { Carousel, type CarouselItem } from '@/components/ui/Carousel';

interface AboutSection {
  title: string;
  content: string;
}

function parseAboutHtml(html: string): AboutSection[] {
  // Parse HTML sections by h3 headers
  const sections: AboutSection[] = [];

  // Create a temporary container to parse HTML
  if (typeof window === 'undefined') {
    // Server-side: use regex parsing
    const h3Regex = /<h3>(.*?)<\/h3>([\s\S]*?)(?=<h3>|<\/div>$)/gi;
    let match;
    while ((match = h3Regex.exec(html)) !== null) {
      const title = match[1].replace(/&amp;/g, '&').trim();
      const content = match[2].trim();
      if (title && content) {
        sections.push({ title, content });
      }
    }
  } else {
    // Client-side: use DOM parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headers = doc.querySelectorAll('h3');

    headers.forEach((h3) => {
      const title = h3.textContent?.trim() || '';
      let content = '';
      let sibling = h3.nextElementSibling;

      while (sibling && sibling.tagName !== 'H3') {
        content += sibling.outerHTML;
        sibling = sibling.nextElementSibling;
      }

      if (title && content) {
        sections.push({ title, content });
      }
    });
  }

  return sections;
}

// Icon mapping for different section types
function getSectionIcon(title: string) {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('overview')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    );
  }

  if (lowerTitle.includes('chemical') || lowerTitle.includes('composition')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
        <path d="M10 2v7.31" /><path d="M14 9.3V1.99" />
        <path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
      </svg>
    );
  }

  if (lowerTitle.includes('origin') || lowerTitle.includes('discovery')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
        <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
        <path d="M12 2v2" /><path d="M12 20v2" />
        <path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" />
        <path d="M2 12h2" /><path d="M20 12h2" />
        <path d="m6.3 17.7-1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" />
      </svg>
    );
  }

  if (lowerTitle.includes('mechanism')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  if (lowerTitle.includes('research') || lowerTitle.includes('application')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
        <path d="M9 2h6v6l3 3-3 3v6H9v-6l-3-3 3-3V2z" />
        <path d="M12 8v8" />
      </svg>
    );
  }

  if (lowerTitle.includes('related')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51 15.42 17.49" /><path d="M15.41 6.51 8.59 10.49" />
      </svg>
    );
  }

  // Default icon
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="carousel-icon">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

interface AboutCarouselProps {
  about: string;
  productName: string;
}

export function AboutCarousel({ about, productName }: AboutCarouselProps) {
  const sections = useMemo(() => parseAboutHtml(about), [about]);

  // Responsive baseWidth for mobile
  const [baseWidth, setBaseWidth] = useState(600);

  useEffect(() => {
    const updateWidth = () => {
      const isMobile = window.innerWidth <= 768;
      // On mobile: viewport width minus page padding (16px each side)
      // On desktop: fixed 600px
      setBaseWidth(isMobile ? window.innerWidth - 32 : 600);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const carouselItems: CarouselItem[] = useMemo(() => {
    return sections.map((section, index) => ({
      id: index,
      title: section.title,
      content: (
        <div className="about-carousel-card">
          <div className="about-carousel-header">
            <div className="about-carousel-icon">
              {getSectionIcon(section.title)}
            </div>
            <div className="about-carousel-title-group">
              <h3 className="about-carousel-title">{section.title}</h3>
              <span className="about-carousel-subtitle">{productName}</span>
            </div>
          </div>
          <div
            className="about-carousel-content"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        </div>
      ),
    }));
  }, [sections, productName]);

  if (carouselItems.length === 0) {
    return null;
  }

  return (
    <div className="about-carousel-wrapper">
      <Carousel
        items={carouselItems}
        baseWidth={baseWidth}
        loop
        autoplay={false}
      />
    </div>
  );
}
