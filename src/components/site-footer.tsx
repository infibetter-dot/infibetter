import {
  Instagram,
  Facebook,
  Mail,
  Package,
  Headphones,
  RotateCcw,
  LockKeyhole,
  MapPin,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  AmericanExpressIcon,
  MastercardIcon,
  VisaIcon,
} from "react-svg-credit-card-payment-icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CURRENCIES,
  getCurrency,
  setCurrency as updateCurrency,
  subscribeToCurrencyChange,
  type CurrencyCode,
} from "@/lib/currency-system";

export function SiteFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(getCurrency());
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrency(getCurrency());

    return subscribeToCurrencyChange((code) => {
      setCurrency(code);
    });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setCurrencyOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedCurrency = CURRENCIES[currency];

  const selectCurrency = (code: string) => {
    if (!(code in CURRENCIES)) return;

    updateCurrency(code as CurrencyCode);
    setCurrencyOpen(false);
  };

  const paymentMethods = [
    {
      name: "American Express",
      icon: <AmericanExpressIcon format="flatRounded" width={48} aria-hidden="true" />,
    },
    {
      name: "Mastercard",
      icon: <MastercardIcon format="flatRounded" width={48} aria-hidden="true" />,
    },
    {
      name: "Visa",
      icon: <VisaIcon format="flatRounded" width={48} aria-hidden="true" />,
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

  const toggleSection = (section: string) => {
    setOpenSection((current) => (current === section ? null : section));
  };

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
      {/* SUBTLE TECH BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.30]
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
              {/* Wave signal */}
              <path
                d="M0 72 C22 36 42 36 64 72 S106 108 128 72 S158 42 180 72"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              <path
                d="M0 92 C22 56 42 56 64 92 S106 128 128 92 S158 62 180 92"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              {/* Tech rings */}
              <circle
                cx="90"
                cy="90"
                r="24"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              <circle
                cx="90"
                cy="90"
                r="10"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              {/* Connection nodes */}
              <circle cx="20" cy="28" r="2" fill="#CBD5E1" />
              <circle cx="160" cy="28" r="2" fill="#CBD5E1" />
              <circle cx="20" cy="152" r="2" fill="#CBD5E1" />
              <circle cx="160" cy="152" r="2" fill="#CBD5E1" />

              <path
                d="M20 28 L55 28 L70 43"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              <path
                d="M160 152 L125 152 L110 137"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              {/* Small grid accents */}
              <path
                d="M0 150 H35 M145 30 H180"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      <div className="relative">
        {/* TRUST BAR */}
        <div className="mx-auto w-full max-w-[1320px] px-3 pt-4 sm:px-5 sm:pt-7 lg:px-8">
          <div
            className="
              grid
              overflow-hidden
              rounded-[12px]
              border
              border-[#E1E5EA]
              bg-white
              grid-cols-2
              lg:grid-cols-4
            "
          >
            <TrustItem
              icon={<Package size={15} strokeWidth={1.6} />}
              title="Free tracked shipping"
              description="Shipping details"
            />
            <TrustItem
              icon={<Headphones size={15} strokeWidth={1.6} />}
              title="Here to help"
              description="Product help & support"
            />
            <TrustItem
              icon={<RotateCcw size={15} strokeWidth={1.6} />}
              title="30-day returns"
              description="Returns explained"
            />
            <TrustItem
              icon={<LockKeyhole size={15} strokeWidth={1.6} />}
              title="Secure payments"
              description="Payment methods"
            />
          </div>
        </div>

        {/* MAIN FOOTER */}
        <div
          className="
            mx-auto
            w-full
            max-w-[1320px]
            px-3
            pb-5
            pt-6
            sm:px-5
            sm:pb-8
            sm:pt-8
            lg:px-8
            lg:pt-10
          "
        >
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.7fr_0.7fr] lg:gap-16">
            {/* BRAND + NEWSLETTER */}
            <div className="max-w-[470px]">
              <div className="text-[18px] font-bold tracking-[-0.04em] text-[#111827] sm:text-[21px]">
                INFIBETTER
              </div>

              <h2
                className="
                  mt-2
                  text-[21px]
                  font-semibold
                  leading-[1.05]
                  tracking-[-0.035em]
                  text-[#111827]
                  sm:mt-3
                  sm:text-[25px]
                "
              >
                Charge smarter.
                <br />
                Stay connected.
              </h2>

              <p
                className="
                  mt-2
                  max-w-[420px]
                  text-[10px]
                  leading-4
                  text-[#64748B]
                  sm:mt-3
                  sm:text-[11px]
                  sm:leading-5
                "
              >
                Get first access to new releases, useful tech, and private
                offers. No clutter — only what matters.
              </p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                }}
                className="
                  mt-4
                  flex
                  h-9
                  max-w-[330px]
                  overflow-hidden
                  rounded-[8px]
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

              <p className="mt-2 text-[8px] leading-4 text-[#94A3B8]">
                New releases · Useful tech · Private offers
              </p>
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden lg:block">
              <FooterColumn title="Explore" links={exploreLinks} />
            </div>

            <div className="hidden lg:block">
              <FooterColumn title="Support" links={supportLinks} />
            </div>

            {/* MOBILE ACCORDION NAV */}
            <div className="lg:hidden">
              <FooterAccordion
                title="Explore"
                links={exploreLinks}
                open={openSection === "explore"}
                onClick={() => toggleSection("explore")}
              />

              <FooterAccordion
                title="Support"
                links={supportLinks}
                open={openSection === "support"}
                onClick={() => toggleSection("support")}
              />
            </div>
          </div>

          {/* SOCIAL + PAYMENT */}
          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              border-t
              border-[#E1E5EA]
              pt-4
              sm:mt-7
              sm:pt-5
              lg:justify-end
            "
          >
            <div className="flex items-center gap-1.5">
              <SocialButton
                href="#"
                label="Facebook"
                icon={<Facebook size={13} strokeWidth={1.7} />}
              />
              <SocialButton
                href="#"
                label="Instagram"
                icon={<Instagram size={13} strokeWidth={1.7} />}
              />
              <SocialButton
                href="mailto:hello@infibetter.com"
                label="Email"
                icon={<Mail size={13} strokeWidth={1.7} />}
              />
            </div>

            <div
              className="flex items-center gap-1"
              aria-label="Accepted payment methods"
            >
              {paymentMethods.map((payment) => (
                <div
                  key={payment.name}
                  title={payment.name}
                  aria-label={payment.name}
                  className="
                    flex
                    h-[32px]
                    w-[48px]
                    items-center
                    justify-center
                    sm:h-[34px]
                    sm:w-[50px]
                  "
                >
                  {payment.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-[#E1E5EA]">
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1320px]
              flex-col
              gap-2
              px-3
              py-3
              text-[8px]
              text-[#64748B]
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
              sm:py-4
              lg:px-8
            "
          >
            <p>
              © {new Date().getFullYear()} INFIBETTER. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <div ref={currencyRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={currencyOpen}
                  onClick={() => setCurrencyOpen((value) => !value)}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-md
                    px-2
                    py-1.5
                    text-[8px]
                    text-[#64748B]
                    transition
                    hover:bg-white
                    hover:text-[#111827]
                  "
                >
                  <MapPin size={10} strokeWidth={1.6} />
                  <span>{selectedCurrency.code}</span>
                  <ChevronDown
                    size={10}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${
                      currencyOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {currencyOpen ? (
                  <div
                    role="listbox"
                    aria-label="Select currency"
                    className="
                      absolute
                      bottom-[calc(100%+8px)]
                      left-0
                      z-50
                      w-[220px]
                      overflow-hidden
                      rounded-xl
                      border
                      border-[#E1E5EA]
                      bg-white
                      p-1.5
                      shadow-[0_12px_35px_rgba(15,23,42,0.14)]
                    "
                  >
                    <div className="px-2.5 pb-1.5 pt-1">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                        Currency
                      </p>
                    </div>

                    {Object.values(CURRENCIES).map((option) => {
                      const selected = option.code === currency;

                      return (
                        <button
                          key={option.code}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => selectCurrency(option.code)}
                          className={`
                            flex
                            w-full
                            items-center
                            gap-2
                            rounded-lg
                            px-2.5
                            py-2
                            text-left
                            transition
                            ${
                              selected
                                ? "bg-[#F3F7FC] text-[#111827]"
                                : "text-[#64748B] hover:bg-[#F7F8FA] hover:text-[#111827]"
                            }
                          `}
                        >
                          <span className="flex h-6 w-7 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[9px] font-semibold">
                            {option.symbol}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-[9px] font-semibold">
                              {option.code}
                            </span>
                            <span className="block truncate text-[8px] text-[#94A3B8]">
                              {option.name}
                            </span>
                          </span>

                          {selected ? (
                            <Check
                              size={13}
                              strokeWidth={2}
                              className="shrink-0 text-[#0066E6]"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <a href="#" className="transition hover:text-[#111827]">
                Privacy
              </a>

              <a href="#" className="transition hover:text-[#111827]">
                Terms
              </a>

              <span className="hidden sm:inline text-[#CBD5E1]">•</span>

              <span className="hidden sm:inline">Secure payments</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[62px]
        flex-col
        items-center
        justify-center
        px-2
        py-2.5
        text-center
        sm:min-h-[66px]
        sm:px-3
        sm:py-3
        lg:min-h-[72px]
      "
    >
      <div className="text-[#111827]">{icon}</div>

      <p className="mt-1 text-[8px] font-semibold text-[#111827] sm:text-[9px]">
        {title}
      </p>

      <span className="mt-0.5 text-[7px] text-[#64748B] sm:text-[8px]">
        {description}
      </span>
    </div>
  );
}

/* =========================================================
   DESKTOP FOOTER COLUMN
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
      <h3 className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#111827]">
        {title}
      </h3>

      <nav className="mt-3 flex flex-col gap-2">
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

/* =========================================================
   MOBILE FOOTER ACCORDION
========================================================= */

function FooterAccordion({
  title,
  links,
  open,
  onClick,
}: {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
  open: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-[#E1E5EA] last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className="
          flex
          w-full
          items-center
          justify-between
          py-3
          text-left
        "
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#111827]">
          {title}
        </span>

        <ChevronDown
          size={14}
          strokeWidth={1.7}
          className={`text-[#64748B] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <nav className="grid grid-cols-2 gap-x-5 gap-y-2 pb-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="
                text-[9px]
                leading-4
                text-[#64748B]
                transition-colors
                hover:text-[#0066E6]
              "
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

/* =========================================================
   SOCIAL BUTTON
========================================================= */

function SocialButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
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
      {icon}
    </a>
  );
}
