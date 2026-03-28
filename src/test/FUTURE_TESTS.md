# Future Tests — When Payment is Integrated

These tests should be implemented once a payment provider (e.g., Stripe) is added.

## Payment Integration Tests
- Payment intent creation returns correct amount matching `calculateOrderPricing()` total
- Failed payment does NOT clear cart
- Successful payment clears cart and persists order to Firebase
- Idempotency key from `useSubmissionGuard()` prevents duplicate charges on retry
- Network timeout during payment shows appropriate error and allows retry
- Payment amount is validated server-side (never trust client-calculated totals)

## Order Persistence Tests
- Order is created in Firebase Data Connect with correct line items
- Order total matches server-recalculated total (not client-sent total)
- Order includes idempotency key for dedup
- Duplicate order submissions with same idempotency key return existing order (not new charge)
- Order status starts as PROCESSING
- Order items include SKU, name, variant, quantity, unit price

## Webhook/Callback Tests
- Stripe webhook verifies signature before processing
- Payment success webhook creates order if not already created
- Payment failure webhook does not create order
- Duplicate webhook delivery is idempotent (same order, not duplicated)

## Race Condition Tests
- Two simultaneous form submissions with same idempotency key result in only one charge
- Browser refresh during payment shows correct state (pending/completed)
- Back button after payment shows confirmation, not checkout form
