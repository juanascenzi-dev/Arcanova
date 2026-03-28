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

type AddItemPayload = Omit<QuoteItem, 'id' | 'subtotal'> & {
  bookingRules?: ServiceBookingRules | null;
  servicePricing?: ServicePricing | null;
};

type UpdateItemPayload = Partial<Omit<QuoteItem, 'id' | 'subtotal'>> & {
  bookingRules?: ServiceBookingRules | null;
  servicePricing?: ServicePricing | null;
};

type QuoteCartContextType = {
  cart: QuoteCart;
  addItem: (item: AddItemPayload) => void;
  updateItem: (id: string, updates: UpdateItemPayload) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemForExperience: (experienceId: string) => QuoteItem | undefined;
};

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined);

// ─── Subtotal helper ──────────────────────────────────────────────────────────

function computeSubtotal(
  travelers: TravelerBreakdown,
  days: number,
  bookingRules?: ServiceBookingRules | null,
  servicePricing?: ServicePricing | null,
  overridePricing?: OverridePricing | null,
): number {
  return calculateSubtotal(travelers, days, bookingRules, servicePricing, overridePricing);
}

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

  const addItem = useCallback((payload: AddItemPayload) => {
    const { bookingRules, servicePricing, ...itemData } = payload;
    const subtotal = computeSubtotal(
      itemData.travelers,
      itemData.days,
      bookingRules,
      servicePricing,
      itemData.overridePricing,
    );
    const newItem: QuoteItem = {
      ...itemData,
      id: crypto.randomUUID(),
      subtotal,
    };
    setCart(prev => makeCart([...prev.items, newItem]));
  }, []);

  const updateItem = useCallback((id: string, updates: UpdateItemPayload) => {
    const { bookingRules, servicePricing, ...itemUpdates } = updates;
    setCart(prev => {
      const items = prev.items.map(item => {
        if (item.id !== id) return item;
        const merged = { ...item, ...itemUpdates };
        const subtotal = computeSubtotal(
          merged.travelers,
          merged.days,
          bookingRules ?? undefined,
          servicePricing ?? undefined,
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
