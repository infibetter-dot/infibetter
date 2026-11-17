
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | INFIBETTER" },
      {
        name: "description",
        content:
          "Contact INFIBETTER for assistance with orders, shipping, returns, and product inquiries.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-14">

        {/* Page Header */}
        <header className="mb-10 text-center">
          <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.055em] text-[#171717] sm:text-[48px]">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[13px] leading-7 text-[#666] sm:text-[14px]">
            We're here to help. Whether you have a question about an order,
            delivery, return, or product, feel free to get in touch with us.
          </p>
        </header>

        {/* Introduction */}
        <div className="mb-12 space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
          <p>
            At <strong>INFIBETTER</strong>, we believe that great shopping
            experiences go beyond the products we offer. We're committed to
            providing reliable customer support and helping you with any
            questions or concerns you may have.
          </p>
          <p>
            Please find our contact information and support details below.
            Our team will be happy to assist you.
          </p>
        </div>

        {/* Contact Information */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Contact Information
          </h2>

          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
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
        </section>

        {/* Customer Support */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Customer Support
          </h2>

          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              At INFIBETTER, we are committed to providing a smooth and
              reliable shopping experience. If you have any questions or
              need assistance with an order, delivery, return, or
              product-related matter, our customer support team will be
              happy to help.
            </p>

            <p>
              Please contact us at{" "}
              <a
                href="mailto:support@infibetter.com"
                className="underline underline-offset-2"
              >
                support@infibetter.com
              </a>
              . To help us assist you efficiently, include your{" "}
              <strong>order number</strong> whenever your inquiry relates
              to an existing purchase.
            </p>
          </div>
        </section>

        {/* Order Assistance */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Order Assistance
          </h2>

          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              If you need help with an existing order, please contact us
              by email and provide your order number along with a brief
              description of your inquiry.
            </p>

            <p>
              Our team can assist with questions regarding order status,
              payment confirmation, shipping updates, and other
              order-related matters.
            </p>
          </div>
        </section>

        {/* Returns */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Returns &amp; Return Authorization
          </h2>

          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              To ensure that your return is handled correctly, all returns
              must be approved by INFIBETTER before being shipped.
            </p>

            <p>
              Please contact us to request return authorization and obtain
              the applicable return instructions and designated return
              address.
            </p>

            <p>
              <strong>
                Do not send any products back without receiving prior
                approval and the correct return details from our team.
              </strong>
            </p>

            <p>
              Items returned without authorization or sent to an incorrect
              address may experience delays in processing.
            </p>

            <p>
              We recommend contacting our support team before taking any
              action regarding a return so we can guide you through the
              process.
            </p>
          </div>
        </section>

        {/* Before Contacting Us */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Before Contacting Us
          </h2>

          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              To help us understand your request and provide the most
              appropriate assistance, please include the following
              information when relevant:
            </p>

            <ul className="list-disc space-y-2 pl-7 marker:text-[#999]">
              <li>Your full name.</li>
              <li>Your order number, if applicable.</li>
              <li>The email address used when placing your order.</li>
              <li>A clear description of your question or concern.</li>
              <li>Relevant photos or supporting information, if necessary.</li>
            </ul>

            <p>
              Providing these details helps our team identify your order
              and understand your request more efficiently.
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-12 border-t border-[#e8e8e8] pt-8">
          <h2 className="mb-3 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Get in Touch
          </h2>

          <p className="mb-5 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            Have a question or need assistance? Send us an email and
            our team will be happy to help.
          </p>

          <a
            href="mailto:support@infibetter.com"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#202020] px-7 py-3 text-[12px] font-medium text-white transition-colors hover:bg-[#444]"
          >
            Email Customer Support
          </a>

          <p className="mt-4 text-[12px] text-[#666]">
            <a
              href="mailto:support@infibetter.com"
              className="underline underline-offset-2"
            >
              support@infibetter.com
            </a>
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-[#e8e8e8] pt-6 text-center text-[11px] text-[#888]">
          © {new Date().getFullYear()} INFIBETTER. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
