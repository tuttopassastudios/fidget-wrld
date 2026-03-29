# Fidget WRLD — UI Redesign TODO

> **Goal:** Vivid. Joyful. Organized.
> POPMART-inspired redesign with oversized visuals, polka-dot system, editorial grids, bright accents.
> All existing functionality and accessibility must be preserved.
---

## Technical Notes
- **No new dependencies** — motion library + Carousel + native HTML inputs cover everything
- **Vercel Hobby safe** — all new components are client-rendered; server pages read local data only
- **Color strategy** — Pink stays as playful accent; Blue/Teal/Green for brand identity; polka-dots blend both
- **Next.js 16** — new `/support` page has no dynamic params; ViewTransition inherited from storefront layout

---

## Phase 1: Foundation ✅ COMPLETE

### Design System
- [x] Color tokens in `design-system.css` — POPMART-inspired pink accents, polka-dot palette
- [x] Typography with Quicksand font family
- [x] Spacing and sizing tokens
- [x] Category accent colors (magnetic, squishy, clicky, stretchy, desk, collectible)

### Core Components
- [x] `DecorativePatterns.tsx` — PolkaDots (scatter/grid/border/corner), FloatingShapes, GradientBlob
- [x] `SectionHeading.tsx` — eyebrow text, dot accent, BlurText animation
- [x] `EditorialGrid.tsx` — layouts: even, featured, magazine, row
- [x] `FadeIn.tsx`, `PageReveal.tsx`, `MotionSection.tsx` — scroll animations
- [x] `ReflectiveCard.tsx` — card with tilt/reflection effects

---

## Phase 2: Homepage ✅ COMPLETE

- [x] `BallpitHero` — 3D WebGL ball pit with physics, logo overlay, scroll hint
- [x] `CategoryBubbles` — pill-style category links with GSAP pop animations
- [x] Best Sellers section with `EditorialGrid layout="row"`
- [x] Newsletter signup with icon, heading, form
- [x] Responsive layout for mobile/tablet/desktop

---

## Phase 3: Product Experience ✅ COMPLETE

### Products Listing (`/products`)
- [x] `ProductsPageClient` — filter state management, URL sync
- [x] `FilterSidebar` — category, price range slider, color swatches, mood/audience filters
- [x] Active filter pills with remove functionality
- [x] Sort options (featured, price, name, newest)
- [x] `ProductCard` — image, badges (NEW/BEST/HOT), tags, quick view button, haptic feedback

### Product Detail (`/products/[slug]`)
- [x] `ProductPageClient` — variant selector, quantity, add to cart, wishlist
- [x] `ProductTabs` — description, specifications, reviews tabs
- [x] `AboutCarousel` — product feature carousel
- [x] `CompleteTheSet` — bundle recommendations
- [x] Related products with `EditorialGrid`
- [x] 3D model viewer for select products
- [x] View transitions between card and detail page

### Quick View
- [x] `QuickViewModal` — accessible modal with focus trap, ESC to close
- [x] Variant selection within modal
- [x] Add to cart from modal

---

## Phase 4: Support & Information ✅ COMPLETE

### Support Center (`/support`)
- [x] `SupportCenter.tsx` — hero, stats strip, two-column layout
- [x] `FaqAccordion` — expandable FAQ grouped by category
- [x] `ContactForm` — name, email, message fields with validation
- [x] `SocialLinks` — social media links
- [x] Schema.org FAQPage structured data

### Other Pages
- [x] `/about` — brand story, designer spotlight, testing methods carousel
- [x] `/faq` — full FAQ page
- [x] `/contact` — contact form page
- [x] `/terms`, `/privacy`, `/disclaimer` — legal pages

---

## Phase 5: Navigation & Layout ✅ COMPLETE

- [x] `CardNav` / `Header` — navigation header
- [x] `SidebarMenu` — mobile menu
- [x] `Dock` — mobile bottom navigation
- [x] `Footer` — shop links, support links, legal links
- [x] `AnnouncementBar` — promotional banner
- [x] `Breadcrumb` — page breadcrumbs

---

## Phase 6: E-commerce ✅ COMPLETE

### Cart & Checkout
- [x] `CartDrawer` — slide-out cart
- [x] `CartPageClient` — full cart page
- [x] `CheckoutPageClient` — checkout flow
- [x] `CheckoutProgress` — step indicator

### Context & State
- [x] `CartContext` — cart state management
- [x] `WishlistContext` — wishlist functionality
- [x] `RecentlyViewedContext` — recently viewed tracking
- [x] `ToastContext` — notification toasts

---

## Phase 7: Dashboard ✅ COMPLETE

- [x] Dashboard layout with sidebar navigation
- [x] Analytics page with charts (revenue, orders, top products)
- [x] Orders management page
- [x] Products management page
- [x] Customers page
- [x] COA (Certificate of Analysis) management
- [x] Health monitoring page
- [x] Settings page
- [x] Admin authentication guard

---

## Quality Audit Results (2026-03-29)

### Lighthouse Scores
| Category | Score | Status |
|----------|-------|--------|
| Performance | 42 | ⚠️ Needs Work |
| Accessibility | 92 | ✅ Good |
| Best Practices | 100 | ✅ Perfect |
| SEO | 100 | ✅ Perfect |

### Performance Issues (Priority: High)
- [ ] **LCP: 12.2s** — BallpitHero 3D WebGL causing slow largest contentful paint
  - Consider lazy-loading the 3D scene or using a static fallback initially
  - Add `loading="eager"` to hero logo image
- [ ] **TBT: 1,370ms** — Too much JavaScript blocking main thread
  - Code-split GSAP and Three.js imports
  - Use `dynamic()` with `ssr: false` for heavy components
- [ ] **Unused JS: 553 KiB** — Large amount of unused JavaScript
  - Audit imports in `CategoryBubbles.tsx` (GSAP)
  - Review dashboard components loaded on storefront
- [ ] **Bundle size: 3.1MB total** — Largest chunks: 534K, 357K, 357K
  - Identify what's in large chunks and split accordingly

### Accessibility Issues (Priority: Medium)
- [ ] **Color contrast** — Some text/background combinations fail WCAG
  - Audit `--color-text-muted` against light backgrounds
  - Check pink accent text on white
- [ ] **Heading order** — Headings not in sequential order (h1 → h3 skip)
  - Audit page heading hierarchy
- [ ] **Links without names** — Some links missing discernible text
  - Add `aria-label` to icon-only links

### ESLint Issues (49 errors, 54 warnings)

#### Errors to Fix
- [ ] `BallpitHero.tsx:15` — setState in useEffect (use initialization pattern)
- [ ] `CheckoutPageClient.tsx:70` — `Math.random()` in render (move to state/useMemo)
- [ ] `DashboardGuard.tsx:55` — Use `<Link>` instead of `<a>` for internal navigation
- [ ] `DashboardSidebar.tsx:88` — setState in useEffect on route change
- [ ] `LiveOrderFeed.tsx:79` — setState in useEffect for data fetching
- [ ] `src/lib/supabase/types.ts` — Replace `{}` with `object` or `unknown`

#### Warnings to Clean Up
- [ ] Remove unused variables across 15+ files
- [ ] Fix test setup file (`src/test/setup.tsx`) mock issues

---

## Outstanding Items / Polish

### Potential Enhancements (Not Started)
- [ ] Dark mode toggle (design tokens exist but toggle UI not implemented)
- [ ] Wishlist page (context exists, dedicated page could be added)
- [ ] Order confirmation page with confetti animation
- [ ] Product comparison feature
- [ ] Gift card support
- [ ] Reviews/ratings submission form

### Manual Testing Needed
- [ ] Keyboard navigation on all interactive elements
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Mobile touch interactions
- [ ] Reduced motion preference honored

---

## Build Status

✅ **Site builds successfully** (`npm run build` passes)
- 66 static pages generated
- TypeScript compiles without errors
- Turbopack build in ~3.6s
- ESLint: 49 errors, 54 warnings (does not block build)
