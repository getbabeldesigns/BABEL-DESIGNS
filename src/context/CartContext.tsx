import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import type { AppUser } from '@/integrations/pocketbase/auth';
import { fetchUserCartItems, saveUserCartItems } from '@/integrations/pocketbase/user_cart';
import { getCurrentUser, onAuthChange } from '@/integrations/pocketbase/auth';
import { isPocketBaseConfigured } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  material?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'babel_guest_cart_items';

const readGuestCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      return (
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.image === 'string' &&
        typeof item.quantity === 'number'
      );
    });
  } catch {
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const mergeCartItems = (primary: CartItem[], secondary: CartItem[]): CartItem[] => {
  const map = new Map<string, CartItem>();

  const push = (item: CartItem) => {
    const key = `${item.id}::${item.material ?? ''}`;
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
      return;
    }
    map.set(key, { ...item });
  };

  primary.forEach(push);
  secondary.forEach(push);
  return Array.from(map.values());
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const hasHydratedRef = useRef(false);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const guestItems = readGuestCart();
    setItems(guestItems);
    hasHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!isPocketBaseConfigured) return;

    let mounted = true;
    getCurrentUser()
      .then((nextUser) => {
        if (mounted) setUser(nextUser);
      })
      .catch(() => undefined);

    const subscription = onAuthChange((nextUser) => {
      if (mounted) setUser(nextUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    if (!isPocketBaseConfigured) return;

    let cancelled = false;

    const syncForUser = async () => {
      if (!user) {
        setItems(readGuestCart());
        return;
      }

      isSyncingRef.current = true;
      try {
        const guestItems = readGuestCart();
        const remoteItems = await fetchUserCartItems(user.id);
        const merged = mergeCartItems(remoteItems, guestItems);
        if (cancelled) return;

        setItems(merged);
        await saveUserCartItems(user.id, merged);
        writeGuestCart([]);
      } catch {
        // Keep local cart usable even if sync fails.
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncForUser();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!hasHydratedRef.current || isSyncingRef.current) return;

    if (!user) {
      writeGuestCart(items);
      return;
    }

    const timeout = window.setTimeout(() => {
      saveUserCartItems(user.id, items).catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [items, user]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    toast.success('Added to cart');
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && (i.material ?? '') === (item.material ?? ''));
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && (i.material ?? '') === (item.material ?? '')
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
