import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

function formatDateVi(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export default {
  fetch: withSupabase(
    { auth: "none" },
    async (req, _ctx) => {
      // ================================
      // CORS
      // ================================
      if (req.method === "OPTIONS") {
        return new Response("ok", {
          headers: corsHeaders,
        });
      }

      try {
        // ================================
        // READ REQUEST
        // ================================
        const body = await req.json();

        const name = String(body.name || "").trim();

        const email = String(body.email || "").trim();

        const voucherCode = String(
          body.voucherCode || "",
        ).trim();

        const expiresAt = String(
          body.expiresAt || "",
        ).trim();

        // ================================
        // VALIDATE INPUT
        // ================================
        if (
          !name ||
          !email ||
          !voucherCode ||
          !expiresAt
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "Thiếu name, email, voucherCode hoặc expiresAt",
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type":
                  "application/json",
              },
            },
          );
        }

        // ================================
        // FORMAT EXPIRY DATE
        // ================================
        const expiryDate =
          formatDateVi(expiresAt);

        if (!expiryDate) {
          return new Response(
            JSON.stringify({
              success: false,
              error:
                "expiresAt không hợp lệ",
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                "Content-Type":
                  "application/json",
              },
            },
          );
        }

        // ================================
        // SMTP CONFIG
        // ================================
        const smtpUser =
          Deno.env.get("SMTP_USER");

        const smtpPassword =
          Deno.env.get("SMTP_PASSWORD");

        if (
          !smtpUser ||
          !smtpPassword
        ) {
          console.error(
            "Missing SMTP secrets",
          );

          return new Response(
            JSON.stringify({
              success: false,
              error:
                "SMTP chưa được cấu hình trên Supabase",
            }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                "Content-Type":
                  "application/json",
              },
            },
          );
        }

        // ================================
        // CREATE SMTP TRANSPORTER
        // ================================
        const transporter =
          nodemailer.createTransport({
            host: "ng-shost103.tenten.vn",
            port: 465,
            secure: true,
            auth: {
              user: smtpUser,
              pass: smtpPassword,
            },
          });

        // ================================
        // EMAIL SUBJECT
        // ================================
        const subject =
          "🎁 Ưu đãi dành riêng cho bạn từ Olive Living";

        // ================================
        // HTML EMAIL
        // ================================
        const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Ưu đãi Olive Living</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f3ee;
    font-family:Arial,Helvetica,sans-serif;
    color:#222;
  "
>
  <div
    style="
      max-width:620px;
      margin:0 auto;
      padding:36px 18px;
    "
  >

    <!-- MAIN CARD -->
    <div
      style="
        background:#ffffff;
        border-radius:20px;
        overflow:hidden;
        box-shadow:0 10px 40px rgba(0,0,0,0.08);
      "
    >

      <!-- ================================
           HEADER
      ================================= -->

      <div
        style="
          padding:34px 28px 24px;
          text-align:center;
          border-bottom:1px solid #eeeeea;
        "
      >

        <div
          style="
            font-size:11px;
            letter-spacing:4px;
            font-weight:700;
            color:#315b46;
          "
        >
          OLIVE LIVING
        </div>

        <div
          style="
            margin-top:18px;
            font-family:Georgia,serif;
            font-size:27px;
            line-height:1.25;
            color:#20251f;
          "
        >
          Một ưu đãi nhỏ<br />
          dành riêng cho bạn
        </div>

      </div>

      <!-- ================================
           CONTENT
      ================================= -->

      <div
        style="
          padding:32px 28px 36px;
        "
      >

        <!-- GREETING -->

        <p
          style="
            margin:0 0 10px;
            font-size:16px;
            line-height:1.6;
          "
        >
          Xin chào
          <strong>${name}</strong>,
        </p>

        <!-- INTRO -->

        <p
          style="
            margin:0 0 26px;
            color:#666;
            font-size:14px;
            line-height:1.7;
          "
        >
          Cảm ơn bạn đã quan tâm đến
          Olive Living. Chúng tôi gửi bạn
          một mã ưu đãi được tạo riêng
          dành cho bạn.
        </p>

        <!-- ================================
             VOUCHER CARD
        ================================= -->

        <div
          style="
            background:#f0f6f1;
            border:1px solid #dbe9dd;
            border-radius:16px;
            padding:28px 20px;
            text-align:center;
          "
        >

          <!-- LABEL -->

          <div
            style="
              font-size:10px;
              letter-spacing:2.5px;
              font-weight:700;
              color:#55715e;
            "
          >
            ƯU ĐÃI DÀNH RIÊNG CHO BẠN
          </div>

          <!-- VOUCHER CODE -->

          <div
            style="
              margin:18px 0 16px;
              font-size:30px;
              font-weight:700;
              letter-spacing:3px;
              color:#173f2c;
            "
          >
            ${voucherCode}
          </div>

          <!-- DISCOUNT -->

          <div
            style="
              font-size:18px;
              font-weight:700;
              color:#222;
            "
          >
            Giảm 5%
          </div>

          <!-- DISCOUNT CONDITION -->

          <div
            style="
              margin-top:8px;
              font-size:14px;
              color:#666;
            "
          >
            Tối đa
            <strong>35.000đ</strong>
            · Không yêu cầu giá trị đơn tối thiểu
          </div>

          <!-- EXPIRY -->

          <div
            style="
              margin-top:20px;
              padding-top:16px;
              border-top:1px solid #d7e4d9;
              font-size:13px;
              color:#536258;
            "
          >
            ⏳ Có hiệu lực đến
            <strong>${expiryDate}</strong>
          </div>

        </div>

        <!-- ================================
             CONDITIONS
        ================================= -->

        <div
          style="
            margin-top:24px;
            padding:18px 20px;
            background:#fafaf8;
            border-radius:12px;
          "
        >

          <div
            style="
              font-size:13px;
              font-weight:700;
              color:#333;
              margin-bottom:10px;
            "
          >
            Thông tin ưu đãi
          </div>

          <div
            style="
              font-size:13px;
              line-height:1.8;
              color:#666;
            "
          >
            • Mã dành riêng cho bạn<br />
            • Giảm 5% trên đơn hàng<br />
            • Giảm tối đa 35.000đ<br />
            • Không yêu cầu giá trị đơn tối thiểu<br />
            • Áp dụng 01 lần<br />
            • Hết hạn vào ${expiryDate}
          </div>

        </div>

        <!-- ================================
             CTA
        ================================= -->

        <div
          style="
            text-align:center;
            margin-top:28px;
          "
        >

          <a
            href="https://olivelivingvn.com/"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display:inline-block;
              background:#1f3327;
              color:#ffffff;
              text-decoration:none;
              border-radius:999px;
              padding:14px 28px;
              font-size:12px;
              font-weight:700;
              letter-spacing:1px;
            "
          >
            KHÁM PHÁ OLIVE LIVING
          </a>

        </div>

        <!-- WEBSITE -->

        <p
          style="
            margin:14px 0 0;
            text-align:center;
            color:#777;
            font-size:12px;
            line-height:1.6;
          "
        >

          <a
            href="https://olivelivingvn.com/"
            target="_blank"
            rel="noopener noreferrer"
            style="
              color:#315b46;
              text-decoration:none;
              font-weight:600;
            "
          >
            https://olivelivingvn.com/
          </a>

        </p>

        <!-- FOOTER MESSAGE -->

        <p
          style="
            margin:28px 0 0;
            text-align:center;
            color:#777;
            font-size:13px;
            line-height:1.7;
          "
        >
          Nhập mã ưu đãi tại bước thanh toán
          khi mua hàng trên Olive Living.
        </p>

      </div>

    </div>

    <!-- FOOTER -->

    <div
      style="
        text-align:center;
        margin-top:20px;
        font-size:11px;
        color:#999;
      "
    >
      Olive Living · Ưu đãi dành riêng cho khách hàng
    </div>

  </div>
</body>
</html>
`;

        // ================================
        // PLAIN TEXT EMAIL
        // ================================

        const text = `
Xin chào ${name},

Cảm ơn bạn đã quan tâm đến Olive Living.

Một ưu đãi nhỏ dành riêng cho bạn:

Mã ưu đãi: ${voucherCode}

GIẢM 5% - TỐI ĐA 35.000đ

Không yêu cầu giá trị đơn hàng tối thiểu.

Có hiệu lực đến ${expiryDate}.

Thông tin ưu đãi:
- Mã dành riêng cho bạn
- Giảm 5% trên đơn hàng
- Giảm tối đa 35.000đ
- Không yêu cầu giá trị đơn tối thiểu
- Áp dụng 01 lần
- Hết hạn vào ${expiryDate}

Nhập mã tại bước thanh toán khi mua hàng trên Olive Living.

Website: https://olivelivingvn.com/

Cảm ơn bạn đã lựa chọn Olive Living.
`;

        // ================================
        // SEND EMAIL
        // ================================

        const info =
          await transporter.sendMail({
            from:
              `"Olive Living" <${smtpUser}>`,

            to: email,

            subject,

            text,

            html,
          });

        // ================================
        // LOG
        // ================================

        console.log(
          "Email sent:",
          info.messageId,
        );

        // ================================
        // SUCCESS RESPONSE
        // ================================

        return new Response(
          JSON.stringify({
            success: true,
            messageId: info.messageId,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type":
                "application/json",
            },
          },
        );

      } catch (error) {

        // ================================
        // ERROR
        // ================================

        console.error(
          "Send email error:",
          error,
        );

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
              "Content-Type":
                "application/json",
            },
          },
        );
      }
    },
  ),
};