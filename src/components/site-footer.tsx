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
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CURRENCIES,
  getCurrency,
  setCurrency as updateCurrency,
  subscribeToCurrencyChange,
  type CurrencyCode,
} from "@/lib/currency-system";

// Local inline SVG flags so the currency selector does not depend on an
// external image/CDN request. These render reliably on localhost and Vercel.
const svgData = (svg: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const CURRENCY_FLAGS: Record<CurrencyCode, string> = {
  VND: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#da251d"/>
      <path fill="#ff0" d="m12 2.7 1.05 3.25h3.42l-2.77 2.01 1.06 3.25L12 9.2l-2.76 2.01 1.06-3.25-2.77-2.01h3.42z"/>
    </svg>`),
  USD: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#fff"/>
      <path fill="#b22234" d="M0 0h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24V16H0z"/>
      <rect width="10.5" height="8.62" fill="#3c3b6e"/>
      <g fill="#fff">
        <circle cx="1.4" cy="1.3" r=".35"/><circle cx="3.5" cy="1.3" r=".35"/><circle cx="5.6" cy="1.3" r=".35"/><circle cx="7.7" cy="1.3" r=".35"/><circle cx="9.8" cy="1.3" r=".35"/>
        <circle cx="2.45" cy="2.55" r=".35"/><circle cx="4.55" cy="2.55" r=".35"/><circle cx="6.65" cy="2.55" r=".35"/><circle cx="8.75" cy="2.55" r=".35"/>
        <circle cx="1.4" cy="3.8" r=".35"/><circle cx="3.5" cy="3.8" r=".35"/><circle cx="5.6" cy="3.8" r=".35"/><circle cx="7.7" cy="3.8" r=".35"/><circle cx="9.8" cy="3.8" r=".35"/>
        <circle cx="2.45" cy="5.05" r=".35"/><circle cx="4.55" cy="5.05" r=".35"/><circle cx="6.65" cy="5.05" r=".35"/><circle cx="8.75" cy="5.05" r=".35"/>
        <circle cx="1.4" cy="6.3" r=".35"/><circle cx="3.5" cy="6.3" r=".35"/><circle cx="5.6" cy="6.3" r=".35"/><circle cx="7.7" cy="6.3" r=".35"/><circle cx="9.8" cy="6.3" r=".35"/>
        <circle cx="2.45" cy="7.55" r=".35"/><circle cx="4.55" cy="7.55" r=".35"/><circle cx="6.65" cy="7.55" r=".35"/><circle cx="8.75" cy="7.55" r=".35"/>
      </g>
    </svg>`),
  CAD: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#fff"/><rect width="6" height="16" fill="#d52b1e"/><rect x="18" width="6" height="16" fill="#d52b1e"/>
      <path fill="#d52b1e" d="m12 2 1 3h2l-1.4 1.2.5 2.1L12 7.2 9.9 8.3l.5-2.1L9 5h2z"/>
    </svg>`),
  AUD: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#012169"/>
      <path stroke="#fff" stroke-width="3" d="M0 0 12 8 0 16M24 0 12 8l12 8M12 0v16M0 8h24"/>
      <path stroke="#c8102e" stroke-width="1.5" d="M0 0 12 8 0 16M24 0 12 8l12 8M12 0v16M0 8h24"/>
      <path fill="#fff" d="m17 5 .5 1.7h1.8l-1.45 1.05.55 1.7L17 8.4l-1.4 1.05.55-1.7-1.45-1.05h1.8z"/>
    </svg>`),
  EUR: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#003399"/>
      <g fill="#ffcc00">
        <circle cx="12" cy="2.6" r=".65"/><circle cx="16.7" cy="4" r=".65"/><circle cx="19.4" cy="8" r=".65"/><circle cx="16.7" cy="12" r=".65"/><circle cx="12" cy="13.4" r=".65"/><circle cx="7.3" cy="12" r=".65"/><circle cx="4.6" cy="8" r=".65"/><circle cx="7.3" cy="4" r=".65"/>
      </g>
    </svg>`),
  GBP: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="16" fill="#012169"/>
      <path stroke="#fff" stroke-width="4" d="M0 0 24 16M24 0 0 16"/>
      <path stroke="#c8102e" stroke-width="2" d="M0 0 24 16M24 0 0 16"/>
      <path stroke="#fff" stroke-width="5" d="M12 0v16M0 8h24"/>
      <path stroke="#c8102e" stroke-width="3" d="M12 0v16M0 8h24"/>
    </svg>`),
  SGD: svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16">
      <rect width="24" height="8" fill="#ed2939"/><rect y="8" width="24" height="8" fill="#fff"/>
      <circle cx="6" cy="4" r="2.2" fill="#fff"/>
      <circle cx="6.7" cy="4" r="1.8" fill="#ed2939"/>
      <g fill="#fff"><circle cx="9.5" cy="2" r=".35"/><circle cx="10.5" cy="2.7" r=".35"/><circle cx="10.9" cy="4" r=".35"/><circle cx="10.5" cy="5.3" r=".35"/><circle cx="9.5" cy="6" r=".35"/></g>
    </svg>`),
};

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
        {/* MAIN FOOTER */}
        <div
          className="
            mx-auto
            w-full
            max-w-[1320px]
            px-4
            pb-4
            pt-6
            sm:px-5
            sm:pb-8
            sm:pt-8
            lg:px-8
            lg:pt-10
          "
        >
          <div className="grid gap-5 lg:grid-cols-[1.5fr_0.7fr_0.7fr] lg:gap-16">
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
                  mt-5
                  flex
                  h-[48px]
                  max-w-[420px]
                  overflow-hidden
                  rounded-[11px]
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
                    px-4
                    text-[11px]
                    text-[#111827]
                    outline-none
                    placeholder:text-[#94A3B8]
                  "
                />

                <button
                  type="submit"
                  className="
                    flex
                    m-1
                    w-[42px]
                    shrink-0
                    rounded-[8px]
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
            <div className="lg:hidden border-t border-[#E1E5EA]">
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

          {/* SOCIAL + PAYMENT — HORIZONTAL CARD */}
          <div
            className="
              mt-5
              flex
              w-full
              items-center
              justify-between
              gap-3
              rounded-[12px]
              border
              border-[#E1E5EA]
              bg-white
              px-3
              py-2.5
              shadow-[0_2px_8px_rgba(15,23,42,0.03)]
              sm:mt-7
              sm:px-4
              sm:py-3
            "
          >
            {/* SOCIAL */}
            <div className="flex shrink-0 items-center gap-1">
              <SocialButton
                href="#"
                label="Facebook"
                icon={<Facebook size={17} strokeWidth={1.8} />}
              />

              <SocialButton
                href="#"
                label="Instagram"
                icon={<Instagram size={17} strokeWidth={1.8} />}
              />

              <SocialButton
                href="#"
                label="TikTok"
                icon={
                  <img
                    src="https://cdn.simpleicons.org/tiktok/111827"
                    alt=""
                    aria-hidden="true"
                    className="h-[17px] w-[17px]"
                  />
                }
              />
            </div>

            {/* PAYMENT */}
            <div
              className="flex min-w-0 items-center justify-end gap-1.5 overflow-hidden"
              aria-label="Accepted card payment methods"
            >
              {[
                {
                  name: "American Express",
                  src: "/payment-methods/american-express.png",
                },
                {
                  name: "Mastercard",
                  src: "/payment-methods/mastercard.png",
                },
                {
                  name: "Visa",
                  src: "/payment-methods/visa.png",
                },
              ].map((payment) => (
                <div
                  key={payment.name}
                  className="
                    flex
                    h-[25px]
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[4px]
                    bg-white
                  "
                  title={payment.name}
                >
                  <img
                    src={payment.src}
                    alt={payment.name}
                    className="block h-[25px] w-auto max-w-none object-contain"
                    draggable={false}
                    loading="eager"
                  />
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
              px-4
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
            <p className="order-2 text-[8px] text-[#64748B] sm:order-1">
              © {new Date().getFullYear()} INFIBETTER. All rights reserved.
            </p>

            <div className="order-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:order-2">
              <button
                type="button"
                className="text-[8px] text-[#64748B] transition hover:text-[#111827]"
              >
                Manage cookies
              </button>

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
                    px-0
                    py-1.5
                    text-[9px]
                    text-[#64748B]
                    transition
                    hover:bg-white
                    hover:text-[#111827]
                  "
                >
                  <img
                    src={CURRENCY_FLAGS[currency]}
                    alt=""
                    aria-hidden="true"
                    className="h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover"
                  />
                  <span className="font-semibold text-[#111827]">
                    {currency === "VND"
                      ? "Vietnam (VND)"
                      : `${selectedCurrency.name} (${selectedCurrency.code})`}
                  </span>
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
                      w-[245px]
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
                          <span
                            className="
                              flex
                              h-7
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              border
                              border-[#E5E7EB]
                              bg-white
                              text-[18px]
                              leading-none
                            "
                            aria-hidden="true"
                          >
                            <img
                              src={CURRENCY_FLAGS[option.code]}
                              alt=""
                              aria-hidden="true"
                              className="h-[14px] w-[21px] rounded-[2px] object-cover"
                            />
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

        {/* FLOATING SUPPORT */}
        <button
          type="button"
          aria-label="Customer support"
          className="
            fixed
            bottom-4
            right-4
            z-40
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            border-4
            border-white
            bg-[#0066E6]
            text-white
            shadow-[0_8px_25px_rgba(0,102,230,0.28)]
            transition-transform
            active:scale-95
          "
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white">
            <span className="h-3.5 w-4.5 rounded-[5px] bg-[#0066E6]" />
            <span className="absolute bottom-[4px] left-[7px] h-1.5 w-1.5 rotate-[25deg] rounded-[1px] bg-[#0066E6]" />
          </span>
        </button>
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
