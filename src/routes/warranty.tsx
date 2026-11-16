import { createFileRoute, Link } from "@tanstack/react-router";

const email = "support@infibetter.com";

const sections = [
  {
    title: "Warranty Process",
    items: [
      "Sufficient proof of purchase must be provided.",
      "A description of the defect must be provided in order to issue a warranty claim.",
      "If the defective item is damaged, visible proof (if any) must be provided along with the item's serial number (if any).",
      "You may need to return the item for quality inspection.",
    ],
  },
  {
    title: "Valid Proof of Purchase",
    items: [
      "Order number from purchases made through INFIBETTER's official website.",
      "Sales invoice.",
      "Dated sales receipt from an authorized INFIBETTER reseller.",
    ],
    note: "Please note more than one type of proof of purchase may be required to process a warranty claim (such as a receipt of money transfer and confirmation of address to the item that was originally shipped).",
  },
  {
    title: "Shipping Costs Must Be Covered by the Buyer in the Following Situations",
    items: [
      "Returning products for any reason other than a proven defect.",
      "Warranty claims on items taken outside the original country of purchase.",
      "Returning items claimed to have defects but found by INFIBETTER quality control to be in working condition.",
      "Returning defective items in international shipping.",
      "Costs associated with unauthorized returns (any returns made outside of the approved warranty process).",
    ],
  },
  {
    title: "Not Covered Under Warranty",
    items: [
      "Products without sufficient proof of purchase.",
      "Lost or stolen products.",
      "Items that have expired their warranty period.",
      "Non quality-related issues.",
      "Free products.",
      "Repairs through third parties.",
      "Damage from outside sources.",
      "Damage from misuse of products (including, but not limited to: falls, extreme temperatures, water, and operating devices improperly).",
      "Purchases from unauthorized re-sellers.",
    ],
  },
  {
    title: "Not Liable for",
    items: [
      "Loss of data incurred from the use of INFIBETTER products.",
      "Returning personal items sent to INFIBETTER.",
    ],
  },
];

export const Route = createFileRoute("/warranty")({
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <main className="min-h-screen bg-white text-[#1D1D1F]">
      <div className="mx-auto w-full max-w-[1100px] px-5 pb-20 pt-8 sm:px-8 md:pt-12">

        <header className="mb-10 text-center sm:mb-12">
          <h1 className="text-[34px] font-semibold tracking-[-0.045em] sm:text-[46px]">
            Warranty
          </h1>
        </header>

        <div className="space-y-7 text-[13px] leading-[1.85] text-[#303036]">
          <section>
            <h2 className="mb-3 font-semibold text-[#171717]">
              What Does This Warranty Cover?
            </h2>
            <p>
              We stand behind the quality of our products. INFIBETTER offers
              a 1-year warranty on products purchased for at least $30.
              If you encounter any quality issues with your purchase, please
              do not hesitate to contact us. We are committed to providing
              you with a hassle-free replacement process. During the warranty
              period, if the original manufacturer of the material or
              workmanship of the product is deemed to be defective, you may
              submit a warranty claim.
            </p>
          </section>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 font-semibold text-[#171717]">
                {section.title}
              </h2>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="shrink-0">*</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {section.note && (
                <p className="mt-4">{section.note}</p>
              )}
            </section>
          ))}

          <section className="pt-1">
            <p>
              Please note that the above warranty policy is only valid for
              products purchased through INFIBETTER's official website or
              authorized resellers.
            </p>
            <p className="mt-3">
              For warranty assistance, please contact{" "}
              <a
                href={`mailto:${email}`}
                className="font-medium text-[#0071E3] underline underline-offset-2 hover:text-[#005BB5]"
              >
                {email}
              </a>{" "}
              with your order number and a description of the issue.
            </p>
          </section>
        </div>

        <footer className="mt-14 border-t border-[#EAEAEA] pt-6">
          <p className="text-[12px] leading-6 text-[#86868B]">
            Need help with a warranty claim?{" "}
            <a
              href={`mailto:${email}`}
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
