'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FidgetWrldLogo } from '@/components/ui/FidgetWrldLogo';
import { PolkaDots } from '@/components/ui/DecorativePatterns';
import styles from './HeroBanner.module.css';

interface HeroBannerProps {
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  mediaType: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  campaign?: string;
  children?: React.ReactNode;
}

export function HeroBanner({
  headline,
  subtitle,
  ctaText,
  ctaHref,
  mediaType,
  mediaSrc,
  posterSrc,
  campaign,
  children,
}: HeroBannerProps) {
  return (
    <section className={styles.heroBanner} id="top">
      {/* Media area */}
      <div className={styles.mediaArea}>
        {mediaType === 'video' ? (
          <video
            className={styles.media}
            autoPlay
            muted
            loop
            playsInline
            poster={posterSrc}
          >
            <source src={mediaSrc} type="video/mp4" />
          </video>
        ) : (
          <div className={styles.mediaImageWrapper}>
            <Image
              src={mediaSrc}
              alt=""
              fill
              priority
              sizes="70vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <PolkaDots
          className={styles.dotsOverlay}
          pattern="scatter"
          size="md"
        />
      </div>

      {/* Content column */}
      <div className={styles.contentColumn}>
        <FidgetWrldLogo className={styles.logo} size="lg" />
        {campaign && <p className={styles.campaign}>{campaign}</p>}
        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.cta}>
          <Link href={ctaHref} className="btn btn-primary btn-lg">
            {ctaText}
          </Link>
        </div>
        {children}
      </div>

      {/* Scroll indicator — bouncing dot */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.dot} />
      </div>
    </section>
  );
}
