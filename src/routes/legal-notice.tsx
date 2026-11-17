import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/legal-notice")({
  head: () => ({
    meta: [
      { title: "Legal Notice | INFIBETTER" },
      {
        name: "description",
        content:
          "Legal information about INFIBETTER, customer service, intellectual property, and consumer rights.",
      },
    ],
  }),
  component: LegalNoticePage,
});

function LegalNoticePage() {
  return (
    <main className="min-h-screen bg-white text-[#333]">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-10 sm:px-10 sm:pt-14 lg:px-14">
        {/* Page Header */}
        <header className="mb-10 text-center">
          <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.055em] text-[#171717] sm:text-[48px]">
            Legal Notice
          </h1>
          <p className="mx-auto mt-4 max-w-[650px] text-[13px] leading-7 text-[#666] sm:text-[14px]">
            Important legal information about the INFIBETTER website and
            services.
          </p>
        </header>

        {/* Introduction */}
        <div className="mb-12 space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
          <p className="text-[11px] text-[#777]">
            Last updated: November 17, 2026
          </p>
          <p>
            This Legal Notice provides general information about the
            operation of the INFIBETTER website and the legal terms relevant
            to your use of our online services.
          </p>
        </div>

        {/* Operator */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Legal Notice
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              This website is operated by <strong>INFIBETTER</strong>.
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

        {/* Customer Service */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Customer Service
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              For customer service, order assistance, product questions,
              delivery issues, returns, or complaints, please contact our
              support team by email:
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
              When contacting us about an existing order, please include
              your order number so that we can identify your purchase and
              assist you more efficiently.
            </p>
          </div>
        </section>

        {/* Intellectual Property */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Intellectual Property
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              Unless otherwise stated, website content including text,
              logos, graphics, photographs, videos, product names, layouts,
              and designs is owned by or licensed to INFIBETTER and
              protected by applicable intellectual-property laws.
            </p>
            <p>
              You may not copy, reproduce, distribute, modify, publish, or
              otherwise use website content for commercial purposes without
              our prior written permission, except where permitted by
              applicable law.
            </p>
          </div>
        </section>

        {/* Consumer Rights */}
        <section className="mb-10">
          <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.035em] text-[#202020] sm:text-[22px]">
            Mandatory Consumer Rights
          </h2>
          <div className="space-y-3 text-[12px] leading-[1.7] text-[#444] sm:text-[13px]">
            <p>
              Nothing in this Legal Notice excludes, limits, or restricts
              any mandatory consumer rights or protections available to you
              under applicable law.
            </p>
            <p>
              If any provision of this Legal Notice conflicts with a
              mandatory legal right or protection, that right or protection
              will continue to apply to the extent required by law.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-[#e8e8e8] pt-6 text-center text-[11px] text-[#888]">
          © {new Date().getFullYear()} INFIBETTER. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
