'use client';

import { useState, useEffect } from 'react';
import { Carousel, type CarouselItem } from '@/components/ui/Carousel';
import styles from './TestingMethodsCarousel.module.css';

function SafetyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function QualityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5">
      <circle cx="12" cy="8" r="6" />
      <path d="M12 2v12" />
      <path d="M12 14v8" />
      <path d="M9 18h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function MaterialsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function TestingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v2H9zM10 5v4l-4 8h12l-4-8V5" />
      <path d="M6 17v4h12v-4" />
    </svg>
  );
}

function CertifiedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SafetyContent() {
  return (
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <SafetyIcon />
        </div>
        <div>
          <div className={styles.cardTitle}>Safety Testing</div>
          <div className={styles.cardSubtitle}>Child-Safe & Non-Toxic Materials</div>
        </div>
      </div>

      <div className={styles.cardSection}>
        <div className={styles.sectionTitle}>Our Commitment</div>
        <p className={styles.sectionText}>
          Every fidget toy in our collection undergoes rigorous safety testing to ensure it meets or exceeds international safety standards.
        </p>
      </div>

      <div className={styles.cardSection}>
        <div className={styles.sectionTitle}>Testing Process</div>
        <div className={styles.stepsRow}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <MaterialsIcon />
            </div>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepText}>Material sourcing</div>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <TestingIcon />
            </div>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepText}>Lab testing</div>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <CertifiedIcon />
            </div>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepText}>Certification</div>
          </div>
        </div>
      </div>

      <div className={styles.cardSection}>
        <div className={styles.sectionTitle}>Safety Standards</div>
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>Lead &amp; phthalate free materials</span>
          </div>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>ASTM F963 toy safety compliant</span>
          </div>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>Non-toxic coatings &amp; finishes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QualityContent() {
  return (
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <QualityIcon />
        </div>
        <div>
          <div className={styles.cardTitle}>Durability Testing</div>
          <div className={styles.cardSubtitle}>Built to Last Through Endless Fidgeting</div>
        </div>
      </div>

      <div className={styles.cardSection}>
        <div className={styles.sectionTitle}>Quality Assurance</div>
        <p className={styles.sectionText}>
          We test every product design for durability, ensuring your fidget toys can withstand thousands of clicks, squishes, and spins without breaking down.
        </p>
      </div>

      <div className={styles.cardSection}>
        <div className={styles.sectionTitle}>What We Test</div>
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>10,000+ click cycle testing</span>
          </div>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>Drop &amp; impact resistance</span>
          </div>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>Magnet strength retention</span>
          </div>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>Color &amp; coating durability</span>
          </div>
          <div className={styles.benefit}>
            <CheckIcon />
            <span>Temperature stability</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const testingMethods: CarouselItem[] = [
  {
    id: 'safety',
    title: 'Safety Testing',
    content: <SafetyContent />,
  },
  {
    id: 'quality',
    title: 'Durability Testing',
    content: <QualityContent />,
  },
];

export function TestingMethodsCarousel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={styles.carousel}>
      <div className={styles.header}>
        <p className={styles.label}>Quality Assurance</p>
        <h2 className={styles.title}>Our Testing Standards</h2>
        <p className={styles.description}>
          Every fidget toy we sell meets strict safety and quality standards. Swipe to learn about our testing process.
        </p>
      </div>

      <div className={styles.carouselWrapper}>
        <Carousel
          items={testingMethods}
          baseWidth={isMobile ? 340 : 750}
          autoplay={false}
          loop={true}
        />
      </div>
    </div>
  );
}
