const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://olivelivingvn.com",
  "https://www.olivelivingvn.com",
];

const PUBLIC_R2_URL =
  "https://pub-16208320b245401d98649b48aeb33803.r2.dev";

function getCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getCorsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

    // =========================================
    // CORS PREFLIGHT
    // =========================================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // =========================================
    // HEALTH CHECK
    // =========================================
    if (request.method === "GET" && url.pathname === "/") {
      return json(
        {
          success: true,
          message: "Olive Living R2 Upload Worker is running.",
          bucket: "olive-storage",
        },
        200,
        origin
      );
    }

    // =========================================
    // UPLOAD IMAGE
    // POST /upload
    // =========================================
    if (request.method === "POST" && url.pathname === "/upload") {
      try {
        const contentType =
          request.headers.get("Content-Type") || "";

        if (!contentType.includes("multipart/form-data")) {
          return json(
            {
              success: false,
              error: "Request must be multipart/form-data",
            },
            400,
            origin
          );
        }

        const formData = await request.formData();

        const file = formData.get("file");

        const productId = String(
          formData.get("productId") || "unknown"
        );

        // =========================================
        // CHECK FILE
        // =========================================
        if (!(file instanceof File)) {
          return json(
            {
              success: false,
              error: "No image file found.",
            },
            400,
            origin
          );
        }

        // =========================================
        // MAX SIZE 10MB
        // =========================================
        const MAX_SIZE = 10 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
          return json(
            {
              success: false,
              error:
                "Image is too large. Maximum size is 10MB.",
            },
            413,
            origin
          );
        }

        // =========================================
        // ALLOWED IMAGE TYPES
        // =========================================
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
          "image/avif",
        ];

        if (!allowedTypes.includes(file.type)) {
          return json(
            {
              success: false,
              error:
                "Only JPG, PNG, WEBP, GIF and AVIF images are allowed.",
            },
            400,
            origin
          );
        }

        // =========================================
        // FILE EXTENSION
        // =========================================
        const extensionMap = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
          "image/gif": "gif",
          "image/avif": "avif",
        };

        const extension =
          extensionMap[file.type] || "jpg";

        // =========================================
        // CLEAN PRODUCT ID
        // =========================================
        const safeProductId = productId
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .slice(0, 100);

        // =========================================
        // UNIQUE FILE NAME
        // =========================================
        const uuid = crypto.randomUUID();

        const key =
          `products/variants/${safeProductId}/` +
          `${Date.now()}-${uuid}.${extension}`;

        // =========================================
        // UPLOAD TO CLOUDFLARE R2
        // =========================================
        await env.IMAGES.put(
          key,
          file.stream(),
          {
            httpMetadata: {
              contentType: file.type,
              cacheControl:
                "public, max-age=31536000, immutable",
            },

            customMetadata: {
              originalName: file.name,
              productId: safeProductId,
            },
          }
        );

        // =========================================
        // PUBLIC R2 URL
        // =========================================
        const publicUrl =
          `${PUBLIC_R2_URL}/${key}`;

        // =========================================
        // SUCCESS
        // =========================================
        return json(
          {
            success: true,
            key,
            url: publicUrl,
            size: file.size,
            type: file.type,
            originalName: file.name,
          },
          200,
          origin
        );

      } catch (error) {
        console.error(
          "R2 upload error:",
          error
        );

        return json(
          {
            success: false,
            error: "Upload failed.",
            detail:
              error instanceof Error
                ? error.message
                : String(error),
          },
          500,
          origin
        );
      }
    }

    // =========================================
    // 404
    // =========================================
    return json(
      {
        success: false,
        error: "Endpoint not found",
      },
      404,
      origin
    );
  },
};