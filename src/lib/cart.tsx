import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
      const items: CartItem[] = JSON.parse(raw).map((item: CartItem) => ({
        ...item,
        image: item.image?.replace(
          "https://fpalovqxiqaispxabsum.supabase.co",
          "https://fgulxfspmekccfsqftxi.supabase.co"
        ) ?? null,
      }));

      setItems(items);
    }
  } catch (e) {
    console.error(e);
  }

  setHydrated(true);
}, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    add: (item, qty = 1) =>
      
      setItems((prev) => {
        const existing = prev.find(
    (p)=>
        p.id===item.id &&
        p.productColorId===item.productColorId
);
        if (existing) {
          return prev.map((p) => (p.id===item.id &&
p.productColorId===item.productColorId ? { ...p, quantity: p.quantity + qty } : p));
        }
        return [...prev, { ...item, quantity: qty }];
      }),
    remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
    setQuantity: (id, qty) =>
      setItems((prev) =>
        qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, quantity: qty } : p)),
      ),
    clear: () => setItems([]),
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
