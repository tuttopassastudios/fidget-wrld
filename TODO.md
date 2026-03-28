# Fidget WRLD — UI Redesign TODO

> **Goal:** Vivid. Joyful. Organized.
> POPMART-inspired redesign with oversized visuals, polka-dot system, editorial grids, bright accents.
> All existing functionality and accessibility must be preserved.

---

## Phase 1: Foundation

### Task 1.1 — Design Token Expansion
- [ ] **File:** `src/app/design-system.css`
- Add oversized typography: `--text-6xl: 5rem`, `--text-7xl: 6rem`
- Add generous spacing: `--space-32: 8rem`, `--space-40: 10rem`, `--space-48: 12rem`
- Add polka-dot palette: `--color-dot-pink`, `--color-dot-yellow`, `--color-dot-cyan`, `--color-dot-coral`, `--color-dot-violet`
- Add `--radius-3xl: 36px`
- Add `--shadow-playful: 0 8px 40px rgba(255,107,157,0.15), 0 2px 8px rgba(0,0,0,0.06)`
- Add `--transition-playful: 400ms cubic-bezier(0.34, 1.56, 0.64, 1)`
- Add `--grid-editorial-gap: clamp(16px, 3vw, 32px)`
- **Depends on:** Nothing
- **Blocks:** All Phase 2+ tasks

### Task 1.2 — Polka-Dot System Upgrade
- [ ] **Files:** `src/components/ui/DecorativePatterns.tsx`, `src/components/ui/DecorativePatterns.module.css`
- Add `pattern` prop: `'scatter'` (existing) | `'grid'` (uniform) | `'border'` (edges) | `'corner'` (cluster)
- Add `size` prop: `'sm'` (4px) | `'md'` (8px) | `'lg'` (12px)
- Add optional `animated` prop for subtle parallax drift on scroll
- Must respect `prefers-reduced-motion`
- Keep existing PolkaDots, FloatingShapes, GradientBlob exports working
- **Depends on:** Task 1.1 (dot color tokens)

### Task 1.3 — SectionHeading Component
- [ ] **Create:** `src/components/ui/SectionHeading.tsx`
- Reusable editorial section heading using Fredoka display font
- Props: `heading: string`, `eyebrow?: string` (small caps label above), `dotAccent?: boolean` (decorative dot next to heading), `align?: 'left' | 'center'`
- Responsive sizing with clamp()
- **Depends on:** Task 1.1

### Task 1.4 — Badge Component
- [ ] **Create:** `src/components/ui/Badge.tsx`
- Extract badge system from inline CSS classes into a React component
- Props: `variant: 'new' | 'bestseller' | 'hot' | 'limited' | 'sale' | 'exclusive' | 'category'`, `label: string`, `size?: 'sm' | 'md'`
- Render gradient backgrounds from design-system tokens
- Add new badge styles to `design-system.css`: `.badge-sale`, `.badge-exclusive`, `.badge-collectible`
- **Depends on:** Task 1.1

### Task 1.5 — EditorialGrid Component
- [ ] **Create:** `src/components/ui/EditorialGrid.tsx` + `EditorialGrid.module.css`
- Flexible CSS Grid layout component
- Props: `layout: 'even' | 'featured' | 'magazine'`, `children`, `gap?: string`
- `even`: equal columns (responsive 3 → 2 → 1)
- `featured`: one large cell + several standard cells
- `magazine`: asymmetric editorial layout with named grid areas
- Responsive collapse to single column on mobile
- **Depends on:** Task 1.1

---

## Phase 2: Core Components

### Task 2.1 — Hero Banner (Section 01)
- [ ] **Create:** `src/components/hero/HeroBanner.tsx` + `HeroBanner.module.css`
- [ ] **Modify:** `src/app/(storefront)/page.tsx` + `page.module.css`
- Full-viewport (`100dvh`) hero with CSS Grid: media area (70%) + content column (30%), stacks on mobile
- Props: `headline`, `subtitle`, `ctaText`, `ctaHref`, `mediaType: 'video' | 'image'`, `mediaSrc`, `posterSrc?`, `campaign?` (eyebrow text)
- Oversized Fredoka headline using `--text-7xl` with gradient text
- PolkaDots overlay with `pattern="scatter"`
- Animated scroll indicator (bouncing dot instead of chevron)
- Keep existing PageReveal + LiquidGlassProvider integrations on homepage
- Replace current static hero in page.tsx with HeroBanner
- **Depends on:** Tasks 1.1, 1.2

### Task 2.2 — Cart Drawer Refresh (Section 02)
- [ ] **Modify:** `src/components/cart/CartDrawer.tsx`, `src/app/globals.css` (cart drawer section)
- Width → 420px, border-radius → `--radius-2xl`
- Header: larger title in `--font-display`, decorative dot accent
- Item thumbnails: 60×60 (from 50×50), rounded with `--radius-md` + border
- Add item remove buttons per line item (currently missing)
- Polka-dot divider above footer instead of plain `border-top`
- Full-width "View Cart" CTA with `--transition-playful` hover
- Bolder shipping progress bar gradient
- Preserve all accessibility: focus trap, ESC key, aria-modal, aria-label, auto-close timer
- **Depends on:** Task 1.1

### Task 2.3 — Product Detail Page (Section 03)
- [ ] **Modify:** `src/components/product/ProductPageClient.tsx`
- [ ] **Modify:** `src/components/product/VariantSelector.tsx` — add color swatch rendering when `colorHex` is available on variant
- [ ] **Modify:** `src/components/product/ProductTabs.tsx` — hybrid: tabs on desktop, accordion on mobile (reuse FaqAccordion pattern)
- [ ] **Create:** `src/components/product/ProductPageClient.module.css`
- Add thumbnail strip below main product image
- Polka-dot corner decoration on gallery container
- Use SectionHeading for product name
- Move all inline styles → CSS module
- Preserve variant keyboard navigation (arrows, home, end)
- **Depends on:** Tasks 1.1, 1.2, 1.3

### Task 2.4 — Product Filtering (Section 04)
- [ ] **Modify:** `src/components/product/ProductsPageClient.tsx`
- [ ] **Create:** `src/components/product/FilterSidebar.tsx` + `FilterSidebar.module.css`
- [ ] **Create:** `src/components/product/PriceRangeSlider.tsx` — dual native `<input type="range">` (no external deps)
- [ ] **Create:** `src/components/product/ColorSwatchFilter.tsx` — clickable color circles from variant `colorHex` values
- Extract sidebar into FilterSidebar component
- Add mood/audience checkbox filter groups (data already on ProductPage type)
- "Clear all filters" button
- Active filter tags displayed above product grid
- Mobile: convert to slide-out filter panel with "Filters" trigger button
- **Depends on:** Tasks 1.1, 1.4

### Task 2.5 — Storytelling Menu (Section 05)
- [ ] **Modify:** `src/components/layout/SidebarMenu.tsx`, `src/app/sidebar-menu.css`
- Full-screen takeover (100vw/100vh) instead of side panel (38vw)
- Two-zone CSS Grid: nav items (60%) + category preview image (40%)
- Category image changes on hover/focus of each nav item
- Oversized typography: `clamp(2.5rem, 6vw, 4rem)`
- Polka-dot background decoration
- Category color-coded accents on each nav item
- Expandable sub-items under "Shop" (Magnetic, Squishy, Clicky, Stretchy, Desk Toys)
- Preserve all accessibility: focus trap, ESC, ARIA, tabIndex, body scroll lock
- **Depends on:** Tasks 1.1, 1.2

---

## Phase 3: Content Components

### Task 3.1 — Support Center (Section 06)
- [ ] **Create:** `src/app/(storefront)/support/page.tsx`
- [ ] **Create:** `src/components/support/SupportCenter.tsx` + `SupportCenter.module.css`
- [ ] **Create:** `src/components/support/ContactForm.tsx` — extract from `src/app/(storefront)/contact/page.tsx`
- [ ] **Create:** `src/components/support/SocialLinks.tsx`
- Unified page: FAQ accordion (60% left) + contact form (40% right) + social links below
- Reuse existing FaqAccordion component (already has category filtering)
- Category color-coded dots on FAQ sections
- Polka-dot decorative header
- Contact form card with playful border treatment
- Keep `/faq` and `/contact` working (redirect or render same content)
- **Depends on:** Tasks 1.1, 1.2, 1.3

### Task 3.2 — Recommendations (Section 07)
- [ ] **Create:** `src/components/product/RecommendationCarousel.tsx` + `RecommendationCarousel.module.css`
- [ ] **Create:** `src/components/product/CompleteTheSet.tsx`
- Wraps existing `src/components/ui/Carousel.tsx` specialized for products
- Props: `products`, `title`, `context: 'pdp' | 'cart' | 'homepage'`
- Context variants: PDP → "You May Also Like", Cart → "Frequently Bought Together", Homepage → "Trending Now"
- "Complete the Set" panel using `relatedSlugs` from product data
- **Integration points (separate sub-tasks):**
  - [ ] Homepage (`page.tsx`): add "Trending Now" carousel between best sellers and quality banner
  - [ ] PDP (`ProductPageClient.tsx`): replace basic related products grid
  - [ ] Cart drawer (`CartDrawer.tsx`): add mini recommendation row (1-2 items)
  - [ ] Cart page (`CartPageClient.tsx`): add "Frequently Bought Together" section
- **Depends on:** Tasks 1.1, 1.3

### Task 3.3 — Collection Grid (Section 08)
- [ ] **Modify:** `src/components/product/ProductCard.tsx`
- [ ] **Modify:** `src/app/design-system.css` (new badge styles)
- [ ] **Create:** `src/components/product/QuickViewModal.tsx` + `QuickViewModal.module.css`
- Add `size` prop to ProductCard: `'standard'` | `'featured'` | `'compact'`
- Featured cards: larger images, description snippet visible
- Add tag pills (moods, textures) below meta text
- Hover enhancement: gentle scale-up with polka-dot overlay reveal on image
- Quick View button on desktop hover → modal with key product details
- QuickViewModal: focus trap, ESC close, ARIA, keyboard accessible
- **Depends on:** Tasks 1.1, 1.2, 1.4, 1.5

### Task 3.4 — Designer Spotlight (Section 09)
- [ ] **Create:** `src/data/designers.ts` — static data: name, bio, avatar, featured product slugs
- [ ] **Create:** `src/components/about/DesignerSpotlight.tsx` + `DesignerSpotlight.module.css`
- [ ] **Create:** `src/components/about/DesignerCard.tsx`
- [ ] **Modify:** `src/app/(storefront)/about/page.tsx` — add designer spotlight section
- Large portrait/avatar area with polka-dot frame border
- Designer name in oversized Fredoka display font
- Editorial asymmetric grid (alternating image/text sides)
- Featured products per designer using RecommendationCarousel
- Heavy polka-dot pattern as section background signature
- **Depends on:** Tasks 1.1, 1.2, 1.3, 3.2 (RecommendationCarousel)

---

## Phase 4: Polish

### Task 4.1 — Homepage Final Assembly
- [ ] **Modify:** `src/app/(storefront)/page.tsx` + `page.module.css`
- Wire: HeroBanner, "Trending Now" carousel, EditorialGrid for best sellers, designer spotlight teaser, polka-dot section dividers
- Update stat strip with new typography tokens
- Add PolkaDots between major sections
- **Depends on:** Tasks 2.1, 3.2, 3.4, 1.5

### Task 4.2 — Inline Style Migration
- [ ] `src/components/product/ProductsPageClient.tsx` → CSS module
- [ ] `src/app/(storefront)/contact/page.tsx` → CSS module
- [ ] `src/app/(storefront)/about/page.tsx` → CSS module
- [ ] `src/app/(storefront)/faq/page.tsx` → CSS module
- Move inline styles to CSS modules for responsive media query support
- **Depends on:** Phase 3 complete

### Task 4.3 — Animation Polish
- [ ] Add scroll-triggered PolkaDots fade-in using existing FadeIn/MotionSection components
- [ ] Add ViewTransition hints (`viewTransitionName`) to new components
- [ ] Verify all animations disabled/reduced under `prefers-reduced-motion`
- **Depends on:** All component tasks complete

### Task 4.4 — Responsive + Accessibility Audit
- [ ] Test all components at: 480px, 768px, 1024px, 1280px
- [ ] Keyboard-only navigation: menu → products → filter → PDP → add to cart → cart drawer
- [ ] Screen reader walkthrough for content order
- [ ] Focus management in: QuickViewModal, FilterSidebar mobile, fullscreen menu
- [ ] `aria-hidden="true"` on all decorative PolkaDots
- [ ] Lighthouse audit — maintain Core Web Vitals
- **Depends on:** All tasks complete

---

## Dependency Graph

```
Phase 1 (foundation)
  1.1 Design Tokens ──┬──> 1.2 Polka-Dots
                       ├──> 1.3 SectionHeading
                       ├──> 1.4 Badge
                       └──> 1.5 EditorialGrid

Phase 2 (core)
  1.1 + 1.2 ──────────> 2.1 Hero Banner
  1.1 ─────────────────> 2.2 Cart Drawer
  1.1 + 1.2 + 1.3 ────> 2.3 Product Detail
  1.1 + 1.4 ──────────> 2.4 Product Filtering
  1.1 + 1.2 ──────────> 2.5 Storytelling Menu

Phase 3 (content)
  1.1 + 1.2 + 1.3 ────> 3.1 Support Center
  1.1 + 1.3 ──────────> 3.2 Recommendations
  1.1–1.5 ─────────────> 3.3 Collection Grid
  1.1–1.3 + 3.2 ──────> 3.4 Designer Spotlight

Phase 4 (polish)
  2.1 + 3.2 + 3.4 ────> 4.1 Homepage Assembly
  Phase 3 complete ────> 4.2 Inline Style Migration
  All components ──────> 4.3 Animation Polish
  Everything ──────────> 4.4 Responsive + A11y Audit
```

---

## Technical Notes
- **No new dependencies** — motion library + Carousel + native HTML inputs cover everything
- **Vercel Hobby safe** — all new components are client-rendered; server pages read local data only
- **Color strategy** — Pink stays as playful accent; Blue/Teal/Green for brand identity; polka-dots blend both
- **Next.js 16** — new `/support` page has no dynamic params; ViewTransition inherited from storefront layout
