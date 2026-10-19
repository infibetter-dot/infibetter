
import { createFileRoute } from "@tanstack/react-router";
import { uploadToR2 } from "@/lib/r2.server";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
]);

const IMAGE_MAX_SIZE = 10 * 1024 * 1024;
const VIDEO_MAX_SIZE = 100 * 1024 * 1024;

function json(data: object, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/upload-r2")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const file = formData.get("file");

          if (!(file instanceof File)) {
            return json({ error: "Vui lòng chọn file." }, 400);
          }

          const isImage = IMAGE_TYPES.has(file.type);
          const isVideo = VIDEO_TYPES.has(file.type);

          if (!isImage && !isVideo) {
            return json(
              { error: "Chỉ hỗ trợ ảnh JPEG, PNG, WebP, GIF, AVIF và video MP4, WebM." },
              415,
            );
          }

          const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;

          if (file.size === 0 || file.size > maxSize) {
            return json(
              {
                error: isVideo
                  ? "Video phải có dung lượng từ 1 byte đến 100 MB."
                  : "Ảnh phải có dung lượng từ 1 byte đến 10 MB.",
              },
              413,
            );
          }

          const rawProductId = String(formData.get("productId") || "general");
          const productId = rawProductId.replace(/[^a-zA-Z0-9_-]/g, "");

          if (!productId) {
            return json({ error: "Product ID không hợp lệ." }, 400);
          }

          const safeName = file.name
            .replace(/[^a-zA-Z0-9._-]/g, "-")
            .toLowerCase();

          const key = `products/${productId}/${Date.now()}-${safeName}`;
          const buffer = new Uint8Array(await file.arrayBuffer());

          const publicUrl = await uploadToR2(
            key,
            buffer,
            file.type,
          );

          return json({
            success: true,
            url: publicUrl,
            key,
            mediaType: isVideo ? "video" : "image",
          });
        } catch (error) {
          console.error("R2 upload error:", error);

          return json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "R2 upload failed",
            },
            500,
          );
        }
      },
    },
  },
});
