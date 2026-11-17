import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/order-payment")({
  head: () => ({
    meta: [
      { title: "Order & Payment | INFIBETTER" },
      {
        name: "description",
        content:
          "Learn how to place an order, receive order confirmation, pay securely, and use promotional codes at INFIBETTER.",
      },
    ],
  }),
  component: OrderPaymentPage,
});

function OrderPaymentPage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-14">
        {/* Page Header */}
        <header className="mb-10 text-center">
          <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.055em] text-[#171717] sm:text-[48px]">
            Order &amp; Payment
          </h1>
          <p className="mx-auto mt-4 max-w-[650px] text-[13px] leading-7 text-[#666] sm:text-[14px]">
            Everything you need to know about placing an order, payment
            methods, order confirmation, and promotions at INFIBETTER.
          </p>
        </header>

        <div className="mb-10 space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
          <p className="text-[11px] text-[#777]">
            Last updated: November 17, 2026
          </p>
          <p>
            This page explains how orders are placed and processed on
            <strong> INFIBETTER</strong>, the payment methods available at
            checkout, and what to expect after completing your purchase.
          </p>
        </div>

        {/* Order Confirmation */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Order Confirmation
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              After you successfully place an order, an order confirmation
              will be sent to the email address provided during checkout.
              Please check your inbox, including your spam or junk folder,
              if you cannot find the message.
            </p>
            <p>
              Your confirmation email contains information about your
              purchase. Please review the order details and contact us
              promptly if you notice an error.
            </p>
            <p>
              Orders are generally processed within{" "}
              <strong>1–2 business days</strong> before dispatch. Processing
              may take longer during promotional periods, public holidays,
              or when additional order verification is required.
            </p>
            <p>
              Once your order has been dispatched, we will send shipment
              information and tracking details to the email address
              associated with your order, where tracking is available.
            </p>
          </div>
        </section>

        {/* Accepted Payment Methods */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Accepted Methods of Payment
          </h2>

          <div className="space-y-7 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-[#222]">
                PayPal
              </h3>
              <p>
                INFIBETTER uses PayPal to process payments securely. When
                you select PayPal at checkout, you will be redirected to
                PayPal to review and complete your payment.
              </p>
              <p className="mt-3">
                Depending on your location and PayPal eligibility, you may
                be able to pay using your PayPal balance, a linked bank
                account, or an eligible debit or credit card.
              </p>
              <p className="mt-3">
                If the payment is not completed or is declined by the
                payment provider, your order may not be confirmed. Please
                follow the instructions displayed by PayPal or contact
                PayPal directly for assistance with your payment account.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-[#222]">
                Debit or Credit Card
              </h3>
              <p>
                Where the option is available at checkout, you may be able
                to pay by debit or credit card through PayPal without
                signing in to a PayPal account. Card availability may vary
                by country, card issuer, and PayPal requirements.
              </p>
              <p className="mt-3">
                The payment options presented by PayPal at checkout
                determine which cards and payment methods are available
                for your transaction.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-[#222]">
                Payment Security
              </h3>
              <p>
                Payment details are handled by the payment provider during
                the payment process. INFIBETTER does not ask you to send
                your full card number, security code, or online banking
                password by email or customer support message.
              </p>
              <p className="mt-3">
                For questions about a transaction shown in your PayPal
                account or on your card statement, you may also contact
                PayPal or your card issuer.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Pricing
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              We aim to provide clear and accurate pricing for all products
              listed on INFIBETTER. Product prices and the applicable
              currency are displayed on the website and during checkout.
            </p>
            <p>
              The final order total, including any applicable shipping
              charges, discounts, and taxes shown at checkout, will be
              presented before you complete your payment.
            </p>
            <p>
              INFIBETTER reserves the right to update product prices and
              correct errors or inaccuracies in product or pricing
              information. If a material pricing error affects an order,
              we may contact you before processing it or take other
              appropriate action as permitted by applicable law.
            </p>
          </div>
        </section>

        {/* Coupon Codes */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Coupon Codes &amp; Promotions
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              INFIBETTER may offer promotional codes, discounts, or special
              offers from time to time. Each promotion may have its own
              eligibility requirements, terms, and expiration date.
            </p>
            <p>
              Please review the promotion details and enter your coupon
              code at checkout, where the coupon field is available.
              Discounts are applied only when the relevant conditions are
              met and the discount is successfully displayed in your order
              summary before payment.
            </p>
            <p>
              Unless expressly stated in the promotion terms, coupon codes
              cannot be applied after an order has been completed and
              cannot be exchanged for cash.
            </p>
          </div>
        </section>

        {/* Proof of Purchase */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Proof of Purchase
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              Your order confirmation email serves as an initial record of
              your purchase. Keep this email for your reference.
            </p>
            <p>
              If you need help locating your order or require further
              purchase information, contact our support team using the
              email address associated with your order and include your
              order number.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Contact Us
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              If you have questions about placing an order, payment
              confirmation, a declined transaction, or a promotion, please
              contact INFIBETTER customer support.
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@infibetter.com"
                className="underline underline-offset-2"
              >
                support@infibetter.com
              </a>
            </p>
            <p>
              Please include your <strong>order number</strong> where
              applicable. For questions about a PayPal account or a
              transaction processed by PayPal, you may also contact
              PayPal directly.
            </p>
            <p>
              <strong>Website:</strong>{" "}
              <a
                href="https://infibetter.com"
                className="underline underline-offset-2"
              >
                https://infibetter.com
              </a>
            </p>
          </div>
        </section>

        <footer className="mt-14 border-t border-[#e8e8e8] pt-6 text-center text-[11px] text-[#888]">
          © {new Date().getFullYear()} INFIBETTER. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
