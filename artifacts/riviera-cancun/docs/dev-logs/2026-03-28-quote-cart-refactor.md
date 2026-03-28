# 2026-03-28 · Quote Cart Refactor

## Summary
Replaced the single-experience inquiry form in `ContactChannelSelector.tsx` with a full
multi-experience quote cart.  Users can now add several experiences with traveler
breakdowns and optional pricing before sending a single consolidated message.

## Files changed

| File | Change |
|------|--------|
| `artifacts/api-server/src/app.ts` | `app.set("trust proxy", 1)` — fixes `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` from express-rate-limit behind Replit / Railway proxy |
| `src/lib/quote.ts` | **New** — types (`QuoteItem`, `QuoteCart`, `TravelerBreakdown`, `Pricing`), pure math helpers (`calculateSubtotal`, `calculateTotal`), formatting utilities, localStorage persistence (`loadCart`, `persistCart`), and cart-aware message / URL builders (`buildCartMessage`, `buildCartWhatsAppUrl`, `buildCartEmailUrl`) |
| `src/contexts/QuoteCartContext.tsx` | **New** — React context with `addItem`, `updateItem`, `removeItem`, `clearCart`, `getItemForExperience`; persists to `localStorage` under key `austral_quote_cart` |
| `src/contexts/i18n.tsx` | Added `quote` section (28 keys) to both ES and EN translation objects and to the `Translations` TypeScript type |
| `src/App.tsx` | Wrapped app tree with `<QuoteCartProvider>` |
| `src/components/ContactChannelSelector.tsx` | **Full rewrite** — Stepper inputs for adults / children / seniors, date range + auto-calculated days, collapsible optional pricing section, textarea notes, live subtotal preview, add-to-cart CTA, cart summary with edit/remove per item, totals row, three contact buttons (WhatsApp / Email / Facebook copy-flow), fire-and-forget lead save (non-blocking) |

## Architecture decisions

### Fire-and-forget lead save
`createLeadMutation.mutateAsync(...)` is called without `await`.  The `.catch()` is
silently swallowed.  This means the WhatsApp / email / Facebook flow is never blocked
by a backend failure.  Leads recorded in the DB are a "nice-to-have" analytics layer,
not a gate.

### Cart guard
Contact buttons dim at 50 % opacity when the cart is empty and show an amber warning
banner if clicked without items.  No disabled attribute is used (accessibility: the
click still triggers the guard message rather than doing nothing silently).

### localStorage key
`austral_quote_cart` — survives page reloads and tab switches.  No expiry; cleared
explicitly via the "Clear quote" action or `clearCart()`.

## Testing notes
- Production build clean: 3083 modules, 0 TypeScript errors.
- API server started cleanly with `trust proxy` applied — no more rate-limit crashes.
- Vite HMR propagated all changes without a full page reload.
