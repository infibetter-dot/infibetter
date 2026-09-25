const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials chưa được cấu hình.");
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

  if (!response.ok || !data.access_token) {
  console.error("PAYPAL AUTH ERROR:", data);

  throw new Error(
    `PAYPAL_AUTH_FAILED: ${data?.error ?? "unknown"} | ${data?.error_description ?? "no description"}`
  );
}

  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = await req.json();

    const amount = Number(body.amount);
    const currency = String(body.currency || "USD").toUpperCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Amount không hợp lệ.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (currency !== "USD") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "PayPal hiện chỉ hỗ trợ USD trong flow này.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const accessToken = await getPayPalAccessToken();

    const paypalResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": crypto.randomUUID(),
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount.toFixed(2),
              },
            },
          ],
        }),
      },
    );

    const paypalData = await paypalResponse.json();

    if (!paypalResponse.ok || !paypalData.id) {
      console.error("PAYPAL CREATE ORDER ERROR:", paypalData);

      return new Response(
        JSON.stringify({
          success: false,
          error: "PayPal không thể tạo đơn thanh toán.",
          details: paypalData,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("PAYPAL ORDER CREATED:", paypalData.id);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: paypalData.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("PAYPAL CREATE ORDER FUNCTION ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});