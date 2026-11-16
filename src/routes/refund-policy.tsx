import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPolicyPage,
});

const email = "support@infibetter.com";

function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-[#1D1D1F]">
      <div className="mx-auto w-full max-w-[900px] px-5 pb-20 pt-8 sm:px-8 md:pt-12">

        <header className="mb-10 text-center sm:mb-12">
          <h1 className="text-[28px] font-semibold tracking-[-0.045em] sm:text-[36px]">
            Refund Policy
          </h1>
        </header>

        <div className="space-y-9">

          <section>
            <div className="space-y-3 text-[13px] leading-[1.85] text-[#626269]">
              <p>
                We have a 30-day return policy, which means you have 30 days
                after receiving your item to request a return.
              </p>

              <p>
                To be eligible for a return, your item must be in the same
                condition that you received it, unworn or unused, with tags,
                and in its original packaging. You will also need the receipt
                or proof of purchase.
              </p>

              <p>
                To start a return, you can contact us at{" "}
                <a href={`mailto:${email}`} className="font-medium text-[#0071E3] underline underline-offset-2">
                  {email}
                </a>.
              </p>

              <p>
                You can always contact us for any return questions at{" "}
                <a href={`mailto:${email}`} className="font-medium text-[#0071E3] underline underline-offset-2">
                  {email}
                </a>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.03em]">
              Damages and Issues
            </h2>
            <p className="text-[13px] leading-[1.85] text-[#626269]">
              Please inspect your order upon reception and contact us
              immediately if the item is defective, damaged or if you receive
              the wrong item so that we can evaluate the issue and make it right.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.03em]">
              Exceptions / Non-returnable Items
            </h2>
            <div className="space-y-3 text-[13px] leading-[1.85] text-[#626269]">
              <p>
                Certain types of items cannot be returned, like perishable
                goods (such as food, flowers, or plants), custom products
                (such as special orders or personalized items), and personal
                care goods (such as beauty products). We also do not accept
                returns for hazardous materials, flammable liquids, or gases.
                Please get in touch if you have questions or concerns about
                your specific item.
              </p>
              <p>
                Unfortunately, we cannot accept returns on clearance items
                or gift cards.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.03em]">
              Return / Exchanges
            </h2>
            <p className="text-[13px] leading-[1.85] text-[#626269]">
              The fastest way to ensure you get what you want is to return
              the item you have, and once the return is accepted, make a
              separate purchase for the new item.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.03em]">
              Return / Exchanges Shipping Fee
            </h2>
            <p className="text-[13px] leading-[1.85] text-[#626269]">
              Please note if the return or exchange is not caused by us,
              you (the customer) need to bear the return shipping fee and
              possible customs fees.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.03em]">
              European Union 14-day Cooling-off Period
            </h2>
            <p className="text-[13px] leading-[1.85] text-[#626269]">
              Notwithstanding the above, if the merchandise is being shipped
              into the European Union, you have the right to cancel or return
              your order within 14 days, for any reason and without a
              justification. As above, your item must be in the same condition
              that you received it, unworn or unused, with tags, and in its
              original packaging. You will also need the receipt or proof
              of purchase.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-[19px] font-semibold tracking-[-0.03em]">
              Refunds
            </h2>
            <div className="space-y-3 text-[13px] leading-[1.85] text-[#626269]">
              <p>
                We will notify you once we have received and inspected your
                return, and let you know if the refund was approved or not.
                If approved, you will be automatically refunded on your
                original payment method within 10 business days. Please
                remember it can take some time for your bank or credit card
                company to process and post the refund too. Please note:
                once a refund is approved, we only support refunding the item;
                shipping costs are not included.
              </p>

              <p>
                If more than 15 business days have passed since we approved
                your return, please contact us at{" "}
                <a href={`mailto:${email}`} className="font-medium text-[#0071E3] underline underline-offset-2">
                  {email}
                </a>.
              </p>
            </div>
          </section>

        </div>

        <footer className="mt-14 border-t border-[#EAEAEA] pt-6">
          <p className="text-[12px] leading-6 text-[#86868B]">
            Need help with a return or refund?{" "}
            <a href={`mailto:${email}`} className="font-medium text-[#0071E3] hover:underline">
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
