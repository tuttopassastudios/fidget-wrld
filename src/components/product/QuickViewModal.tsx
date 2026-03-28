'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useHaptics } from '@/hooks/useHaptics';
import { formatCurrency } from '@/lib/utils';
import { VariantSelector } from '@/components/product/VariantSelector';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import type { ProductPage } from '@/types';
import styles from './QuickViewModal.module.css';

interface QuickViewModalProps {
  product: ProductPage;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { trigger } = useHaptics();
  const [variantIdx, setVariantIdx] = useState(product.defaultVariantIndex);
  const [quantity, setQuantity] = useState(1);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const variant = product.variants[variantIdx];

  // Store the element that triggered the modal
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus trap + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      // Return focus to trigger element
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const handleAddToCart = () => {
    addItem({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      quantity,
    });
    trigger('success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeBtnRef}
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close quick view"
        >
          ✕
        </button>

        <div className={styles.grid}>
          {/* Image */}
          <div className={styles.imageWrap}>
            <img
              src={variant.image}
              alt={`${product.name} — ${variant.variant}`}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
            />
          </div>

          {/* Info */}
          <div className={styles.info}>
            <h2 className={styles.name}>{product.name}</h2>

            <span className={`badge badge-${product.category.toLowerCase().replace(/\s+/g, '-')} ${styles.category}`}>
              {product.category}
            </span>

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatCurrency(variant.price)}</span>
              {variant.compareAtPrice && (
                <span className={styles.comparePrice}>{formatCurrency(variant.compareAtPrice)}</span>
              )}
            </div>

            {product.variants.length > 1 && (
              <VariantSelector
                variants={product.variants}
                selectedIndex={variantIdx}
                onSelect={setVariantIdx}
              />
            )}

            <QuantitySelector value={quantity} onChange={setQuantity} />

            <button
              className={`btn btn-primary ${styles.addToCart}`}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <Link
              href={`/products/${product.slug}`}
              className={styles.viewDetails}
              onClick={onClose}
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
