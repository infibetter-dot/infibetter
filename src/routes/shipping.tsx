import { createFileRoute, Link } from "@tanstack/react-router";

const shippingRegions = [
  { region: "North America", country: "United States", days: "5–9 business days" },
  { region: "North America", country: "Canada", days: "5–9 business days" },
  { region: "Europe", country: "France, Germany, Italy", days: "5–9 business days" },
  { region: "Europe", country: "Spain, Netherlands, Belgium, Austria", days: "5–9 business days" },
  { region: "Europe", country: "Denmark, Finland, Ireland, Portugal", days: "5–9 business days" },
  { region: "Europe", country: "Poland, Romania, Norway", days: "5–9 business days" },
  { region: "Europe", country: "United Kingdom", days: "5–8 business days" },
  { region: "Asia", country: "Singapore, Japan, Hong Kong, Taiwan, South Korea", days: "5–12 business days" },
  { region: "Oceania", country: "Australia, New Zealand", days: "5–9 business days" },
  { region: "Others", country: "Other supported destinations", days: "5–12 business days" },
];

const sections = [
  {
    title: "Shipping Fee",
    paragraphs: [
      "Any applicable shipping fee will be displayed at checkout before you complete your payment.",
    ],
  },
  {
    title: "Delays",
    paragraphs: [
      "Delivery estimates may be affected by customs clearance, weather conditions, public holidays, carrier operations, or other circumstances beyond our control.",
      "If your order is significantly delayed, please contact our support team for assistance.",
    ],
  },
  {
    title: "Lost Package",
    paragraphs: [
      "If your tracking information indicates that a package may be lost, please contact our support team with your order number and tracking details so we can assist you.",
    ],
  },
  {
    title: "Gift Cards",
    paragraphs: [
      "Shipping does not apply to digital gift cards. Any applicable gift card details will be provided electronically.",
    ],
  },
  {
    title: "Cancelling Your Order",
    paragraphs: [
      "If you need to cancel an order, please contact our support team as soon as possible. Orders that have already been shipped may no longer be eligible for cancellation.",
    ],
  },
  {
    title: "Wrong Shipping Address",
    paragraphs: [
      "Please check your shipping address carefully before placing an order. Contact us as soon as possible if you notice an incorrect address. We cannot guarantee address changes after an order has been processed or shipped.",
    ],
  },
  {
    title: "Duties & Taxes",
    paragraphs: [
      "Depending on your destination, customs duties, import taxes, or other fees may apply. Any such charges imposed by local authorities are the responsibility of the recipient unless otherwise stated at checkout.",
    ],
  },
  {
    title: "Multiple Addresses",
    paragraphs: [
      "If you need to send items to different addresses, please place separate orders for each shipping destination.",
    ],
  },
  {
    title: "Refusal of Delivery",
    paragraphs: [
      "If a delivery is refused or cannot be completed, please contact our support team. Additional shipping or return costs may apply depending on the circumstances.",
    ],
  },
  {
    title: "Note",
    paragraphs: [
      "Shipping times are estimates and may vary depending on the destination, carrier, customs processing, and other external factors.",
      "For questions about your order or delivery, please contact support@infibetter.com and include your order number.",
    ],
  },
];

export const Route = createFileRoute("/shipping")({
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <main className="min-h-screen bg-white text-[#1D1D1F]">
      <div className="mx-auto w-full max-w-[900px] px-5 pb-20 pt-8 sm:px-8 md:pt-12">
        <header className="mb-10 text-center sm:mb-12">
          <h1 className="text-[27px] font-semibold tracking-[-0.045em] sm:text-[34px]">
            Shipping Policy
          </h1>
        </header>

        <div className="space-y-9">
          <section>
            <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.025em]">
              Orders Processing
            </h2>
            <div className="space-y-3 text-[13px] leading-[1.85] text-[#626269]">
              <p>
                We will ship orders within 24 to 72 business hours
                (excluding pre-order items), except in the event of force
                majeure or public holidays.
              </p>
              <p>
                Processing and shipping times may vary depending on the
                destination and product availability.
              </p>
              <p>
                Tracking details will be provided after your order has been
                dispatched.
              </p>
              <p>
                For more information, please contact{" "}
                <a
                  href="mailto:support@infibetter.com"
                  className="font-medium text-[#0071E3] hover:underline"
                >
                  support@infibetter.com
                </a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.025em]">
              Shipping Regions
            </h2>
            <p className="mb-4 text-[13px] leading-[1.85] text-[#626269]">
              We ship to supported destinations worldwide. Estimated delivery
              times are listed below and may vary depending on local conditions.
            </p>

            <div className="w-full overflow-x-auto rounded-[8px] border border-[#E5E5E7]">
              <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#E5E5E7] bg-[#FAFAFA]">
                    <th className="px-4 py-3.5 font-semibold text-[#303036]">Region</th>
                    <th className="px-4 py-3.5 font-semibold text-[#303036]">Country</th>
                    <th className="px-4 py-3.5 font-semibold text-[#303036]">Estimated Days</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRegions.map((item, index) => (
                    <tr
                      key={`${item.region}-${item.country}`}
                      className={index !== shippingRegions.length - 1 ? "border-b border-[#EAEAEA]" : ""}
                    >
                      <td className="px-4 py-4 text-[#55555A]">{item.region}</td>
                      <td className="px-4 py-4 text-[#55555A]">{item.country}</td>
                      <td className="px-4 py-4 text-[#55555A]">{item.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-6 text-[#86868B]">
              Battery products may require approximately 4–10 business days
              after dispatch. Delivery estimates are not guaranteed.
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-[17px] font-semibold tracking-[-0.025em]">
                {section.title}
              </h2>
              <div className="space-y-3 text-[13px] leading-[1.85] text-[#626269]">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-[#EAEAEA] pt-6">
          <p className="text-[12px] leading-6 text-[#86868B]">
            Need help with your order?{" "}
            <a
              href="mailto:support@infibetter.com"
              className="font-medium text-[#0071E3] hover:underline"
            >
              Contact INFIBETTER Support
            </a>.
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-flex text-[12px] font-medium text-[#0071E3] hover:underline"
          >
            Continue Shopping →
          </Link>
        </footer>
      </div>
    </main>
  );
}

