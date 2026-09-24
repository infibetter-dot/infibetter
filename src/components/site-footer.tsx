import {
  Instagram,
  Facebook,
  Mail,
  ArrowRight,

  MapPin,
  ChevronDown,
} from "lucide-react";

export function SiteFooter() {
  const paymentMethods = [
    {
      name: "Visa",
      src: "https://cdn.simpleicons.org/visa/1434CB",
    },
    {
      name: "Mastercard",
      src: "https://cdn.simpleicons.org/mastercard",
    },
    {
      name: "American Express",
      src: "https://cdn.simpleicons.org/americanexpress",
    },
    {
      name: "PayPal",
      src: "https://cdn.simpleicons.org/paypal",
    },
    {
      name: "Diners Club",
      src: "https://cdn.simpleicons.org/dinersclub",
    },
    {
      name: "Discover",
      src: "https://cdn.simpleicons.org/discover",
    },
  ];

  const exploreLinks = [
    { label: "About Us", href: "/about" },
    { label: "Shop", href: "/shop" },
    { label: "Best Sellers", href: "/best-seller" },
    { label: "Reviews", href: "#" },
    { label: "Guides & Advice", href: "#" },
    { label: "New Arrivals", href: "/shop" },
  ];

  const supportLinks = [
    { label: "Track Order", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Product Help", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns & Refunds", href: "#" },
    { label: "Contact Us", href: "mailto:hello@infibetter.com" },
  ];

  return (
    <footer
      className="
        relative
        mt-10
        overflow-hidden
        border-t
        border-[#E5E7EB]
        bg-[#F7F8FA]

        sm:mt-14
      "
    >
      {/* =====================================================
          SUBTLE TECH BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.28]
        "
        aria-hidden="true"
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 700"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="footer-grid"
              width="180"
              height="180"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 90 C35 50 65 50 100 90 S165 130 180 90"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              <path
                d="M0 110 C35 70 65 70 100 110 S165 150 180 110"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              <circle
                cx="90"
                cy="90"
                r="24"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#footer-grid)"
          />
        </svg>
      </div>

      <div className="relative">
        {/* ===================================================
            MAIN FOOTER
        ==================================================== */}

        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1320px]
            gap-8
            px-0
            pb-8
            pt-8

            sm:gap-10
            sm:pb-10
            sm:pt-10

            lg:grid-cols-[1.5fr_0.7fr_0.7fr]
            lg:gap-16
            lg:pt-9
          "
        >
          {/* BRAND + NEWSLETTER */}

          <div className="max-w-[470px]">
            <div
              className="
                text-[19px]
                font-bold
                tracking-[-0.04em]
                text-[#111827]

                sm:text-[21px]
              "
            >
              INFIBETTER
            </div>

            <h2
              className="
                mt-3
                text-[22px]
                font-semibold
                leading-[1.05]
                tracking-[-0.035em]
                text-[#111827]

                sm:text-[25px]
              "
            >
              Charge smarter.
              <br />
              Stay connected.
            </h2>

            <p
              className="
                mt-3
                max-w-[420px]
                text-[10px]
                leading-4
                text-[#64748B]

                sm:text-[11px]
                sm:leading-5
              "
            >
              Get first access to new releases, useful tech,
              and private offers. No clutter — only what matters.
            </p>

            {/* NEWSLETTER */}

            <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
              className="
                mt-5
                flex
                h-9
                max-w-[330px]
                overflow-hidden
                rounded-[7px]
                border
                border-[#D9DEE5]
                bg-white
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
              "
            >
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-3
                  text-[10px]
                  text-[#111827]
                  outline-none
                  placeholder:text-[#94A3B8]
                "
              />

              <button
                type="submit"
                className="
                  flex
                  w-[56px]
                  shrink-0
                  items-center
                  justify-center
                  bg-[#111827]
                  text-[9px]
                  font-semibold
                  text-white
                  transition-colors
                  duration-200
                  hover:bg-[#0066E6]
                "
              >
                Join
              </button>
            </form>

            <p
              className="
                mt-2
                text-[8px]
                leading-4
                text-[#94A3B8]
              "
            >
              New releases · Useful tech · Private offers
            </p>
          </div>

          {/* EXPLORE */}

          <FooterColumn
            title="Explore"
            links={exploreLinks}
          />

          {/* SUPPORT */}

          <FooterColumn
            title="Support"
            links={supportLinks}
          />
        </div>

        {/* ===================================================
            SOCIAL
        ==================================================== */}

        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1320px]
            items-center
            justify-end
            px-0
            pb-5
          "
        >
          <div className="flex items-center gap-2">
            <a
              href="#"
              aria-label="Facebook"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                text-[#475569]
                transition
                hover:bg-white
                hover:text-[#111827]
              "
            >
              <Facebook size={13} strokeWidth={1.7} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                text-[#475569]
                transition
                hover:bg-white
                hover:text-[#111827]
              "
            >
              <Instagram size={13} strokeWidth={1.7} />
            </a>

            <a
              href="mailto:hello@infibetter.com"
              aria-label="Email"
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                text-[#475569]
                transition
                hover:bg-white
                hover:text-[#111827]
              "
            >
              <Mail size={13} strokeWidth={1.7} />
            </a>
          </div>
        </div>

        {/* ===================================================
            BOTTOM BAR
        ==================================================== */}

        <div className="border-t border-[#E1E5EA]">
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1320px]
              flex-col
              gap-3
              px-0
              py-4
              text-[8px]
              text-[#64748B]

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p>
              © {new Date().getFullYear()} INFIBETTER. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <MapPin size={10} strokeWidth={1.6} />
                Vietnam (VND)
                <ChevronDown size={10} strokeWidth={1.5} />
              </div>

              <a
                href="#"
                className="transition hover:text-[#111827]"
              >
                Privacy
              </a>

              <a
                href="#"
                className="transition hover:text-[#111827]"
              >
                Terms
              </a>

              <a
                href="#"
                className="transition hover:text-[#111827]"
              >
                Payment methods
              </a>
            </div>
          </div>
        </div>

        {/* ===================================================
            PAYMENT METHODS
        ==================================================== */}

        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1320px]
            items-center
            justify-end
            px-0
            pb-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
            "
            aria-label="Accepted payment methods"
          >
            {paymentMethods.map((payment) => (
              <div
                key={payment.name}
                className="
                  flex
                  h-5
                  w-8
                  items-center
                  justify-center
                  rounded-[3px]
                  border
                  border-[#E2E6EB]
                  bg-white
                  px-1
                "
                title={payment.name}
              >
                <img
                  src={payment.src}
                  alt={payment.name}
                  className="
                    max-h-[14px]
                    max-w-[25px]
                    object-contain
                  "
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h3
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-[#111827]
        "
      >
        {title}
      </h3>

      <nav className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="
              w-fit
              text-[9px]
              text-[#64748B]
              transition-colors
              duration-200
              hover:text-[#0066E6]
            "
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
