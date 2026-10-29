import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  productColorId?: string;
  colorName?: string;
  colorHex?: string;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nha_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const storedItems: CartItem[] = JSON.parse(raw).map((item: CartItem) => ({
          ...item,
          image: item.image?.replace(
            "https://fpalovqxiqaispxabsum.supabase.co",
            "https://fgulxfspmekccfsqftxi.supabase.co",
          ) ?? null,
        }));
        setItems(storedItems);
      }
    } catch (error) {
      console.error("Unable to restore cart", error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota/privacy errors.
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    add: (item, qty = 1) => {
      const quantity = Math.max(1, Math.floor(Number(qty) || 1));

      setItems((previous) => {
        const existing = previous.find(
          (product) =>
            product.id === item.id &&
            product.productColorId === item.productColorId,
        );

        if (existing) {
          return previous.map((product) =>
            product.id === item.id &&
            product.productColorId === item.productColorId
              ? { ...product, quantity: product.quantity + quantity }
              : product,
          );
        }

        return [...previous, { ...item, quantity }];
      });

      // Track only after a valid add action is invoked.
      trackMetaEvent("AddToCart", {
        content_type: "product",
        content_ids: [String(item.id)],
        content_name: item.name,
        value: Number(item.price) * quantity,
        currency: "USD",
        num_items: quantity,
      });
    },
    remove: (id) =>
      setItems((previous) => previous.filter((item) => item.id !== id)),
    setQuantity: (id, qty) =>
      setItems((previous) =>
        qty <= 0
          ? previous.filter((item) => item.id !== id)
          : previous.map((item) =>
              item.id === id ? { ...item, quantity: qty } : item,
            ),
      ),
    clear: () => setItems([]),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }), [items]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
