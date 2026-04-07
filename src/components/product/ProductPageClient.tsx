'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useWishlist } from '@/context/WishlistContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { VariantSelector } from './VariantSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductTabs } from './ProductTabs';
import { ProductCard } from './ProductCard';
import { AboutCarousel } from './AboutCarousel';
import { CompleteTheSet } from './CompleteTheSet';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { EditorialGrid } from '@/components/ui/EditorialGrid';
import { PolkaDots } from '@/components/ui/DecorativePatterns';
import { FilamentColorPicker } from './FilamentColorPicker';
import { CustomizationPanel } from './CustomizationPanel';
import { MadeToOrderBadge } from './MadeToOrderBadge';
import { formatCurrency } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';
import { getRecommendations, bulkTiers, productPages } from '@/data/products';
import { getAvailableColors } from '@/data/filament-colors';
import { getModelComponent } from './models';
import type { ProductPage, PrintCustomization } from '@/types';
import styles from './ProductPageClient.module.css';
import './AboutCarousel.css';

// Load the STL viewer client-only — Three.js requires browser APIs (WebGL) unavailable on the server
const STLViewer = dynamic(() => import('./STLViewer').then(m => ({ default: m.STLViewer })), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', color: '#888', fontSize: '14px' }}>
      Loading 3D model&hellip;
    </div>
  ),
});

const GCodeViewer = dynamic(() => import('./GCodeViewer').then(m => ({ default: m.GCodeViewer })), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', color: '#888', fontSize: '14px' }}>
      Loading 3D preview&hellip;
    </div>
  ),
});

export function ProductPageClient({ product }: { product: ProductPage }) {
  // Memoize model component lookup to satisfy React 19 render rules
  const ModelComponent = useMemo(() => getModelComponent(product.slug), [product.slug]);
  const hasModel = ModelComponent !== null;
  const is3DPrinted = product.fulfillmentType === '3d-printed';

  const [variantIdx, setVariantIdx] = useState(product.defaultVariantIndex);
  const [quantity, setQuantity] = useState(1);
  // Default to photo view — Three.js only loads when user clicks "3D Model"
  const [galleryView, setGalleryView] = useState<'3d' | 'photo'>('photo');

  // Initialize part colors with the first available color for each part
  const initialPartColors = useMemo(() => {
    if (!product.multiColorParts || !product.availableFilamentColorIds) return undefined;
    const firstColorId = product.availableFilamentColorIds[0] ?? 'white';
    return Object.fromEntries(product.multiColorParts.map(p => [p.id, firstColorId]));
  }, [product.multiColorParts, product.availableFilamentColorIds]);

  const [printCustomization, setPrintCustomization] = useState<PrintCustomization>({
    filamentColorId: product.variants[product.defaultVariantIndex].filamentColorId,
    partColors: initialPartColors,
  });
  const { addItem } = useCart();
  const { show } = useToast();
  const { toggle, isWishlisted } = useWishlist();
  const { track } = useRecentlyViewed();
  const { trigger } = useHaptics();

  // Available filament colors for this product
  const filamentColors = useMemo(
    () => (product.availableFilamentColorIds ? getAvailableColors(product.availableFilamentColorIds) : []),
    [product.availableFilamentColorIds]
  );

  // Keep filamentColorId in sync when variant changes externally
  const selectedColorHex = useMemo(() => {
    if (!is3DPrinted) return undefined;
    const v = product.variants[variantIdx];
    return v.colorHex;
  }, [is3DPrinted, product.variants, variantIdx]);

  // Material type for the 3D viewer (drives translucent / gradient mode)
  const selectedMaterialType = useMemo(() => {
    const colorId = printCustomization.filamentColorId;
    const fc = filamentColors.find(c => c.id === colorId);
    return (fc?.type ?? 'standard') as 'standard' | 'translucent' | 'gradient' | 'silk' | 'silk-gradient';
  }, [printCustomization.filamentColorId, filamentColors]);

  // Per-model rotation corrections (radians). Fixes orientation issues caused by
  // different Z-up / Y-up conventions between slicers and Three.js.
  const modelRotation = useMemo((): [number, number, number] => {
    const R = Math.PI;
    const corrections: Record<string, [number, number, number]> = {
      // Articulated animals — Z is print height → rotate X -90° so head goes to +Y (up)
      'rocktopus':              [-R / 2, 0, 0],
      'cute-octopus':           [-R / 2, 0, 0],
      'octopus-long-tentacles': [-R / 2, 0, 0],
      // Snake / slug — same X correction, then flip Y so head faces forward
      'cute-snakey':            [-R / 2, R, 0],
      'flex-slug':              [-R / 2, R, 0],
      // Dragon lies flat; tilt forward 30° so body reads as 3D, not a flat square
      'flexi-mecha-dragon':     [-R / 6, 0, 0],
    };
    return corrections[product.slug] ?? [0, 0, 0];
  }, [product.slug]);

  const variant = product.variants[variantIdx];
  const wishlisted = isWishlisted(variant.sku);
  const related = getRecommendations([{ sku: variant.sku, name: product.name }]);

  // Get full ProductPage objects for related products (for RecommendationCarousel)
  const relatedProductPages = useMemo(() => {
    const relatedSlugs = new Set(related.map(r => r.slug));
    return productPages.filter(p => relatedSlugs.has(p.slug));
  }, [related]);

  // Determine if thumbnail strip should show (only if variants have distinct images)
  const uniqueImages = useMemo(() => {
    const images = new Set(product.variants.map(v => v.image));
    return images.size > 1;
  }, [product.variants]);

  useEffect(() => {
    track({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      url: `/products/${product.slug}`,
    });
  }, [product.slug, variant, track]);

  const handleAddToCart = () => {
    addItem({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      quantity,
      fulfillmentType: product.fulfillmentType,
      customization: is3DPrinted ? printCustomization : undefined,
    });
    trigger('success');
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      show(`${variant.name} (${variant.variant}) added to cart`, 'success', 3000);
    }
  };

  // When a filament color is selected, also switch to the matching variant
  const handleFilamentColorChange = (colorId: string) => {
    const matchingIdx = product.variants.findIndex(v => v.filamentColorId === colorId);
    if (matchingIdx !== -1) setVariantIdx(matchingIdx);
    setPrintCustomization(prev => ({ ...prev, filamentColorId: colorId }));
  };

  const handleWishlist = () => {
    trigger('tap');
    const added = toggle({
      sku: variant.sku,
      name: variant.name,
      variant: variant.variant,
      price: variant.price,
      image: variant.image,
      url: `/products/${product.slug}`,
    });
    show(
      added ? `${variant.name} added to wishlist` : `${variant.name} removed from wishlist`,
      added ? 'success' : 'info',
      2000
    );
  };

  return (
    <>
      <div className={styles.layout}>
        <div className="reveal-item">
          <div className={styles.gallery}>
            {is3DPrinted && (product.gcodePreviewPath || product.stlFile) ? (
              <>
                {product.assembledPhotoUrl && (
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                    <button
                      onClick={() => setGalleryView('3d')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: '1px solid',
                        borderRadius: '8px 0 0 8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        background: galleryView === '3d' ? '#0d9488' : '#fff',
                        color: galleryView === '3d' ? '#fff' : '#555',
                        borderColor: galleryView === '3d' ? '#0d9488' : '#d1d5db',
                      }}
                      aria-pressed={galleryView === '3d'}
                    >
                      3D Model
                    </button>
                    <button
                      onClick={() => setGalleryView('photo')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: '1px solid',
                        borderRadius: '0 8px 8px 0',
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        background: galleryView === 'photo' ? '#0d9488' : '#fff',
                        color: galleryView === 'photo' ? '#fff' : '#555',
                        borderColor: galleryView === 'photo' ? '#0d9488' : '#d1d5db',
                        marginLeft: '-1px',
                      }}
                      aria-pressed={galleryView === 'photo'}
                    >
                      Assembled Photo
                    </button>
                  </div>
                )}
                {galleryView === '3d' ? (
                  product.gcodePreviewPath ? (
                    <GCodeViewer toolpathUrl={product.gcodePreviewPath} color={selectedColorHex ?? '#22d3ee'} />
                  ) : (
                    <STLViewer stlPath={product.stlFile!} color={selectedColorHex ?? '#3B82F6'} materialType={selectedMaterialType} modelRotation={modelRotation} />
                  )
                ) : (
                  <img
                    className={styles.galleryImage}
                    src={product.assembledPhotoUrl}
                    alt={`${product.name} — assembled`}
                    loading="eager"
                    style={{ viewTransitionName: `product-${product.slug}` }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
                  />
                )}
              </>
            ) : (
              <img
                className={styles.galleryImage}
                src={variant.image}
                alt={variant.name}
                loading="eager"
                style={{ viewTransitionName: `product-${product.slug}` }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }}
              />
            )}
            <div className={styles.galleryDecor} aria-hidden="true">
              <PolkaDots pattern="corner" size="sm" cornerPosition="top-right" />
            </div>
          </div>

          {!is3DPrinted && uniqueImages && (
            <div className={styles.thumbnails}>
              {product.variants.map((v, i) => (
                <button
                  key={v.sku}
                  className={`${styles.thumbnail}${i === variantIdx ? ` ${styles.thumbnailActive}` : ''}`}
                  onClick={() => { trigger('select'); setVariantIdx(i); }}
                  aria-label={`View ${v.variant}`}
                >
                  <img className={styles.thumbnailImg} src={v.image} alt={v.variant} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.svg'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.info} reveal-item`}>
          {is3DPrinted && (
            <div style={{ marginBottom: '12px' }}>
              <MadeToOrderBadge leadTime={product.printLeadTime} />
            </div>
          )}

          <SectionHeading heading={product.name} as="h1" dotAccent />

          <div className={styles.meta}>
            <span>SKU: {variant.sku}</span>
            <span>Category: {product.category}</span>
            {!is3DPrinted && (
              <span className={`${styles.availability}${variant.inventory === 0 ? ` ${styles.outOfStock}` : ''}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>
                {variant.inventory === 0 ? 'Out of Stock' : 'In Stock'}
              </span>
            )}
          </div>

          <div className={styles.price}>
            {formatCurrency(variant.price)}
            {variant.compareAtPrice && (
              <span className={styles.comparePrice}>{formatCurrency(variant.compareAtPrice)}</span>
            )}
          </div>

          {is3DPrinted && filamentColors.length > 0 ? (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Color</p>
              {product.multiColorParts && printCustomization.partColors ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {product.multiColorParts.map(part => (
                    <div key={part.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#444', width: '56px', flexShrink: 0 }}>{part.label}</span>
                      <FilamentColorPicker
                        colors={filamentColors}
                        selectedId={printCustomization.partColors![part.id] ?? filamentColors[0].id}
                        onChange={(colorId) =>
                          setPrintCustomization(prev => ({
                            ...prev,
                            partColors: { ...prev.partColors, [part.id]: colorId },
                          }))
                        }
                      />
                    </div>
                  ))}
                  <p style={{ margin: 0, fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                    Each part is printed separately in your chosen color and assembled.
                  </p>
                </div>
              ) : (
                <FilamentColorPicker
                  colors={filamentColors}
                  selectedId={printCustomization.filamentColorId ?? filamentColors[0].id}
                  onChange={handleFilamentColorChange}
                />
              )}
            </div>
          ) : (
            <VariantSelector
              variants={product.variants}
              selectedIndex={variantIdx}
              onSelect={setVariantIdx}
            />
          )}

          {(is3DPrinted || variant.inventory !== 0) && (
            <>
              {is3DPrinted && product.customizationOptions && (
                <div style={{ marginBottom: '16px' }}>
                  <CustomizationPanel
                    options={product.customizationOptions}
                    value={{ engravingText: printCustomization.engravingText, keychainHole: printCustomization.keychainHole }}
                    onChange={(val) => setPrintCustomization(prev => ({ ...prev, ...val }))}
                  />
                </div>
              )}

              <div className={styles.quantityRow}>
                <label className={styles.quantityLabel}>Quantity:</label>
                <QuantitySelector value={quantity} onChange={setQuantity} />
              </div>

              {!is3DPrinted && (
                <>
                  <div className={styles.bulkTier}>
                    {bulkTiers.map((t, i) => (
                      <span key={t.qty}>
                        <span className={quantity >= t.qty ? styles.bulkTierActive : undefined}>
                          {t.qty}+ units: {t.label}
                        </span>
                        {i < bulkTiers.length - 1 && <span className={styles.bulkTierDivider}>&middot;</span>}
                      </span>
                    ))}
                  </div>

                  {quantity >= 25 && (
                    <div className={styles.quantityWarningAmber}>
                      <svg className={styles.warningIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" /><path d="M12 17h.01" />
                      </svg>
                      <span>
                        <strong>Wholesale inquiry recommended.</strong> For orders of 25+ units we offer custom pricing and priority fulfillment.{' '}
                        <a href="/contact" className={styles.warningLink}>Contact our sales team</a> for a quote.
                      </span>
                    </div>
                  )}

                  {quantity >= 10 && quantity < 25 && (
                    <div className={styles.quantityWarningTeal}>
                      <svg className={styles.warningIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" /><path d="M12 8h.01" />
                      </svg>
                      <span>
                        Large order — bulk discount applied! Contact us for wholesale pricing on orders of 25+.
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <div className={styles.actions}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={!is3DPrinted && variant.inventory === 0}
            >
              {!is3DPrinted && variant.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className={`btn-wishlist${wishlisted ? ' active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={wishlisted}
              style={wishlisted ? { borderColor: '#EF4444', color: '#EF4444' } : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? '#EF4444' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          {(is3DPrinted || variant.inventory !== 0) && (
            <div className={styles.features}>
              <div className={styles.feature}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  {is3DPrinted ? (
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
                  ) : (
                    <><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M5 12h14" /><path d="M12 5v14" /></>
                  )}
                </svg>
                {is3DPrinted ? `Printed in-house \u00b7 ${product.printLeadTime ?? '3\u20135 business days'}` : 'Ships within 24-48 hours'}
              </div>
            </div>
          )}

        </div>
      </div>

      {hasModel && ModelComponent && product.about && (
        <section
          className="reveal-item model-carousel-row"
          aria-label={`About ${product.name} and interactive 3D molecular structure`}
        >
          <div className="model-carousel-row__carousel">
            <AboutCarousel about={product.about} productName={product.name} />
          </div>
          <div className="model-carousel-row__model">
            {/* eslint-disable-next-line react-hooks/static-components -- Dynamic component from getModelComponent is intentional */}
            {ModelComponent && <ModelComponent />}
          </div>
        </section>
      )}

      <div className="reveal-item">
        <ProductTabs
          description={product.description}
          about={product.about}
          specifications={product.specifications}
          careInstructions={product.careInstructions}
          hideDescription={hasModel}
          showMagnetWarning={product.slug === 'magnet-balls'}
          defaultTab={product.slug === 'magnet-balls' ? 'warning' : undefined}
        />
      </div>

      <div className="reveal-item">
        <CompleteTheSet currentProduct={product} allProducts={productPages} />
      </div>

      {relatedProductPages.length > 0 && (
        <div className="reveal-item">
          <section className={styles.youMayAlsoLike}>
            <SectionHeading heading="You May Also Like" eyebrow="Explore More" dotAccent as="h2" />
            <EditorialGrid layout="row">
              {relatedProductPages.slice(0, 3).map((p) => {
                const v = p.variants[p.defaultVariantIndex];
                return (
                  <ProductCard
                    key={p.slug}
                    product={{ ...v, sku: v.sku }}
                    slug={p.slug}
                    variantCount={p.variants.length}
                    badges={{
                      isNew: p.isNew,
                      isBestseller: p.isBestseller,
                    }}
                    allOutOfStock={p.isOutOfStock}
                  />
                );
              })}
            </EditorialGrid>
          </section>
        </div>
      )}
    </>
  );
}
