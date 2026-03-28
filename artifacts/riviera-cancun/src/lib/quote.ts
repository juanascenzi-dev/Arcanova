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
  minTravelers?: number;
  maxTravelers?: number;
  includedTravelers?: number;
  chargeFullIncludedGroup?: boolean;
};

export type ServicePricing = {
  priceAdult?: number;
  priceChild?: number;
  priceSenior?: number;
  priceGroup?: number;
  priceDay?: number;
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
  chargeMode?: ChargeMode;     // carried for message display
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
 * This is the primary calculation — it uses the DB-configured pricing model.
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
        t.adults * (sp.priceAdult ?? 0) +
        t.children * (sp.priceChild ?? 0) +
        t.seniors * (sp.priceSenior ?? 0)
      );
    }

    case 'per_person_per_day': {
      const t = effectiveTravelers(travelers, rules);
      const perDay =
        t.adults * (sp.priceAdult ?? 0) +
        t.children * (sp.priceChild ?? 0) +
        t.seniors * (sp.priceSenior ?? 0);
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
  const adultCost = travelers.adults * (op.adultPrice ?? 0);
  const childCost = travelers.children * (op.childPrice ?? 0);
  const seniorCost = travelers.seniors * (op.seniorPrice ?? 0);
  return (adultCost + childCost + seniorCost) * d;
}

/**
 * Master subtotal: override pricing wins if provided, otherwise uses service rules.
 */
export function calculateSubtotal(
  travelers: TravelerBreakdown,
  days: number,
  rules?: ServiceBookingRules | null,
  sp?: ServicePricing | null,
  op?: OverridePricing | null,
): number {
  // Override pricing takes precedence
  if (op && hasOverridePricing(op)) {
    return calculateSubtotalFromOverride(travelers, days, op);
  }
  // Service rules + service pricing
  if (rules && sp) {
    return calculateSubtotalFromRules(travelers, days, rules, sp);
  }
  return 0;
}

function hasOverridePricing(op: OverridePricing): boolean {
  return (
    (op.flatPrice != null && op.flatPrice > 0) ||
    (op.adultPrice != null && op.adultPrice > 0) ||
    (op.childPrice != null && op.childPrice > 0) ||
    (op.seniorPrice != null && op.seniorPrice > 0)
  );
}

export function calculateTotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export function totalTravelers(t: TravelerBreakdown): number {
  return t.adults + t.children + t.seniors;
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

// ─── localStorage ─────────────────────────────────────────────────────────────

export function loadCart(): QuoteCart {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuoteCart;
      if (Array.isArray(parsed.items)) return parsed;
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

  if (lang === 'es') {
    lines.push('Hola, nos interesa cotizar los siguientes servicios:');
    lines.push('');

    cart.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.experienceName}`);

      if (item.startDate) {
        let dateLine = `   Fecha: ${formatDateDisplay(item.startDate)}`;
        if (item.endDate && item.endDate !== item.startDate) {
          dateLine += ` al ${formatDateDisplay(item.endDate)}`;
        }
        lines.push(dateLine);
      }

      if (item.days > 1) lines.push(`   Dias: ${item.days}`);

      const travelerLine = buildTravelerLine(item.travelers, 'es');
      if (travelerLine) lines.push(`   Viajeros: ${travelerLine}`);

      if (item.chargeMode) {
        lines.push(`   Modalidad: ${chargeModeLabel(item.chargeMode, 'es')}`);
      }

      if (item.subtotal > 0) {
        lines.push(`   Subtotal estimado: ${formatPrice(item.subtotal, cart.currency)}`);
      }

      if (item.notes) lines.push(`   Notas: ${item.notes}`);

      lines.push('');
    });

    if (cart.total > 0) {
      lines.push(`Total estimado: ${formatPrice(cart.total, cart.currency)}`);
      lines.push('');
    }

    lines.push('Por favor informen disponibilidad y precio final. Muchas gracias.');

  } else {
    lines.push('Hello, we are interested in quoting the following services:');
    lines.push('');

    cart.items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.experienceName}`);

      if (item.startDate) {
        let dateLine = `   Date: ${formatDateDisplay(item.startDate)}`;
        if (item.endDate && item.endDate !== item.startDate) {
          dateLine += ` to ${formatDateDisplay(item.endDate)}`;
        }
        lines.push(dateLine);
      }

      if (item.days > 1) lines.push(`   Days: ${item.days}`);

      const travelerLine = buildTravelerLine(item.travelers, 'en');
      if (travelerLine) lines.push(`   Travelers: ${travelerLine}`);

      if (item.chargeMode) {
        lines.push(`   Pricing: ${chargeModeLabel(item.chargeMode, 'en')}`);
      }

      if (item.subtotal > 0) {
        lines.push(`   Estimated subtotal: ${formatPrice(item.subtotal, cart.currency)}`);
      }

      if (item.notes) lines.push(`   Notes: ${item.notes}`);

      lines.push('');
    });

    if (cart.total > 0) {
      lines.push(`Total estimate: ${formatPrice(cart.total, cart.currency)}`);
      lines.push('');
    }

    lines.push('Please let us know availability and final pricing. Thank you.');
  }

  return lines.join('\n');
}

function buildTravelerLine(t: TravelerBreakdown, lang: 'es' | 'en'): string {
  const parts: string[] = [];
  if (lang === 'es') {
    if (t.adults > 0) parts.push(`${t.adults} adulto${t.adults !== 1 ? 's' : ''}`);
    if (t.children > 0) parts.push(`${t.children} nino${t.children !== 1 ? 's' : ''}`);
    if (t.seniors > 0) parts.push(`${t.seniors} adulto${t.seniors !== 1 ? 's' : ''} mayor${t.seniors !== 1 ? 'es' : ''}`);
  } else {
    if (t.adults > 0) parts.push(`${t.adults} adult${t.adults !== 1 ? 's' : ''}`);
    if (t.children > 0) parts.push(`${t.children} child${t.children !== 1 ? 'ren' : ''}`);
    if (t.seniors > 0) parts.push(`${t.seniors} senior${t.seniors !== 1 ? 's' : ''}`);
  }
  return parts.join(', ');
}

// ─── Contact URL builders ─────────────────────────────────────────────────────

export function buildCartWhatsAppUrl(cart: QuoteCart, lang: 'es' | 'en'): string {
  const msg = buildCartMessage(cart, lang);
  return `https://wa.me/${CONTACT_CHANNELS.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function buildCartEmailSubject(lang: 'es' | 'en'): string {
  return lang === 'es'
    ? 'Cotizacion de servicios - AUSTRAL Cancun Premium'
    : 'Service Quote - AUSTRAL Cancun Premium';
}

export function buildCartEmailUrl(cart: QuoteCart, lang: 'es' | 'en'): string {
  const subject = buildCartEmailSubject(lang);
  const body = buildCartMessage(cart, lang);
  return `mailto:${CONTACT_CHANNELS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
