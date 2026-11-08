type ProductInteractionEvent =
  | "product_gallery_change"
  | "product_image_zoom"
  | "product_video_play"
  | "specification_view"
  | "faq_expand"
  | "product_description_click"
  | "related_product_click";

interface ProductInteractionParams {
  product_id: string;
  product_name: string;
  product_category?: string;
  interaction_type: string;
  interaction_value?: string;
  gallery_image_index?: number;
  content_section?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackProductInteraction(
  eventName: ProductInteractionEvent,
  params: ProductInteractionParams,
) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: eventName,
    ...params,
    page_type: "product",
    page_location: window.location.href,
  });
}