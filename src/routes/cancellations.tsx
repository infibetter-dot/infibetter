import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createFileRoute("/cancellations")({
  head: () => ({
    meta: [
      { title: "Cancellations Policy | INFIBETTER" },
      {
        name: "description",
        content:
          "Learn about INFIBETTER's pre-order cancellation policy, dispatch timelines, and refunds.",
      },
    ],
  }),
  component: CancellationsPage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-9">
      <h2 className="mb-4 text-[19px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[21px]">
        {title}
      </h2>
      <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
        {children}
      </div>
    </section>
  );
}

function CancellationsPage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-14">
        <header className="mb-10 text-center">
          <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.055em] text-[#171717] sm:text-[48px]">
            Cancellations
          </h1>
          <p className="mx-auto mt-4 max-w-[650px] text-[13px] leading-7 text-[#666] sm:text-[14px]">
            Our policy for orders containing products identified as
            pre-order before purchase.
          </p>
        </header>

        <div className="mb-10 space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
          <p className="text-[11px] text-[#777]">
            Last updated: November 17, 2026
          </p>
          <p>
            This policy applies only to products clearly identified as
            <strong> Pre-order </strong> before purchase. It explains how
            cancellation requests are handled before and after dispatch.
          </p>
        </div>

        <Section title="At a Glance">
          <ul className="list-disc space-y-2 pl-7 marker:text-[#999]">
            <li>
              <strong>Before dispatch:</strong> You may request cancellation
              of your pre-order.
            </li>
            <li>
              <strong>Cancellation refunds:</strong> Approved cancellation
              refunds are issued to the original payment method.
            </li>
            <li>
              <strong>Shipping timeframes:</strong> Estimated timeframes may
              change unless expressly stated otherwise.
            </li>
            <li>
              <strong>After delivery:</strong> Our Refund Policy and any
              mandatory consumer rights that apply to you remain applicable.
            </li>
          </ul>
        </Section>

        <Section title="What a Pre-order Means">
          <p>
            A pre-order allows you to purchase a product before it is ready
            for immediate dispatch. The product page or checkout may provide
            an estimated release or shipping timeframe.
          </p>
          <p>
            Unless expressly stated otherwise, this timeframe is an estimate
            and may change due to production, transportation, customs,
            carrier, or other supply-chain circumstances.
          </p>
        </Section>

        <Section title="Canceling Before Dispatch">
          <p>
            You may request cancellation of a pre-order at any time before
            it has been dispatched. To submit a request, email us at{" "}
            <a
              href="mailto:support@infibetter.com"
              className="underline underline-offset-2"
            >
              support@infibetter.com
            </a>{" "}
            and include your <strong>order number</strong>.
          </p>
          <p>
            If the pre-order has not been dispatched and the cancellation is
            accepted, the amount paid for the canceled product will be
            refunded to the original payment method.
          </p>
          <p>
            If an order contains multiple products, please clearly identify
            which pre-order item you wish to cancel.
          </p>
        </Section>

        <Section title="After Dispatch">
          <p>
            Once a pre-order has been dispatched, it can no longer be
            canceled under this pre-order cancellation process.
          </p>
          <p>
            After delivery, requests relating to returns or refunds will be
            handled in accordance with our{" "}
            <a
              href="/refund-policy"
              className="underline underline-offset-2"
            >
              Refund Policy
            </a>{" "}
            and any mandatory consumer rights applicable to your purchase.
          </p>
        </Section>

        <Section title="Changes to the Estimated Shipping Date">
          <p>
            If we are unable to ship a pre-order within the timeframe stated
            at the time of purchase, we will notify you and provide a
            revised estimate when available.
          </p>
          <p>
            Where required by applicable law, you may have the right to
            cancel your order or request a refund if the revised timeframe
            is not acceptable or the order cannot be fulfilled.
          </p>
        </Section>

        <Section title="Orders Containing Multiple Products">
          <p>
            If an order contains both in-stock and pre-order products, the
            items may be shipped together or separately depending on
            fulfillment availability.
          </p>
          <p>
            If you have a preference regarding separate shipments, please
            contact our support team. Any additional shipping arrangements
            will be subject to confirmation by INFIBETTER.
          </p>
        </Section>

        <Section title="Cancellation by INFIBETTER">
          <p>
            We may need to cancel a pre-order in circumstances such as:
          </p>
          <ul className="list-disc space-y-2 pl-7 marker:text-[#999]">
            <li>The product can no longer be supplied.</li>
            <li>Production has been discontinued.</li>
            <li>A material pricing or product-information error has occurred.</li>
            <li>Shipping restrictions prevent us from fulfilling the order.</li>
            <li>Fraud or unauthorized payment is reasonably suspected.</li>
          </ul>
          <p>
            If INFIBETTER cancels a paid pre-order, the amount paid for the
            affected product will be refunded to the original payment
            method, subject to applicable payment-provider processing
            procedures and mandatory law.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For pre-order questions or cancellation assistance, please
            contact our customer support team:
          </p>
          <div className="mt-4 space-y-2">
            <p>
              <strong>Trading Name:</strong> INFIBETTER
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
              <strong>Website:</strong>{" "}
              <a
                href="https://infibetter.com"
                className="underline underline-offset-2"
              >
                https://infibetter.com
              </a>
            </p>
          </div>
          <p className="mt-3">
            Please include your <strong>order number</strong> so we can
            identify your purchase and assist you more efficiently.
          </p>
        </Section>

        <footer className="mt-14 border-t border-[#e8e8e8] pt-6 text-center text-[11px] text-[#888]">
          © {new Date().getFullYear()} INFIBETTER. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
