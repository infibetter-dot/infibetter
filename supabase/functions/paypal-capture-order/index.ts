import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

interface ReqPayload {
  orderId: string;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CREDENTIALS_MISSING");
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal OAuth error:", data);

    throw new Error(
      data?.error_description ||
        data?.error ||
        "PAYPAL_AUTHENTICATION_FAILED",
    );
  }

  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders(),
    });
  }

  try {
    if (req.method !== "POST") {
      return Response.json(
        {
          success: false,
          error: "METHOD_NOT_ALLOWED",
        },
        {
          status: 405,
          headers: corsHeaders(),
        },
      );
    }

    const body: ReqPayload = await req.json();

    const orderId = body.orderId?.trim();

    if (!orderId) {
      return Response.json(
        {
          success: false,
          error: "ORDER_ID_REQUIRED",
        },
        {
          status: 400,
          headers: corsHeaders(),
        },
      );
    }

    const accessToken = await getPayPalAccessToken();

    const paypalResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const paypalData = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error("PayPal Capture error:", paypalData);

      return Response.json(
        {
          success: false,
          error: "PAYPAL_CAPTURE_FAILED",
          details: paypalData,
        },
        {
          status: paypalResponse.status,
          headers: corsHeaders(),
        },
      );
    }

    const capture =
      paypalData?.purchase_units?.[0]?.payments?.captures?.[0];

    return Response.json(
      {
        success: true,
        orderId: paypalData.id,
        status: paypalData.status,
        captureId: capture?.id ?? null,
        captureStatus: capture?.status ?? null,
        amount: capture?.amount ?? null,
      },
      {
        status: 200,
        headers: corsHeaders(),
      },
    );
  } catch (error) {
    console.error("paypal-capture-order error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
      {
        status: 500,
        headers: corsHeaders(),
      },
    );
  }
});