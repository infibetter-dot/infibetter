
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { trackAddToCart } from "@/lib/meta-pixel";
import { trackRemoveFromCart } from "@/lib/analytics";

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

  variantId?: string;

  deviceModelId?: string;
  deviceModelName?: string;

  // Compatible plug type: US / EU / UK / AU
  plugType?: string;
}

/**
 * Identifies one specific configuration of a product.
 * Used by CartDrawer to update/remove only the selected cart line.
 */
export type CartItemConfiguration = Pick<
  CartItem,
  | "productColorId"
  | "variantId"
  | "deviceModelId"
  | "plugType"
>;

interface CartContextValue {
  items: CartItem[];

  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;

  /**
   * If configuration is omitted, all cart lines with this product ID
   * are removed (backward-compatible with existing callers).
   */
  remove: (
    id: string,
    configuration?: CartItemConfiguration,
  ) => void;

  /**
   * If configuration is omitted, all cart lines with this product ID
   * are updated (backward-compatible with existing callers).
   */
  setQuantity: (
    id: string,
    qty: number,
    configuration?: CartItemConfiguration,
  ) => void;

  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "nha_cart_v1";

function isSameConfiguration(
  item: CartItem,
  configuration: CartItemConfiguration,
) {
  return (
    item.productColorId === configuration.productColorId &&
    item.variantId === configuration.variantId &&
    item.deviceModelId === configuration.deviceModelId &&
    item.plugType === configuration.plugType
  );
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restore cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        const storedItems: CartItem[] = Array.isArray(parsed)
          ? parsed.map((item: CartItem) => ({
              ...item,
              image:
                item.image?.replace(
                  "https://fpalovqxiqaispxabsum.supabase.co",
                  "https://fgulxfspmekccfsqftxi.supabase.co",
                ) ?? null,
            }))
          : [];

        setItems(storedItems);
      }
    } catch (error) {
      console.error("Unable to restore cart", error);
    }

    setHydrated(true);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota/privacy errors.
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,

      add: (item, qty = 1) => {
        const quantity = Math.max(
          1,
          Math.floor(Number(qty) || 1),
        );

        setItems((previous) => {
          const isSameProductConfiguration = (
            product: CartItem,
          ) =>
            product.id === item.id &&
            product.productColorId === item.productColorId &&
            product.variantId === item.variantId &&
            product.deviceModelId === item.deviceModelId &&
            product.plugType === item.plugType;

          const existing = previous.find(
            isSameProductConfiguration,
          );

          if (existing) {
            return previous.map((product) =>
              isSameProductConfiguration(product)
                ? {
                    ...product,
                    quantity: product.quantity + quantity,
                  }
                : product,
            );
          }

          return [
            ...previous,
            {
              ...item,
              quantity,
            },
          ];
        });

        // Keep existing Meta Pixel AddToCart tracking unchanged.
        trackAddToCart({
          id: String(item.id),
          name: item.name,
          price: Number(item.price),
          quantity,
          currency: "USD",
        });
      },

      remove: (id, configuration) => {
        setItems((previous) => {
          const removedItems = previous.filter((item) => {
            if (item.id !== id) return false;

            return configuration
              ? isSameConfiguration(item, configuration)
              : true;
          });

          if (removedItems.length > 0) {
            trackRemoveFromCart(removedItems);
          }

          return previous.filter((item) => {
            if (item.id !== id) return true;

            return configuration
              ? !isSameConfiguration(item, configuration)
              : false;
          });
        });
      },

      setQuantity: (id, qty, configuration) => {
        setItems((previous) => {
          if (qty <= 0) {
            return previous.filter((item) => {
              if (item.id !== id) return true;

              return configuration
                ? !isSameConfiguration(item, configuration)
                : false;
            });
          }

          return previous.map((item) => {
            const matches =
              item.id === id &&
              (configuration
                ? isSameConfiguration(item, configuration)
                : true);

            return matches
              ? {
                  ...item,
                  quantity: Math.max(1, Math.floor(qty)),
                }
              : item;
          });
        });
      },

      clear: () => setItems([]),

      count: items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),

      subtotal: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    }),
    [items],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}
