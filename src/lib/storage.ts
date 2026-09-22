import { supabase } from "@/integrations/supabase/client";

export function getImageUrl(path?: string | null) {
  if (!path) return "/placeholder.svg";

  if (path.startsWith("http")) {
    const marker = "/object/public/website%20OLive/";

    if (path.includes(marker)) {
      path = decodeURIComponent(path.split(marker)[1]);
    } else {
      return path;
    }
  }

  return supabase.storage
    .from("website OLive")
    .getPublicUrl(path).data.publicUrl;
}