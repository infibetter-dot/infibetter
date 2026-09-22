import { createFileRoute } from "@tanstack/react-router";
import { uploadToR2 } from "@/lib/r2.server";

export const Route = createFileRoute("/api/upload-r2")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();

          const file = formData.get("file");

          if (!(file instanceof File)) {
            return new Response(
              JSON.stringify({
                error: "No file provided",
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );
          }

          const productId = String(formData.get("productId") || "general");

          const safeName = file.name
            .replace(/[^a-zA-Z0-9._-]/g, "-")
            .toLowerCase();

          const key = `products/${productId}/${Date.now()}-${safeName}`;

          const buffer = new Uint8Array(await file.arrayBuffer());

          const publicUrl = await uploadToR2(
            key,
            buffer,
            file.type || "application/octet-stream",
          );

          return new Response(
            JSON.stringify({
              success: true,
              url: publicUrl,
              key,
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        } catch (error) {
          console.error("R2 upload error:", error);

          return new Response(
            JSON.stringify({
              error:
                error instanceof Error
                  ? error.message
                  : "R2 upload failed",
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        }
      },
    },
  },
});