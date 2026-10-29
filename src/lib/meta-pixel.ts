const META_PIXEL_ID = "3789534267871189";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  window.fbq("track", eventName, params);
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  currency?: string;
}) {
  trackMetaEvent("ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: Number(product.price),
    currency: product.currency ?? "USD",
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  const quantity = product.quantity ?? 1;

  trackMetaEvent("AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    contents: [
      {
        id: product.id,
        quantity,
      },
    ],
    value: Number(product.price) * quantity,
    currency: product.currency ?? "USD",
  });
}

export function trackInitiateCheckout(items: Array<{
  id: string;
  quantity: number;
  price: number;
}>, currency = "USD") {
  trackMetaEvent("InitiateCheckout", {
    content_type: "product",
    content_ids: items.map((item) => item.id),
    num_items: items.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
    contents: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    })),
    value: items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ),
    currency,
  });
}

export function trackPurchase(order: {
  id: string;
  total: number;
  items: Array<{
    id: string;
    quantity: number;
  }>;
  currency?: string;
}) {
  trackMetaEvent("Purchase", {
    order_id: order.id,
    content_type: "product",
    content_ids: order.items.map((item) => item.id),
    contents: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
    })),
    num_items: order.items.reduce(
      (total, item) => total + item.quantity,
      0,
    ),
    value: Number(order.total),
    currency: order.currency ?? "USD",
  });
}
