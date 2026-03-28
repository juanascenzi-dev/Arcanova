/**
 * Central display and filter utilities for Experience services.
 *
 * All formatting logic for price, duration, and capacity lives here.
 * Components import these helpers — NO inline parsing, NO hardcoded strings.
 */

import type { Experience } from '@workspace/api-client-react';

// ─── Base price ───────────────────────────────────────────────────────────────
// Prefer structured servicePricing over the legacy `price` field.

export function getBasePrice(exp: Experience): number {
  const sp = exp.servicePricing;
  if (sp?.priceAdult != null && sp.priceAdult > 0) return sp.priceAdult;
  if (sp?.priceGroup != null && sp.priceGroup > 0) return sp.priceGroup;
  if (sp?.priceDay != null && sp.priceDay > 0) return sp.priceDay;
  return exp.price ?? 0;
}

// ─── Price bucket (for filter) ────────────────────────────────────────────────

export type PriceBucket = 'under100' | '100-250' | '250-500' | '500plus';

export function getPriceBucket(exp: Experience): PriceBucket {
  const p = getBasePrice(exp);
  if (p < 100) return 'under100';
  if (p < 250) return '100-250';
  if (p < 500) return '250-500';
  return '500plus';
}

// ─── Price display ────────────────────────────────────────────────────────────

export function getPriceDisplay(exp: Experience, lang: 'es' | 'en'): string {
  const p = getBasePrice(exp);
  const prefix = lang === 'es' ? 'Desde USD' : 'From USD';
  return `${prefix} ${p}`;
}

// ─── Duration normalization ───────────────────────────────────────────────────
// durationHours may be "3", "3-4", "3–4", "8", etc.

export function normalizeDuration(exp: Experience): number {
  const raw = String(exp.durationHours ?? '').trim();
  // "3-4" or "3–4" range → midpoint
  const range = raw.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)$/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  const n = parseFloat(raw);
  return isNaN(n) ? 8 : n; // unknown → treat as full day
}

export type DurationBucket = 'short' | 'half-day' | 'full-day';

export function getDurationBucket(exp: Experience): DurationBucket {
  const h = normalizeDuration(exp);
  if (h < 3) return 'short';
  if (h < 6) return 'half-day';
  return 'full-day';
}

// ─── Duration display ─────────────────────────────────────────────────────────

export function getDurationDisplay(exp: Experience): string {
  const raw = String(exp.durationHours ?? '').trim();
  if (!raw || raw === '0') return '—';
  // "3-4" → "3–4h"
  const range = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (range) return `${range[1]}–${range[2]}h`;
  const n = parseFloat(raw);
  if (!isNaN(n)) return `${n}h`;
  return raw;
}

// ─── Capacity ─────────────────────────────────────────────────────────────────

export type CapacityBucket = '1-2' | '3-5' | '5-10' | '10plus';

export function getCapacityBucket(exp: Experience): CapacityBucket | null {
  const max = exp.bookingRules?.maxTravelers;
  if (max == null) return null;
  if (max <= 2) return '1-2';
  if (max <= 5) return '3-5';
  if (max <= 10) return '5-10';
  return '10plus';
}

export function getCapacityDisplay(exp: Experience, lang: 'es' | 'en'): string {
  const rules = exp.bookingRules;
  if (!rules) return lang === 'es' ? 'Flexible' : 'Flexible';
  const min = rules.minTravelers ?? 1;
  const max = rules.maxTravelers;
  const plural = lang === 'es' ? 'personas' : 'people';
  if (max == null) {
    return min > 1 ? `${min}+ ${plural}` : lang === 'es' ? 'Flexible' : 'Flexible';
  }
  if (min === max) return `${max} ${max === 1 ? (lang === 'es' ? 'persona' : 'person') : plural}`;
  if (min <= 1) return `${lang === 'es' ? 'Hasta' : 'Up to'} ${max} ${plural}`;
  return `${min}–${max} ${plural}`;
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

export type SortOption =
  | 'featured'
  | 'priceAsc'
  | 'priceDesc'
  | 'durationAsc'
  | 'durationDesc'
  | 'capacityAsc'
  | 'capacityDesc'
  | 'nameAZ';

export function sortExperiences(
  list: Experience[],
  sort: SortOption,
  lang: 'es' | 'en',
): Experience[] {
  const copy = [...list];
  switch (sort) {
    case 'featured':
      return copy.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    case 'priceAsc':
      return copy.sort((a, b) => getBasePrice(a) - getBasePrice(b));
    case 'priceDesc':
      return copy.sort((a, b) => getBasePrice(b) - getBasePrice(a));
    case 'durationAsc':
      return copy.sort((a, b) => normalizeDuration(a) - normalizeDuration(b));
    case 'durationDesc':
      return copy.sort((a, b) => normalizeDuration(b) - normalizeDuration(a));
    case 'capacityAsc':
      return copy.sort((a, b) => {
        const am = a.bookingRules?.maxTravelers ?? 999;
        const bm = b.bookingRules?.maxTravelers ?? 999;
        return am - bm;
      });
    case 'capacityDesc':
      return copy.sort((a, b) => {
        const am = a.bookingRules?.maxTravelers ?? 0;
        const bm = b.bookingRules?.maxTravelers ?? 0;
        return bm - am;
      });
    case 'nameAZ': {
      return copy.sort((a, b) => {
        const at = (a.title[lang] ?? a.title['en'] ?? '').toLowerCase();
        const bt = (b.title[lang] ?? b.title['en'] ?? '').toLowerCase();
        return at.localeCompare(bt);
      });
    }
    default:
      return copy;
  }
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

export interface ActiveFilters {
  category: string;
  capacity: CapacityBucket | 'all';
  price: PriceBucket | 'all';
  duration: DurationBucket | 'all';
}

export const DEFAULT_FILTERS: ActiveFilters = {
  category: 'all',
  capacity: 'all',
  price: 'all',
  duration: 'all',
};

export function filterExperiences(list: Experience[], filters: ActiveFilters): Experience[] {
  return list.filter((exp) => {
    if (filters.category !== 'all' && !exp.category.includes(filters.category)) return false;
    if (filters.price !== 'all' && getPriceBucket(exp) !== filters.price) return false;
    if (filters.duration !== 'all' && getDurationBucket(exp) !== filters.duration) return false;
    if (filters.capacity !== 'all') {
      const bucket = getCapacityBucket(exp);
      // No booking rules = "Flexible" = matches any capacity bucket
      if (bucket !== null && bucket !== filters.capacity) return false;
    }
    return true;
  });
}

export function hasActiveFilters(f: ActiveFilters): boolean {
  return (
    f.category !== 'all' ||
    f.capacity !== 'all' ||
    f.price !== 'all' ||
    f.duration !== 'all'
  );
}
