import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, colorId: number, sizeId: number) => void;
  updateQuantity: (productId: number, colorId: number, sizeId: number, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'tshirt_shop_cart';

function lineKey(productId: number, colorId: number, sizeId: number) {
  return `${productId}-${colorId}-${sizeId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const key = lineKey(item.productId, item.colorId, item.sizeId);
      const existing = prev.find((i) => lineKey(i.productId, i.colorId, i.sizeId) === key);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, existing.maxStock);
        return prev.map((i) => (lineKey(i.productId, i.colorId, i.sizeId) === key ? { ...i, quantity: newQty } : i));
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: number, colorId: number, sizeId: number) => {
    const key = lineKey(productId, colorId, sizeId);
    setItems((prev) => prev.filter((i) => lineKey(i.productId, i.colorId, i.sizeId) !== key));
  };

  const updateQuantity = (productId: number, colorId: number, sizeId: number, quantity: number) => {
    const key = lineKey(productId, colorId, sizeId);
    setItems((prev) =>
      prev.map((i) =>
        lineKey(i.productId, i.colorId, i.sizeId) === key
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
