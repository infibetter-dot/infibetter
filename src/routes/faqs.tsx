import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs | INFIBETTER" },
      {
        name: "description",
        content:
          "Find answers to common questions about INFIBETTER shipping, returns, orders, payments, and product warranty.",
      },
    ],
  }),
  component: FAQsPage,
});

type FAQ = {
  question: string;
  answer: React.ReactNode;
};

type FAQGroup = {
  title: string;
  description: string;
  items: FAQ[];
};

const faqGroups: FAQGroup[] = [
  {
    title: "Shipping & Returns",
    description:
      "Find answers about delivery, order tracking, returns, and exchanges.",
    items: [
      {
        question: "Where do you ship your orders from?",
        answer: (
          <>
            Orders are fulfilled through our logistics and fulfillment
            partners. The dispatch location may vary depending on product
            availability and destination. Your shipment confirmation will
            include tracking information once your order has been dispatched.
          </>
        ),
      },
      {
        question: "Which countries and regions do you ship to?",
        answer: (
          <>
            Shipping availability depends on the destination and the products
            in your order. Please select your country or region at checkout to
            see whether delivery is available. The destinations and shipping
            options displayed during checkout are the most up-to-date
            information for your order.
          </>
        ),
      },
      {
        question: "What is the shipping cost?",
        answer: (
          <>
            Shipping costs depend on your delivery destination, selected
            shipping method, and order details. Any applicable shipping charge
            will be displayed at checkout before you complete payment.
          </>
        ),
      },
      {
        question: "How long does delivery take?",
        answer: (
          <>
            Please allow <strong>1–2 business days</strong> for order
            processing. After dispatch, the estimated delivery time is:
            <ul className="my-2 list-disc space-y-1 pl-6">
              <li>
                <strong>Standard:</strong> 5–9 business days.
              </li>
              <li>
                <strong>Express:</strong> 2–4 business days, where available.
              </li>
            </ul>
            Delivery estimates may vary due to destination, customs
            clearance, carrier operations, public holidays, or other
            circumstances outside our control. The available shipping method
            and estimated arrival date shown at checkout should be used as
            your order-specific reference.
          </>
        ),
      },
      {
        question: "How can I track my order?",
        answer: (
          <>
            Once your order has been dispatched, we will send a shipping
            confirmation email to the email address provided at checkout.
            Where tracking is available, that email will include your tracking
            link and shipment details.
          </>
        ),
      },
      {
        question: "What if I entered the wrong shipping address?",
        answer: (
          <>
            Please contact us immediately at{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            and include your order number and the correct address. We can only
            request an address update if the order has not yet been dispatched
            or passed the relevant fulfillment stage. Changes cannot be
            guaranteed after dispatch.
          </>
        ),
      },
      {
        question:
          "There have been no updates to my tracking page. What should I do?",
        answer: (
          <>
            Tracking information may take some time to appear after a carrier
            receives the parcel. If there have been no tracking updates for
            more than <strong>3 business days</strong> after your shipping
            confirmation, please email{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number so our team can look into it.
          </>
        ),
      },
      {
        question:
          "The tracking says my package was delivered, but I have not received it. What can I do?",
        answer: (
          <>
            First, check around your delivery location, mailbox, reception,
            parcel locker, or with household members and neighbors. You may
            also contact the carrier to request delivery details. If you
            still cannot locate the parcel, contact us at{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number so we can help investigate.
          </>
        ),
      },
      {
        question: "Will I have to pay import duties or taxes?",
        answer: (
          <>
            Import duties, customs fees, and local taxes depend on the
            destination country's rules and the details of the shipment.
            Unless these charges are expressly shown as included at checkout,
            additional charges may be assessed by local customs authorities
            or the carrier. These charges, where applicable, are determined
            by the relevant authorities and are generally the recipient's
            responsibility. Please check your local customs requirements
            before ordering.
          </>
        ),
      },
      {
        question: "How do I return my order?",
        answer: (
          <>
            Please review our{" "}
            <a href="/refund-policy">Refund Policy</a> for eligibility and
            return conditions. Before sending anything back, contact our
            support team at{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            to receive return approval, instructions, and the correct return
            address. Do not ship a return before receiving these details.
          </>
        ),
      },
      {
        question: "How long does a refund take to process?",
        answer: (
          <>
            Once an approved return has been received and inspected, we will
            notify you about the refund decision. Approved refunds are sent
            to the original payment method. The time it takes for the funds
            to appear depends on your payment provider or financial
            institution. For an update, email{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number.
          </>
        ),
      },
      {
        question: "How do I exchange or return an INFIBETTER product?",
        answer: (
          <>
            Please email{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            and include your order number, the reason for the request, and
            clear photos or videos if the item is damaged, defective, or
            incorrect. Our support team will review your request and explain
            the next steps. See our <a href="/refund-policy">Refund Policy</a>{" "}
            for further details.
          </>
        ),
      },
      {
        question: "Do I have to pay to ship an item back?",
        answer: (
          <>
            Return shipping responsibility depends on the reason for the
            return and the requirements of our{" "}
            <a href="/refund-policy">Refund Policy</a> and applicable
            consumer law. Please contact us before returning an item so we
            can confirm the correct process and any applicable costs.
          </>
        ),
      },
      {
        question: "I received the wrong or a defective product. What should I do?",
        answer: (
          <>
            We are sorry for the inconvenience. Please contact{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number and clear photos or a short video showing
            the issue. Please keep the product and its packaging until our
            team provides instructions.
          </>
        ),
      },
      {
        question: "Have you received my return?",
        answer: (
          <>
            Return parcels may take time to reach the designated return
            location and be checked in. Once your return has been received
            and inspected, we will provide an update by email. If you need
            help checking its status, contact{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number and return tracking details.
          </>
        ),
      },
      {
        question: "Can I return a product without its original packaging?",
        answer: (
          <>
            Please contact us before sending the item back. Return
            eligibility and packaging requirements depend on the product,
            its condition, the reason for return, and applicable consumer
            law. Our team will confirm the requirements for your case.
          </>
        ),
      },
    ],
  },
  {
    title: "Orders",
    description:
      "Learn how to update, cancel, and confirm an order placed with INFIBETTER.",
    items: [
      {
        question: "I made a mistake while ordering. Can I cancel my order?",
        answer: (
          <>
            If your order has not been dispatched, contact us as soon as
            possible at{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number and cancellation request. We will check
            the order status and let you know whether cancellation is still
            possible. Once an order has been dispatched, it generally cannot
            be canceled through the cancellation process. Please also review
            our <a href="/cancellations">Cancellations Policy</a>.
          </>
        ),
      },
      {
        question: "I would like to edit my order. Can you help?",
        answer: (
          <>
            Please email us as soon as possible with your order number and
            the changes you need. We can only request changes before the
            order reaches the relevant fulfillment or dispatch stage, and
            changes cannot be guaranteed. If the order has already been
            dispatched, our team can explain the options available under
            our <a href="/refund-policy">Refund Policy</a>.
          </>
        ),
      },
      {
        question: "Did I place my order successfully?",
        answer: (
          <>
            A confirmation email is sent to the email address provided
            during checkout after your order has been successfully placed.
            Please check your inbox and spam or junk folder. If you have
            not received a confirmation, first check whether your payment
            was completed. If you still need help, contact{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>.
          </>
        ),
      },
      {
        question: "My order has already been processed. Can I still cancel it?",
        answer: (
          <>
            Once an order has entered processing or fulfillment, cancellation
            may no longer be possible. Contact us immediately and we will
            check its current status. If it has already been dispatched,
            please refer to our <a href="/refund-policy">Refund Policy</a>{" "}
            and contact our team before returning anything.
          </>
        ),
      },
      {
        question: "Can I combine two orders or change the delivery address later?",
        answer: (
          <>
            Please contact us as soon as possible. Combining orders or
            changing an address depends on the fulfillment status and
            shipping arrangements. We cannot guarantee that a change can
            be made once an order has been processed or dispatched.
          </>
        ),
      },
    ],
  },
  {
    title: "Payment Inquiries",
    description:
      "Information about payment options, payment confirmation, and invoices.",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: (
          <>
            INFIBETTER currently offers payment through PayPal. Depending on
            your location and the options presented by PayPal at checkout,
            you may be able to pay using your PayPal account or an eligible
            debit or credit card. Available methods may vary by country and
            payment-provider requirements.
          </>
        ),
      },
      {
        question: "Was my payment successful?",
        answer: (
          <>
            After your payment has been successfully completed and confirmed
            by the payment provider, your order confirmation will be sent to
            the email address provided at checkout. If you are unsure
            whether a payment went through, check your PayPal account or
            payment statement before attempting to pay again. You can also
            contact us with your order details.
          </>
        ),
      },
      {
        question: "My payment was declined. What should I do?",
        answer: (
          <>
            Check that your payment details are correct and that your
            payment method is available for online or international
            transactions. You may also contact PayPal or your card issuer
            for more information. If the issue continues, contact us at{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>.
          </>
        ),
      },
      {
        question: "Can I get an invoice for my order?",
        answer: (
          <>
            If you need an invoice or purchase documentation, email{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            and include your order number and the billing details required
            for the document.
          </>
        ),
      },
    ],
  },
  {
    title: "Warranty & Products",
    description:
      "Learn about product warranty coverage and what to do if something goes wrong.",
    items: [
      {
        question: "What warranty does INFIBETTER provide?",
        answer: (
          <>
            INFIBETTER products are covered by a{" "}
            <strong>1-year warranty</strong> for eligible manufacturing
            defects, subject to the applicable warranty terms. If you
            experience a product issue, contact our support team with your
            order number and a description of the problem. Please see our{" "}
            <a href="/warranty">Warranty Policy</a> for coverage and claim
            instructions.
          </>
        ),
      },
      {
        question: "What is not covered by the warranty?",
        answer: (
          <>
            Warranty coverage may exclude damage caused by accidents,
            misuse, abuse, unauthorized modifications or repairs, improper
            installation, or use contrary to the product instructions.
            Normal wear and tear, loss, and cosmetic damage that does not
            affect functionality may also be excluded. Please refer to our{" "}
            <a href="/warranty">Warranty Policy</a> for the full terms and
            applicable exclusions.
          </>
        ),
      },
      {
        question: "How do I make a warranty claim?",
        answer: (
          <>
            Email{" "}
            <a href="mailto:support@infibetter.com">support@infibetter.com</a>{" "}
            with your order number, product name, a description of the
            issue, and photos or videos where helpful. Our team will review
            the information and provide the next steps.
          </>
        ),
      },
      {
        question: "How can I check whether a product is compatible with my device?",
        answer: (
          <>
            Please review the product description and specifications on
            the relevant product page before purchasing. If you are unsure
            about compatibility, contact us with the product name and your
            device model so we can help you check the listed requirements.
          </>
        ),
      },
    ],
  },
];

function FAQsPage() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const toggleItem = (key: string) => {
    setOpenItems((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = encodeURIComponent("INFIBETTER FAQ Support Request");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );
    window.location.href = `mailto:support@infibetter.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-white text-[#222]">
      <div className="mx-auto w-full max-w-[1240px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-10">
        <header className="mb-10 text-center sm:mb-14">
          <h1 className="text-[34px] font-semibold tracking-[-0.055em] text-[#171717] sm:text-[42px]">
            FAQ&apos;s
          </h1>
          <p className="mx-auto mt-3 max-w-[620px] text-[12px] leading-6 text-[#777] sm:text-[13px]">
            Welcome to our FAQ. We&apos;re happy to have you here.
            <br className="hidden sm:block" />
            We&apos;ve answered some of the most common questions to help
            make your shopping experience easier.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)] lg:gap-10">
          {/* FAQ accordion */}
          <div className="min-w-0 border border-[#dedede] bg-white px-5 sm:px-7">
            <div className="flex gap-5 overflow-x-auto border-b border-[#e7e7e7] pt-5">
              {faqGroups.map((group, index) => (
                <button
                  key={group.title}
                  type="button"
                  onClick={() => setActiveGroup(index)}
                  className={`shrink-0 border-b-2 pb-3 text-[12px] font-semibold transition-colors ${
                    activeGroup === index
                      ? "border-[#202020] text-[#202020]"
                      : "border-transparent text-[#888] hover:text-[#333]"
                  }`}
                >
                  {group.title}
                </button>
              ))}
            </div>

            <div className="py-5">
              <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#222]">
                {faqGroups[activeGroup].title}
              </h2>
              <p className="mt-1 mb-4 text-[11px] leading-5 text-[#888]">
                {faqGroups[activeGroup].description}
              </p>

              <div className="divide-y divide-[#e5e5e5]">
                {faqGroups[activeGroup].items.map((item, index) => {
                  const key = `${activeGroup}-${index}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div key={key} className="py-3.5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleItem(key)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <span className="text-[12px] font-semibold leading-[1.6] text-[#222] sm:text-[13px]">
                          {index + 1}. {item.question}
                        </span>
                        <span
                          className={`mt-0.5 shrink-0 text-[15px] leading-none text-[#777] transition-transform ${
                            isOpen ? "rotate-45" : ""
                          }`}
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </button>

                      {isOpen && (
                        <div className="faq-answer mt-3 pr-5 text-[11px] leading-[1.75] text-[#666] sm:text-[12px]">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <aside className="lg:sticky lg:top-8">
            <h2 className="text-[17px] font-semibold tracking-[-0.035em] text-[#222]">
              Didn&apos;t find your answer?
            </h2>
            <p className="mt-1 mb-5 text-[11px] leading-5 text-[#888]">
              Can&apos;t find the information you&apos;re looking for?
              Send us a message and we&apos;ll be happy to help.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="sr-only" htmlFor="faq-name">
                Name
              </label>
              <input
                id="faq-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                className="h-10 w-full border border-[#ededed] bg-[#fafafa] px-3 text-[12px] text-[#333] outline-none transition focus:border-[#999] focus:bg-white"
              />

              <label className="sr-only" htmlFor="faq-email">
                Email
              </label>
              <input
                id="faq-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="h-10 w-full border border-[#ededed] bg-[#fafafa] px-3 text-[12px] text-[#333] outline-none transition focus:border-[#999] focus:bg-white"
              />

              <label className="sr-only" htmlFor="faq-message">
                Message
              </label>
              <textarea
                id="faq-message"
                name="message"
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Message"
                className="w-full resize-y border border-[#ededed] bg-[#fafafa] px-3 py-2.5 text-[12px] text-[#333] outline-none transition focus:border-[#999] focus:bg-white"
              />

              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center bg-[#171717] px-6 py-2 text-[11px] font-semibold text-white transition hover:bg-[#444]"
              >
                Send message
              </button>
            </form>

            <p className="mt-4 text-[11px] leading-5 text-[#888]">
              You can also email us directly at{" "}
              <a
                href="mailto:support@infibetter.com"
                className="text-[#444] underline underline-offset-2"
              >
                support@infibetter.com
              </a>
              .
            </p>
          </aside>
        </div>

        <footer className="mt-16 border-t border-[#e8e8e8] pt-6 text-center text-[11px] text-[#888]">
          © {new Date().getFullYear()} INFIBETTER. All rights reserved.
        </footer>
      </div>

      <style>{`
        .faq-answer a {
          color: #333;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .faq-answer strong {
          color: #333;
          font-weight: 600;
        }
      `}</style>
    </main>
  );
}
