import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { getCurrentUser, onAuthChange } from '@/integrations/supabase/auth';
import { fetchUserCartItems, saveUserCartItems } from '@/integrations/supabase/user_cart';

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
  removeItem: (id: string, material?: string) => void;
  updateQuantity: (id: string, quantity: number, material?: string) => void;
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => readGuestCart());
  const [userId, setUserId] = useState<string | null>(null);
  // Guards the sync-to-server effect from firing before we've actually loaded
  // that user's cart (so we don't overwrite their saved cart with an empty one).
  const hasHydratedServerCart = useRef(false);

  // Guest (signed-out) cart is always mirrored to localStorage so it still
  // works with no Supabase configured at all, and survives a sign-out.
  useEffect(() => {
    if (!userId) {
      writeGuestCart(items);
    }
  }, [items, userId]);

  // Resolve the signed-in user (if any) once, and keep listening for sign-in/out.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    getCurrentUser()
      .then((user) => {
        if (!cancelled) setUserId(user?.id ?? null);
      })
      .catch(() => undefined);

    const subscription = onAuthChange((user) => {
      setUserId(user?.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // When a user signs in, pull their saved cart from Supabase (`user_carts`).
  // If they already had a guest cart going (items added before signing in) and
  // the server has nothing saved yet, migrate the guest cart up instead of
  // discarding it. On sign-out, fall back to whatever is in the guest cart.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    if (!userId) {
      hasHydratedServerCart.current = false;
      setItems(readGuestCart());
      return;
    }

    let cancelled = false;
    const guestItemsAtSignIn = readGuestCart();
    hasHydratedServerCart.current = false;

    fetchUserCartItems(userId)
      .then(async (serverItems) => {
        if (cancelled) return;
        if (serverItems.length === 0 && guestItemsAtSignIn.length > 0) {
          await saveUserCartItems(userId, guestItemsAtSignIn).catch(() => undefined);
          if (!cancelled) setItems(guestItemsAtSignIn);
        } else {
          setItems(serverItems);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) hasHydratedServerCart.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Keep the signed-in user's cart saved to Supabase after every change, once
  // the initial server cart has actually been loaded (see hasHydratedServerCart).
  useEffect(() => {
    if (!isSupabaseConfigured || !userId || !hasHydratedServerCart.current) return;
    saveUserCartItems(userId, items).catch(() => undefined);
  }, [items, userId]);

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

  const removeItem = (id: string, material?: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && (i.material ?? '') === (material ?? ''))));
  };

  const updateQuantity = (id: string, quantity: number, material?: string) => {
    if (quantity <= 0) {
      removeItem(id, material);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id && (i.material ?? '') === (material ?? '') ? { ...i, quantity } : i)),
    );
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
