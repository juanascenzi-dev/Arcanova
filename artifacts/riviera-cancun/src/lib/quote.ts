import { CONTACT_CHANNELS } from '@/lib/contact';

// ─── Re-export DB booking rule types for frontend use ─────────────────────────

export type ChargeMode =
  | 'per_person'
  | 'per_group_fixed'
  | 'per_day'
  | 'per_person_per_day'
  | 'per_group_per_day';

export type ServiceBookingRules = {
  chargeMode: ChargeMode;
  minTravelers?: number | null;
  maxTravelers?: number | null;
  includedTravelers?: number | null;
  chargeFullIncludedGroup?: boolean | null;
};

export type ServicePricing = {
  priceAdult?: number | null;
  priceChild?: number | null;
  priceSenior?: number | null;
  priceGroup?: number | null;
  priceDay?: number | null;
};

// ─── Cart types ───────────────────────────────────────────────────────────────

export type TravelerBreakdown = {
  adults: number;
  children: number;
  seniors: number;
};

/** User-entered optional override pricing (from the collapsible form section) */
export type OverridePricing = {
  adultPrice?: number;
  childPrice?: number;
  seniorPrice?: number;
  flatPrice?: number;
};

export type QuoteItem = {
  id: string;
  experienceId: string;
  experienceSlug: string;
  experienceName: string;
  startDate?: string;
  endDate?: string;
  days: number;
  travelers: TravelerBreakdown;
  chargeMode?: ChargeMode;
  // Stored so updateItem can recalculate without needing them re-passed from outside
  bookingRules?: ServiceBookingRules | null;
  servicePricing?: ServicePricing | null;
  overridePricing?: OverridePricing;
  notes?: string;
  subtotal: number;
};

export type QuoteCart = {
  items: QuoteItem[];
  total: number;
  currency: string;
  updatedAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const CART_STORAGE_KEY = 'austral_quote_cart';

// ─── Calculation helpers ──────────────────────────────────────────────────────

/**
 * Returns the effective traveler count to bill when chargeFullIncludedGroup is true.
 * If actual travelers < includedTravelers (base group), bill for the full base.
 */
function effectiveTravelers(
  t: TravelerBreakdown,
  rules: ServiceBookingRules,
): TravelerBreakdown {
  if (rules.chargeFullIncludedGroup && rules.includedTravelers) {
    const actual = t.adults + t.children + t.seniors;
    if (actual < rules.includedTravelers) {
      return { adults: rules.includedTravelers, children: 0, seniors: 0 };
    }
  }
  return t;
}

/**
 * Compute subtotal from service booking rules + service pricing.
 * Returns 0 when pricing is missing — this is a "Price on request" signal,
 * NOT a silent failure. The UI and message must handle the 0 case explicitly.
 */
export function calculateSubtotalFromRules(
  travelers: TravelerBreakdown,
  days: number,
  rules: ServiceBookingRules,
  sp: ServicePricing,
): number {
  const d = Math.max(1, days);

  switch (rules.chargeMode) {
    case 'per_group_fixed':
      return sp.priceGroup ?? 0;

    case 'per_day':
      return (sp.priceDay ?? 0) * d;

    case 'per_group_per_day':
      return (sp.priceGroup ?? 0) * d;

    case 'per_person': {
      const t = effectiveTravelers(travelers, rules);
      return (
        t.adults   * (sp.priceAdult  ?? 0) +
        t.children * (sp.priceChild  ?? 0) +
        t.seniors  * (sp.priceSenior ?? 0)
      );
    }

    case 'per_person_per_day': {
      const t = effectiveTravelers(travelers, rules);
      const perDay =
        t.adults   * (sp.priceAdult  ?? 0) +
        t.children * (sp.priceChild  ?? 0) +
        t.seniors  * (sp.priceSenior ?? 0);
      return perDay * d;
    }

    default:
      return 0;
  }
}

/**
 * Compute subtotal from user-entered override pricing.
 * Falls back to 0 if no pricing entered.
 */
export function calculateSubtotalFromOverride(
  travelers: TravelerBreakdown,
  days: number,
  op: OverridePricing,
): number {
  const d = Math.max(1, days);
  if (op.flatPrice != null && op.flatPrice > 0) {
    return op.flatPrice * d;
  }
  const adultCost  = (travelers.adults   ?? 0) * (op.adultPrice  ?? 0);
  const childCost  = (travelers.children ?? 0) * (op.childPrice  ?? 0);
  const seniorCost = (travelers.seniors  ?? 0) * (op.seniorPrice ?? 0);
  return (adultCost + childCost + seniorCost) * d;
}

/**
 * Master subtotal: override pricing wins if provided, otherwise uses service rules.
 * Returns 0 when no calculable pricing is available — callers must treat 0
 * as "Price on request" rather than "free".
 */
export function calculateSubtotal(
  travelers: TravelerBreakdown,
  days: number,
  rules?: ServiceBookingRules | null,
  sp?: ServicePricing | null,
  op?: OverridePricing | null,
): number {
  // Guard: ensure all traveler fields are safe numbers
  const t: TravelerBreakdown = {
    adults:   Math.max(0, travelers?.adults   ?? 0),
    children: Math.max(0, travelers?.children ?? 0),
    seniors:  Math.max(0, travelers?.seniors  ?? 0),
  };
  const d = Math.max(1, days ?? 1);

  // Override pricing takes precedence
  if (op && hasOverridePricing(op)) {
    return calculateSubtotalFromOverride(t, d, op);
  }
  // Service rules + service pricing
  if (rules && sp) {
    return calculateSubtotalFromRules(t, d, rules, sp);
  }
  return 0;
}

function hasOverridePricing(op: OverridePricing): boolean {
  return (
    (op.flatPrice   != null && op.flatPrice   > 0) ||
    (op.adultPrice  != null && op.adultPrice  > 0) ||
    (op.childPrice  != null && op.childPrice  > 0) ||
    (op.seniorPrice != null && op.seniorPrice > 0)
  );
}

export function calculateTotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0);
}

export function totalTravelers(t: TravelerBreakdown): number {
  return (t?.adults ?? 0) + (t?.children ?? 0) + (t?.seniors ?? 0);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatPrice(amount: number, currency = 'USD'): string {
  if (amount <= 0) return '';
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

export function chargeModeLabel(mode: ChargeMode, lang: 'es' | 'en'): string {
  const labels: Record<ChargeMode, { es: string; en: string }> = {
    per_person:         { es: 'por persona', en: 'per person' },
    per_group_fixed:    { es: 'precio fijo por grupo', en: 'fixed group price' },
    per_day:            { es: 'por dia', en: 'per day' },
    per_person_per_day: { es: 'por persona/dia', en: 'per person/day' },
    per_group_per_day:  { es: 'grupo por dia', en: 'group per day' },
  };
  return labels[mode]?.[lang] ?? mode;
}

/**
 * Build a human-readable traveler summary string.
 * Exported so it can be reused in UI components.
 * Examples:
 *   EN: "3 adults, 1 child, 1 senior"
 *   ES: "3 adultos, 1 nino, 1 adulto mayor"
 */
export function buildTravelerLine(t: TravelerBreakdown, lang: 'es' | 'en'): string {
  const adults   = Math.max(0, t?.adults   ?? 0);
  const children = Math.max(0, t?.children ?? 0);
  const seniors  = Math.max(0, t?.seniors  ?? 0);

  const parts: string[] = [];
  if (lang === 'es') {
    if (adults   > 0) parts.push(`${adults} adulto${adults !== 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} nino${children !== 1 ? 's' : ''}`);
    if (seniors  > 0) parts.push(`${seniors} adulto${seniors !== 1 ? 's' : ''} mayor${seniors !== 1 ? 'es' : ''}`);
  } else {
    if (adults   > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
    if (seniors  > 0) parts.push(`${seniors} senior${seniors !== 1 ? 's' : ''}`);
  }
  if (parts.length === 0) {
    return lang === 'es' ? '0 viajeros' : '0 travelers';
  }
  return parts.join(', ');
}

// ─── localStorage ─────────────────────────────────────────────────────────────

export function loadCart(): QuoteCart {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuoteCart;
      if (Array.isArray(parsed.items)) {
        // Migrate old items that may not have the travelers field fully populated
        const migratedItems = parsed.items.map(item => ({
          ...item,
          travelers: {
            adults:   item.travelers?.adults   ?? 0,
            children: item.travelers?.children ?? 0,
            seniors:  item.travelers?.seniors  ?? 0,
          },
          days: item.days ?? 1,
        }));
        return { ...parsed, items: migratedItems };
      }
    }
  } catch {}
  return { items: [], total: 0, currency: 'USD', updatedAt: new Date().toISOString() };
}

export function persistCart(cart: QuoteCart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {}
}

// ─── Message generation — clean ASCII, no emoji ───────────────────────────────
//
// Emojis like 📅 💰 👥 render as "◆" (replacement character) in some WhatsApp
// versions and email clients that don't support those Unicode ranges.
// We use plain text bullets and labels instead.

export function buildCartMessage(cart: QuoteCart, lang: 'es' | 'en'): string {
  if (cart.items.length === 0) return '';

  const lines: string[] = [];
  const currency = cart.currency ?? 'USD';
  const itemsWithPrice    = cart.items.filter(i => (i.subtotal ?? 0) > 0);
  const itemsWithoutPrice = cart.items.filter(i => (i.subtotal ?? 0) === 0);

  if (lang === 'es') {
    lines.push('Hola, nos interesa cotizar los siguientes servicios:');
    lines.push('');

    cart.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.experienceName}`);

      // Date / range
      if (item.startDate) {
        const start = formatDateDisplay(item.startDate);
        if (item.endDate && item.endDate !== item.startDate) {
          lines.push(`- Fecha: ${start} al ${formatDateDisplay(item.endDate)}`);
        } else {
          lines.push(`- Fecha: ${start}`);
        }
      }

      // Days — always shown
      lines.push(`- Dias: ${Math.max(1, item.days ?? 1)}`);

      // Travelers
      const travelerStr = buildTravelerLine(item.travelers, 'es');
      lines.push(`- Viajeros: ${travelerStr}`);

      // Pricing mode
      if (item.chargeMode) {
        lines.push(`- Modalidad: ${chargeModeLabel(item.chargeMode, 'es')}`);
      }

      // Subtotal
      const sub = item.subtotal ?? 0;
      if (sub > 0) {
        lines.push(`- Subtotal estimado: ${formatPrice(sub, currency)}`);
      } else {
        lines.push('- Precio: a consultar');
      }

      if (item.notes) lines.push(`- Notas: ${item.notes}`);

      lines.push('');
    });

    // Total
    if (itemsWithPrice.length > 0) {
      lines.push(`Total estimado: ${formatPrice(cart.total, currency)}`);
      if (itemsWithoutPrice.length > 0) {
        lines.push(
          `(+ ${itemsWithoutPrice.length} servicio${itemsWithoutPrice.length !== 1 ? 's' : ''} requieren cotizacion manual)`,
        );
      }
      lines.push('');
    }

    lines.push('Por favor informen disponibilidad y precio final. Muchas gracias.');

  } else {
    lines.push('Hello, we are interested in quoting the following services:');
    lines.push('');

    cart.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.experienceName}`);

      // Date / range
      if (item.startDate) {
        const start = formatDateDisplay(item.startDate);
        if (item.endDate && item.endDate !== item.startDate) {
          lines.push(`- Date: ${start} to ${formatDateDisplay(item.endDate)}`);
        } else {
          lines.push(`- Date: ${start}`);
        }
      }

      // Days — always shown
      lines.push(`- Days: ${Math.max(1, item.days ?? 1)}`);

      // Travelers
      const travelerStr = buildTravelerLine(item.travelers, 'en');
      lines.push(`- Travelers: ${travelerStr}`);

      // Pricing mode
      if (item.chargeMode) {
        lines.push(`- Pricing: ${chargeModeLabel(item.chargeMode, 'en')}`);
      }

      // Subtotal
      const sub = item.subtotal ?? 0;
      if (sub > 0) {
        lines.push(`- Estimated subtotal: ${formatPrice(sub, currency)}`);
      } else {
        lines.push('- Price: on request');
      }

      if (item.notes) lines.push(`- Notes: ${item.notes}`);

      lines.push('');
    });

    // Total
    if (itemsWithPrice.length > 0) {
      lines.push(`Total estimate: ${formatPrice(cart.total, currency)}`);
      if (itemsWithoutPrice.length > 0) {
        lines.push(
          `(+ ${itemsWithoutPrice.length} service${itemsWithoutPrice.length !== 1 ? 's' : ''} require manual pricing)`,
        );
      }
      lines.push('');
    }

    lines.push('Please let us know availability and final pricing. Thank you.');
  }

  return lines.join('\n');
}

// ─── Contact URL builders ─────────────────────────────────────────────────────

export function buildCartWhatsAppUrl(cart: QuoteCart, lang: 'es' | 'en'): string {
  const msg = buildCartMessage(cart, lang);
  return `https://wa.me/${CONTACT_CHANNELS.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function buildCartEmailSubject(lang: 'es' | 'en'): string {
  return lang === 'es'
    ? 'Cotizacion de servicios - Arcanova'
    : 'Service Quote - Arcanova';
}

export function buildCartEmailUrl(cart: QuoteCart, lang: 'es' | 'en'): string {
  const subject = buildCartEmailSubject(lang);
  const body = buildCartMessage(cart, lang);
  return `mailto:${CONTACT_CHANNELS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
