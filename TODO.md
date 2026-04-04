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

### ESLint Issues ✅ FIXED
- [x] Converted CJ SDK from CommonJS to ES modules (19 require() errors)
- [x] Removed unused imports and variables across 15+ files
- [x] Fixed unused expressions in Ballpit.tsx and CardNav.tsx
- [x] Fixed test setup.tsx mock
- [x] Configured ESLint to allow underscore-prefixed unused params
- Remaining: 4 `<img>` warnings (acceptable for dynamic product images)

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

---

## Phase 8: G-code Viewer (Made-to-Order Products)

> **Goal:** Replace STLViewer with an interactive 3D toolpath viewer on product pages for 3D-printed products.
> Customers can orbit/zoom and scrub through layers to watch their item "build up."
> Pre-process G-code locally → upload compact JSON to Supabase Storage → lightweight browser render.

### Architecture
- Slicer: Bambu Studio (Marlin-flavor G-code, absolute positioning G90, absolute extrusion M82)
- Pre-process locally: raw `.gcode` → compact toolpath JSON stored in Supabase Storage bucket `products`
- Viewer: Three.js `LineSegments` (no new deps — Three.js already in project)
- Print moves only (hide travel moves for clean look)
- Cumulative layer display: layers 1–N all visible, slider reveals up to selected layer
- Filament color from `FilamentColorPicker` drives toolpath line color in real time

### Bambu G-code specifics (for agents)
- Layer change: `; CHANGE_LAYER` comment in file OR Z value change on G1/G0
- Layer count in header: `; layer_count = N`
- Print move: `G1` line with `E` param where new E > current E (extrusion, not retract)
- Travel move: `G0`, or `G1` with no `E`, or `G1` where E ≤ current E (retraction)
- Absolute positioning (`G90`) and absolute extrusion (`M82`) are default — E values monotonically increase during printing, decrease on retract

### Toolpath JSON schema
```json
{
  "layerCount": 142,
  "layers": [
    { "z": 0.20, "verts": [x1, y1, x2, y2, x3, y3] },
    { "z": 0.40, "verts": [x1, y1, x2, y2] }
  ]
}
```
- `verts` is a flat array of X,Y pairs (Z is constant per layer, stored in `z`)
- In the viewer, reconstruct 3D points as `[x, z_height, y]` (Three.js Y-up convention)
- Segments are pairs: `[verts[0],verts[1]]` → `[verts[2],verts[3]]` etc.

### Tasks

- [x] **GV-1** — `scripts/process-gcode.js`: Bambu G-code → toolpath JSON + Supabase upload
- [x] **GV-2** — `src/components/product/GCodeViewer.tsx`: interactive 3D toolpath viewer
- [x] **GV-3** — `src/components/product/ProductPageClient.tsx`: swap STLViewer → GCodeViewer
- [x] **GV-4** — `src/data/products.ts` + `src/types/index.ts`: add `gcodePreviewPath` field

> ⏳ **Awaiting G-code files** — run `node scripts/process-gcode.js <file.gcode> <slug>` for each 3D-printed product and paste the returned URL into `gcodePreviewPath` in `src/data/products.ts`

### Dependency graph
```
GV-1 (script)   ──────────────────────────────────► (run manually, upload JSON)
GV-2 (viewer)   ──► GV-3 (product page) ──► GV-4 (types + data)
```
GV-1 and GV-2 can be built in parallel. GV-3 needs GV-2. GV-4 needs GV-3.

---

## Build Status

✅ **Site builds successfully** (`npm run build` passes)
- 66 static pages generated
- TypeScript compiles without errors
- Turbopack build in ~3.6s
- ESLint: 0 errors, 4 warnings (acceptable `<img>` warnings)
