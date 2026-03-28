import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  type QuoteCart,
  type QuoteItem,
  type TravelerBreakdown,
  type Pricing,
  calculateSubtotal,
  calculateTotal,
  loadCart,
  persistCart,
} from '@/lib/quote';

// ─── Context shape ────────────────────────────────────────────────────────────

type QuoteCartContextType = {
  cart: QuoteCart;
  addItem: (item: Omit<QuoteItem, 'id' | 'subtotal'>) => void;
  updateItem: (id: string, updates: Partial<Omit<QuoteItem, 'id' | 'subtotal'>>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemForExperience: (experienceId: string) => QuoteItem | undefined;
};

const QuoteCartContext = createContext<QuoteCartContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<QuoteCart>(() => loadCart());

  // Persist on every change
  useEffect(() => {
    persistCart(cart);
  }, [cart]);

  const makeUpdatedCart = (items: QuoteItem[]): QuoteCart => ({
    items,
    total: calculateTotal(items),
    currency: cart.currency,
    updatedAt: new Date().toISOString(),
  });

  const addItem = useCallback((item: Omit<QuoteItem, 'id' | 'subtotal'>) => {
    const subtotal = calculateSubtotal(item.travelers, item.pricing, item.days);
    const newItem: QuoteItem = {
      ...item,
      id: crypto.randomUUID(),
      subtotal,
    };
    setCart(prev => makeUpdatedCart([...prev.items, newItem]));
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<Omit<QuoteItem, 'id' | 'subtotal'>>) => {
      setCart(prev => {
        const items = prev.items.map(item => {
          if (item.id !== id) return item;
          const merged = { ...item, ...updates };
          return {
            ...merged,
            subtotal: calculateSubtotal(merged.travelers, merged.pricing, merged.days),
          };
        });
        return makeUpdatedCart(items);
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setCart(prev => makeUpdatedCart(prev.items.filter(i => i.id !== id)));
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
