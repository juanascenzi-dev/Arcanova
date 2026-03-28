import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  type QuoteCart,
  type QuoteItem,
  type TravelerBreakdown,
  type OverridePricing,
  type ServiceBookingRules,
  type ServicePricing,
  type ChargeMode,
  calculateSubtotal,
  calculateTotal,
  loadCart,
  persistCart,
} from '@/lib/quote';

// ─── Context shape ────────────────────────────────────────────────────────────

/**
 * AddItemPayload — all fields needed to create a new QuoteItem.
 * bookingRules and servicePricing are now part of QuoteItem itself so they
 * persist in localStorage and are available for future recalculation on edit.
 */
type AddItemPayload = Omit<QuoteItem, 'id' | 'subtotal'>;

/**
 * UpdateItemPayload — any subset of item fields to change.
 * If bookingRules / servicePricing are omitted, the values already stored
 * on the item are used for recalculation (no silent 0 reset).
 */
type UpdateItemPayload = Partial<Omit<QuoteItem, 'id' | 'subtotal'>>;

type QuoteCartContextType = {
  cart: QuoteCart;
  addItem: (item: AddItemPayload) => void;
  updateItem: (id: string, updates: UpdateItemPayload) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemForExperience: (experienceId: string) => QuoteItem | undefined;
};

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<QuoteCart>(() => loadCart());

  useEffect(() => {
    persistCart(cart);
  }, [cart]);

  function makeCart(items: QuoteItem[]): QuoteCart {
    return {
      items,
      total: calculateTotal(items),
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Add a new item. bookingRules and servicePricing from the payload are
   * stored in the item so they're available when the item is later edited.
   */
  const addItem = useCallback((payload: AddItemPayload) => {
    const subtotal = calculateSubtotal(
      payload.travelers,
      payload.days,
      payload.bookingRules,
      payload.servicePricing,
      payload.overridePricing,
    );
    const newItem: QuoteItem = {
      ...payload,
      id: crypto.randomUUID(),
      subtotal,
    };
    setCart(prev => makeCart([...prev.items, newItem]));
  }, []);

  /**
   * Update an item. The merged item (stored values + updates) is used for
   * recalculation, so even if bookingRules / servicePricing are not re-passed
   * in the update payload, the stored ones are preserved and subtotal stays correct.
   */
  const updateItem = useCallback((id: string, updates: UpdateItemPayload) => {
    setCart(prev => {
      const items = prev.items.map(item => {
        if (item.id !== id) return item;
        // Merge: stored values are the base; updates override specific fields
        const merged: QuoteItem = { ...item, ...updates, id: item.id };
        const subtotal = calculateSubtotal(
          merged.travelers,
          merged.days,
          merged.bookingRules,    // from stored item (or updated if provided)
          merged.servicePricing,  // from stored item (or updated if provided)
          merged.overridePricing,
        );
        return { ...merged, subtotal };
      });
      return makeCart(items);
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart(prev => makeCart(prev.items.filter(i => i.id !== id)));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], total: 0, currency: 'USD', updatedAt: new Date().toISOString() });
  }, []);

  const getItemForExperience = useCallback(
    (experienceId: string) => cart.items.find(i => i.experienceId === experienceId),
    [cart.items],
  );

  return (
    <QuoteCartContext.Provider
      value={{ cart, addItem, updateItem, removeItem, clearCart, getItemForExperience }}
    >
      {children}
    </QuoteCartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error('useQuoteCart must be used within QuoteCartProvider');
  return ctx;
}
