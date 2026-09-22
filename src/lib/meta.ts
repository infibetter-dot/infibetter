declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function trackPageView() {
  window.fbq?.("track", "PageView");
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
}) {
  window.fbq?.("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "VND",
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
}) {
  window.fbq?.("track", "AddToCart", {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: "VND",
  });
}

export function trackInitiateCheckout(
  value: number,
  quantity: number
) {
  window.fbq?.("track", "InitiateCheckout", {
    value,
    currency: "VND",
    num_items: quantity,
  });
}

export function trackPurchase(
  orderId: string,
  value: number
) {
  window.fbq?.("track", "Purchase", {
    order_id: orderId,
    value,
    currency: "VND",
  });
}