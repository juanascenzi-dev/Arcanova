import { CONTACT_CONFIG } from '@/lib/leads';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TravelerBreakdown = {
  adults: number;
  children: number;
  seniors: number;
};

export type Pricing = {
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
  pricing: Pricing;
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
export const EMPTY_TRAVELERS: TravelerBreakdown = { adults: 1, children: 0, seniors: 0 };
export const EMPTY_PRICING: Pricing = {};

// ─── Calculations ─────────────────────────────────────────────────────────────

export function calculateSubtotal(
  travelers: TravelerBreakdown,
  pricing: Pricing,
  days: number,
): number {
  const d = Math.max(1, days);
  if (pricing.flatPrice != null && pricing.flatPrice > 0) {
    return pricing.flatPrice * d;
  }
  const adultCost = travelers.adults * (pricing.adultPrice ?? 0);
  const childCost = travelers.children * (pricing.childPrice ?? 0);
  const seniorCost = travelers.seniors * (pricing.seniorPrice ?? 0);
  return (adultCost + childCost + seniorCost) * d;
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

// ─── Message generation ───────────────────────────────────────────────────────

export function buildCartMessage(cart: QuoteCart, lang: 'es' | 'en'): string {
  if (cart.items.length === 0) return '';

  const lines: string[] = [];

  if (lang === 'es') {
    lines.push('Hola! 👋 Nos interesa cotizar las siguientes experiencias:');
    cart.items.forEach((item, i) => {
      lines.push('');
      lines.push(`${i + 1}. *${item.experienceName}*`);
      if (item.startDate) {
        let dateLine = `   📅 Fecha: ${formatDateDisplay(item.startDate)}`;
        if (item.endDate && item.endDate !== item.startDate) {
          dateLine += ` → ${formatDateDisplay(item.endDate)}`;
        }
        lines.push(dateLine);
      }
      if (item.days > 1) lines.push(`   ⏱ Días: ${item.days}`);
      const parts = buildTravelerParts(item.travelers, 'es');
      if (parts.length > 0) lines.push(`   👥 ${parts.join(' · ')}`);
      if (item.subtotal > 0) lines.push(`   💰 Subtotal estimado: ${formatPrice(item.subtotal, cart.currency)}`);
      if (item.notes) lines.push(`   📝 ${item.notes}`);
    });
    if (cart.total > 0) {
      lines.push('');
      lines.push(`💵 *Total estimado: ${formatPrice(cart.total, cart.currency)}*`);
    }
    lines.push('');
    lines.push('Quedamos atentos. ¡Gracias!');
  } else {
    lines.push('Hi! 👋 We\'re interested in quoting the following experiences:');
    cart.items.forEach((item, i) => {
      lines.push('');
      lines.push(`${i + 1}. *${item.experienceName}*`);
      if (item.startDate) {
        let dateLine = `   📅 Date: ${formatDateDisplay(item.startDate)}`;
        if (item.endDate && item.endDate !== item.startDate) {
          dateLine += ` → ${formatDateDisplay(item.endDate)}`;
        }
        lines.push(dateLine);
      }
      if (item.days > 1) lines.push(`   ⏱ Days: ${item.days}`);
      const parts = buildTravelerParts(item.travelers, 'en');
      if (parts.length > 0) lines.push(`   👥 ${parts.join(' · ')}`);
      if (item.subtotal > 0) lines.push(`   💰 Est. subtotal: ${formatPrice(item.subtotal, cart.currency)}`);
      if (item.notes) lines.push(`   📝 ${item.notes}`);
    });
    if (cart.total > 0) {
      lines.push('');
      lines.push(`💵 *Total estimate: ${formatPrice(cart.total, cart.currency)}*`);
    }
    lines.push('');
    lines.push('We look forward to hearing from you. Thank you!');
  }

  return lines.join('\n');
}

function buildTravelerParts(t: TravelerBreakdown, lang: 'es' | 'en'): string[] {
  const parts: string[] = [];
  if (lang === 'es') {
    if (t.adults > 0) parts.push(`${t.adults} adulto${t.adults !== 1 ? 's' : ''}`);
    if (t.children > 0) parts.push(`${t.children} niño${t.children !== 1 ? 's' : ''}`);
    if (t.seniors > 0) parts.push(`${t.seniors} adulto${t.seniors !== 1 ? 's' : ''} mayor${t.seniors !== 1 ? 'es' : ''}`);
  } else {
    if (t.adults > 0) parts.push(`${t.adults} adult${t.adults !== 1 ? 's' : ''}`);
    if (t.children > 0) parts.push(`${t.children} child${t.children !== 1 ? 'ren' : ''}`);
    if (t.seniors > 0) parts.push(`${t.seniors} senior${t.seniors !== 1 ? 's' : ''}`);
  }
  return parts;
}

// ─── Contact URL builders ─────────────────────────────────────────────────────

export function buildCartWhatsAppUrl(cart: QuoteCart, lang: 'es' | 'en'): string {
  const msg = buildCartMessage(cart, lang);
  return `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function buildCartEmailUrl(cart: QuoteCart, lang: 'es' | 'en'): string {
  const subject =
    lang === 'es'
      ? 'Cotización de experiencias — AUSTRAL Cancún Premium'
      : 'Experience Quote — AUSTRAL Cancún Premium';
  const body = buildCartMessage(cart, lang);
  return `mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
