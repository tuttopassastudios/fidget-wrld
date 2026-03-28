# Fidget WRLD — UI Redesign TODO

> **Goal:** Vivid. Joyful. Organized.
> POPMART-inspired redesign with oversized visuals, polka-dot system, editorial grids, bright accents.
> All existing functionality and accessibility must be preserved.

---

## Complete

All 20 tasks across 4 phases are done.

### Task 4.3 — Animation Polish
- [x] Add scroll-triggered PolkaDots fade-in using existing FadeIn/MotionSection components
- [x] Add ViewTransition hints (`viewTransitionName`) to new components
- [x] Verify all animations disabled/reduced under `prefers-reduced-motion`

---

## Technical Notes
- **No new dependencies** — motion library + Carousel + native HTML inputs cover everything
- **Vercel Hobby safe** — all new components are client-rendered; server pages read local data only
- **Color strategy** — Pink stays as playful accent; Blue/Teal/Green for brand identity; polka-dots blend both
- **Next.js 16** — new `/support` page has no dynamic params; ViewTransition inherited from storefront layout
