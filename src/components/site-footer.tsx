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



  X,



} from "lucide-react";



import { useEffect, useRef, useState, type ReactNode } from "react";



import {



  CURRENCIES,



  getCurrency,



  setCurrency as updateCurrency,



  subscribeToCurrencyChange,



  type CurrencyCode,



} from "@/lib/currency-system";



// Inline currency flags. Keeping the flags as React SVGs avoids broken/blank
// <img> placeholders and does not depend on an external CDN or data-image URL.
function CurrencyFlag({ code }: { code: CurrencyCode }) {
  const common = {
    className: "h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover",
    viewBox: "0 0 24 16",
    role: "img" as const,
    "aria-hidden": true,
  };

  switch (code) {
    case "VND":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#da251d" />
          <path fill="#ff0" d="m12 2.7 1.05 3.25h3.42l-2.77 2.01 1.06 3.25L12 9.2l-2.76 2.01 1.06-3.25-2.77-2.01h3.42z" />
        </svg>
      );
    case "USD":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#fff" />
          <path fill="#b22234" d="M0 0h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24v1.23H0zm0 2.46h24V16H0z" />
          <rect width="10.5" height="8.62" fill="#3c3b6e" />
          <g fill="#fff">
            <circle cx="1.4" cy="1.3" r=".35" /><circle cx="3.5" cy="1.3" r=".35" /><circle cx="5.6" cy="1.3" r=".35" /><circle cx="7.7" cy="1.3" r=".35" /><circle cx="9.8" cy="1.3" r=".35" />
            <circle cx="2.45" cy="2.55" r=".35" /><circle cx="4.55" cy="2.55" r=".35" /><circle cx="6.65" cy="2.55" r=".35" /><circle cx="8.75" cy="2.55" r=".35" />
            <circle cx="1.4" cy="3.8" r=".35" /><circle cx="3.5" cy="3.8" r=".35" /><circle cx="5.6" cy="3.8" r=".35" /><circle cx="7.7" cy="3.8" r=".35" /><circle cx="9.8" cy="3.8" r=".35" />
            <circle cx="2.45" cy="5.05" r=".35" /><circle cx="4.55" cy="5.05" r=".35" /><circle cx="6.65" cy="5.05" r=".35" /><circle cx="8.75" cy="5.05" r=".35" />
            <circle cx="1.4" cy="6.3" r=".35" /><circle cx="3.5" cy="6.3" r=".35" /><circle cx="5.6" cy="6.3" r=".35" /><circle cx="7.7" cy="6.3" r=".35" /><circle cx="9.8" cy="6.3" r=".35" />
            <circle cx="2.45" cy="7.55" r=".35" /><circle cx="4.55" cy="7.55" r=".35" /><circle cx="6.65" cy="7.55" r=".35" /><circle cx="8.75" cy="7.55" r=".35" />
          </g>
        </svg>
      );
    case "CAD":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#fff" /><rect width="6" height="16" fill="#d52b1e" /><rect x="18" width="6" height="16" fill="#d52b1e" />
          <path fill="#d52b1e" d="m12 2 1 3h2l-1.4 1.2.5 2.1L12 7.2 9.9 8.3l.5-2.1L9 5h2z" />
        </svg>
      );
    case "AUD":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#012169" />
          <path stroke="#fff" strokeWidth="3" d="M0 0 12 8 0 16M24 0 12 8l12 8M12 0v16M0 8h24" />
          <path stroke="#c8102e" strokeWidth="1.5" d="M0 0 12 8 0 16M24 0 12 8l12 8M12 0v16M0 8h24" />
          <path fill="#fff" d="m17 5 .5 1.7h1.8l-1.45 1.05.55 1.7L17 8.4l-1.4 1.05.55-1.7-1.45-1.05h1.8z" />
        </svg>
      );
    case "EUR":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#003399" />
          <g fill="#ffcc00">
            <circle cx="12" cy="2.6" r=".65" /><circle cx="16.7" cy="4" r=".65" /><circle cx="19.4" cy="8" r=".65" /><circle cx="16.7" cy="12" r=".65" /><circle cx="12" cy="13.4" r=".65" /><circle cx="7.3" cy="12" r=".65" /><circle cx="4.6" cy="8" r=".65" /><circle cx="7.3" cy="4" r=".65" />
          </g>
        </svg>
      );
    case "GBP":
      return (
        <svg {...common}>
          <rect width="24" height="16" fill="#012169" />
          <path stroke="#fff" strokeWidth="4" d="M0 0 24 16M24 0 0 16" /><path stroke="#c8102e" strokeWidth="2" d="M0 0 24 16M24 0 0 16" />
          <path stroke="#fff" strokeWidth="5" d="M12 0v16M0 8h24" /><path stroke="#c8102e" strokeWidth="3" d="M12 0v16M0 8h24" />
        </svg>
      );
    case "SGD":
      return (
        <svg {...common}>
          <rect width="24" height="8" fill="#ed2939" /><rect y="8" width="24" height="8" fill="#fff" />
          <circle cx="6" cy="4" r="2.2" fill="#fff" /><circle cx="6.7" cy="4" r="1.8" fill="#ed2939" />
          <g fill="#fff"><circle cx="9.5" cy="2" r=".35" /><circle cx="10.5" cy="2.7" r=".35" /><circle cx="10.9" cy="4" r=".35" /><circle cx="10.5" cy="5.3" r=".35" /><circle cx="9.5" cy="6" r=".35" /></g>
        </svg>
      );
    default:
      return null;
  }
}

export function SiteFooter() {



  const [openSection, setOpenSection] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<LegalDocumentKey | null>(null);



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
    { label: "Refund policy", onClick: () => setLegalModal("refund") },
    { label: "Shipping", onClick: () => setLegalModal("shipping") },
    { label: "Privacy policy", onClick: () => setLegalModal("privacy") },
    { label: "Terms of service", onClick: () => setLegalModal("terms") },
  ];

  const supportLinks = [
    { label: "Legal notice", onClick: () => setLegalModal("legal") },
    { label: "Cancellations", onClick: () => setLegalModal("cancellations") },
    { label: "Contact", onClick: () => setLegalModal("contact") },
  ];

  const toggleSection = (section: string) => {



    setOpenSection((current) => (current === section ? null : section));



  };



  return (
    <>



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



              <FooterColumn title="Policies" links={exploreLinks} />



            </div>



            <div className="hidden lg:block">



              <FooterColumn title="Information" links={supportLinks} />



            </div>



            {/* MOBILE ACCORDION NAV */}



            <div className="lg:hidden border-t border-[#E1E5EA]">



              <FooterAccordion



                title="Policies"



                links={exploreLinks}



                open={openSection === "policies"}



                onClick={() => toggleSection("policies")}



              />



              <FooterAccordion



                title="Information"



                links={supportLinks}



                open={openSection === "information"}



                onClick={() => toggleSection("information")}



              />



            </div>



          </div>



          {/* SOCIAL + PAYMENT METHODS */}



          <div



            className="



              mt-5



              flex



              w-full



              items-center



              justify-between



              gap-2



              border-t



              border-[#E1E5EA]



              py-4



              sm:mt-7



              sm:py-5



            "



          >



            {/* SOCIAL */}



            <div className="flex items-center gap-3">



              <SocialButton



                href="#"



                label="Facebook"



                icon={<Facebook size={18} strokeWidth={1.8} />}



              />



              <SocialButton



                href="#"



                label="Instagram"



                icon={<Instagram size={18} strokeWidth={1.8} />}



              />



              <SocialButton



                href="#"



                label="TikTok"



                icon={



                  <img



                    src="https://cdn.simpleicons.org/tiktok/111827"



                    alt=""



                    aria-hidden="true"



                    className="h-[18px] w-[18px]"



                  />



                }



              />



            </div>



            {/* PAYMENT METHODS — compact payment card logos */}
            <div
              className="
                grid
                grid-cols-3
                items-center
                justify-items-end
                gap-1.5
                sm:flex
                sm:flex-nowrap
                sm:justify-end
                sm:gap-2
              "
              aria-label="Accepted card payment methods"
            >
              {/* VISA */}
              <div
                title="Visa"
                aria-label="Visa"
                className="flex h-[26px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white"
              >
                <svg viewBox="0 0 42 26" className="block h-[26px] w-[42px]" role="img" aria-label="Visa">
                  <rect width="42" height="26" rx="6" fill="#1A4F96" />
                  <text x="21" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" fontStyle="italic" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-0.7">VISA</text>
                </svg>
              </div>

              {/* MASTERCARD */}
              <div
                title="Mastercard"
                aria-label="Mastercard"
                className="flex h-[26px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white"
              >
                <svg viewBox="0 0 42 26" className="block h-[26px] w-[42px]" role="img" aria-label="Mastercard">
                  <rect width="42" height="26" rx="6" fill="#FFFFFF" />
                  <circle cx="17" cy="12" r="6" fill="#EB001B" />
                  <circle cx="25" cy="12" r="6" fill="#F79E1B" />
                  <path d="M21 7.4a6 6 0 0 1 0 9.2 6 6 0 0 1 0-9.2Z" fill="#FF5F00" />
                  <text x="21" y="22" textAnchor="middle" fill="#111827" fontSize="4.2" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">mastercard</text>
                </svg>
              </div>

              {/* AMERICAN EXPRESS */}
              <div
                title="American Express"
                aria-label="American Express"
                className="flex h-[26px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white"
              >
                <svg viewBox="0 0 42 26" className="block h-[26px] w-[42px]" role="img" aria-label="American Express">
                  <rect width="42" height="26" rx="6" fill="#287FBD" />
                  <text x="21" y="11.5" textAnchor="middle" fill="#FFFFFF" fontSize="4.2" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif">AMERICAN</text>
                  <text x="21" y="17.5" textAnchor="middle" fill="#FFFFFF" fontSize="5.1" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif">EXPRESS</text>
                </svg>
              </div>

              {/* DISCOVER */}
              <div
                title="Discover"
                aria-label="Discover"
                className="flex h-[26px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white"
              >
                <svg viewBox="0 0 42 26" className="block h-[26px] w-[42px]" role="img" aria-label="Discover">
                  <rect width="42" height="26" rx="6" fill="#FFFFFF" />
                  <path d="M2 23 C12 21 24 17 40 8 V25 H2Z" fill="#F47A2A" />
                  <text x="17" y="13.5" textAnchor="middle" fill="#202020" fontSize="5.7" fontWeight="800" fontFamily="Arial, Helvetica, sans-serif">DISC</text>
                  <circle cx="28.8" cy="12" r="2.2" fill="#F47A2A" />
                </svg>
              </div>

              {/* JCB */}
              <div
                title="JCB"
                aria-label="JCB"
                className="flex h-[26px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white"
              >
                <svg viewBox="0 0 42 26" className="block h-[26px] w-[42px]" role="img" aria-label="JCB">
                  <rect width="42" height="26" rx="6" fill="#FFFFFF" />
                  <rect x="6" y="5" width="30" height="16" rx="2" fill="#FFFFFF" stroke="#D5DCE6" />
                  <rect x="7" y="6" width="9.3" height="14" fill="#0B4EA2" />
                  <rect x="16.3" y="6" width="9.3" height="14" fill="#18A558" />
                  <rect x="25.6" y="6" width="9.3" height="14" fill="#E3262E" />
                  <text x="21" y="16.5" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900" fontStyle="italic" fontFamily="Arial, Helvetica, sans-serif">JCB</text>
                </svg>
              </div>

              {/* UNIONPAY */}
              <div
                title="UnionPay"
                aria-label="UnionPay"
                className="flex h-[26px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-white"
              >
                <svg viewBox="0 0 42 26" className="block h-[26px] w-[42px]" role="img" aria-label="UnionPay">
                  <rect width="42" height="26" rx="6" fill="#FFFFFF" />
                  <rect x="6" y="5" width="10" height="16" rx="1.5" fill="#E31837" />
                  <rect x="13" y="5" width="10" height="16" rx="1.5" fill="#0B5AA6" />
                  <rect x="20" y="5" width="10" height="16" rx="1.5" fill="#00A651" />
                  <text x="21" y="15.5" textAnchor="middle" fill="#FFFFFF" fontSize="3.7" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif">UnionPay</text>
                </svg>
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



                  <CurrencyFlag code={currency} />



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



                            <CurrencyFlag code={option.code} />



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



              <button type="button" onClick={() => setLegalModal("privacy")} className="transition hover:text-[#111827]">Privacy</button>



              <button type="button" onClick={() => setLegalModal("terms")} className="transition hover:text-[#111827]">Terms</button>



              <span className="hidden sm:inline text-[#CBD5E1]">•</span>



              <span className="hidden sm:inline">Secure payments</span>



            </div>



          </div>



        </div>






    </div>







    </div>



    </footer>
      {legalModal ? (
        <LegalModal
          document={legalModal}
          onClose={() => setLegalModal(null)}
        />
      ) : null}
    </>







  );



}






type LegalDocumentKey =
  | "refund"
  | "shipping"
  | "privacy"
  | "terms"
  | "legal"
  | "cancellations"
  | "contact";

function LegalLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[#0066e6] underline underline-offset-2 transition hover:text-[#0052b8]"
    >
      {label}
    </button>
  );
}

function LegalModal({
  document,
  onClose,
}: {
  document: LegalDocumentKey;
  onClose: () => void;
}) {
  const titles: Record<LegalDocumentKey, string> = {
    refund: "Refund policy",
    shipping: "Shipping",
    privacy: "Privacy policy",
    terms: "Terms of service",
    legal: "Legal notice",
    cancellations: "Cancellations",
    contact: "Contact",
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        className="flex max-h-[88vh] w-full max-w-[920px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#e8e8e8] px-5 py-4 sm:px-6">
          <h2
            id="legal-modal-title"
            className="text-lg font-semibold tracking-[-0.02em]"
          >
            {titles[document]}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6 sm:px-8">
          <LegalDocumentContent document={document} />
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#e8e8e8] px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#111] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LegalDocumentContent({
  document,
}: {
  document: LegalDocumentKey;
}) {
  const headingClass =
    "mt-7 text-base font-semibold tracking-[-0.01em] first:mt-0";
  const paragraphClass = "mt-3 text-sm leading-6 text-neutral-600";
  const listClass =
    "mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-neutral-600";
  const numberedClass =
    "mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-neutral-600";
  const linkClass =
    "text-[#0066e6] underline underline-offset-2";
  const mailto = "mailto:infibetter@gmail.com";

  if (document === "refund") {
    return (
      <article>
        <p className={paragraphClass}>
          We want the return process to be clear before you send anything.
          Please read the conditions below and obtain approval before returning
          a product.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>30-day window:</strong> Request a standard return within 30 days of delivery.</li>
          <li><strong>No restocking fee:</strong> We charge 0% on approved returns.</li>
          <li><strong>Standard return condition:</strong> Unused, unopened, and complete in the original packaging.</li>
          <li><strong>Return postage:</strong> Customer-paid for standard non-defective returns, unless applicable law requires otherwise.</li>
        </ul>

        <a
          href={mailto + "?subject=Start%20a%20return"}
          className="mt-5 inline-flex rounded-xl bg-[#0066e6] px-4 py-2.5 text-sm font-semibold text-white no-underline"
        >
          Start a return
        </a>

        <h3 className={headingClass}>30-day return window</h3>
        <p className={paragraphClass}>
          You may request a standard return within <strong>30 days of delivery</strong>.
          Submitting a request does not automatically approve the return. You
          must wait for confirmation, instructions, and the correct return
          address before sending anything.
        </p>

        <h3 className={headingClass}>Standard return eligibility</h3>
        <ul className={listClass}>
          <li>Unused and unopened</li>
          <li>Complete and in the same condition as delivered</li>
          <li>Returned in its original packaging</li>
          <li>Accompanied by all accessories, manuals, inserts, and included gifts</li>
        </ul>
        <p className={paragraphClass}>
          A promotional or discounted price alone does not make a product Final
          Sale unless it was clearly identified as Final Sale before purchase.
        </p>

        <h3 className={headingClass}>Items not eligible under the standard return policy</h3>
        <ul className={listClass}>
          <li>Opened, used, incomplete, or customer-damaged products</li>
          <li>Products clearly marked Final Sale before purchase</li>
          <li>Personalized or custom-made products</li>
          <li>Gift cards</li>
          <li>Non-physical services that have already been provided, including shipping protection</li>
          <li>Products damaged through misuse, accidents, unauthorized modification, or failure to follow supplied instructions</li>
        </ul>
        <p className={paragraphClass}>
          These restrictions do not remove mandatory rights that may apply to
          defective, incorrect, or non-conforming goods.
        </p>

        <h3 className={headingClass}>How to request a return</h3>
        <ol className={numberedClass}>
          <li>Email <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.</li>
          <li>Use the email address connected to your order.</li>
          <li>Identify the relevant order and product.</li>
          <li>Provide the requested return reason and information.</li>
          <li>Wait for approval and return instructions.</li>
        </ol>
        <p className={paragraphClass}>
          <strong>Do not send the product to the address shown on the original parcel.</strong>
          That address may belong to a carrier or fulfillment partner and may
          not be able to accept returns.
        </p>

        <h3 className={headingClass}>Return shipping and costs</h3>
        <p className={paragraphClass}>
          <strong>We do not charge a restocking fee (0%).</strong>
        </p>
        <ul className={listClass}>
          <li>The customer pays for tracked return shipping for standard non-defective returns.</li>
          <li>Original shipping charges and paid shipping upgrades are not refundable unless required by law.</li>
          <li>The sender is responsible for return-related duties, taxes, brokerage charges, and similar costs unless applicable law requires otherwise.</li>
        </ul>

        <h3 className={headingClass}>Damaged, defective, or incorrect items</h3>
        <p className={paragraphClass}>
          <strong>Do not submit a standard return for a product that arrived damaged, defective, or incorrect.</strong>
          Contact us as soon as possible and include your order number, a clear
          description, photographs or a short video, and packaging photographs
          where relevant.
        </p>
        <p className={paragraphClass}>
          Contact us at <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
          After reviewing the information, we will provide the appropriate next
          step.
        </p>

        <h3 className={headingClass}>Refund processing</h3>
        <p className={paragraphClass}>
          We will notify you after an approved return reaches the specified
          return location and has been inspected. If accepted, the refundable
          amount—less any applicable return costs—will be issued to the original
          payment method. <strong>No restocking fee will be deducted.</strong>
        </p>

        <h3 className={headingClass}>Exchanges</h3>
        <p className={paragraphClass}>
          The simplest exchange process is normally to return an eligible
          product and place a new order for the correct product. Do not send an
          exchange before receiving approval and return instructions.
        </p>

        <h3 className={headingClass}>Cancellations</h3>
        <p className={paragraphClass}>
          If your order has not been dispatched, contact us immediately. We will
          try to change or cancel it, but changes cannot be guaranteed after
          fulfillment has started.
        </p>

        <h3 className={headingClass}>Mandatory consumer rights</h3>
        <p className={paragraphClass}>
          Nothing in this policy excludes or restricts mandatory consumer
          rights, including remedies for defective, incorrect, damaged, or
          non-conforming goods. Consumers in the European Union generally have
          statutory withdrawal rights for eligible distance purchases, subject
          to applicable exceptions. The 30-day commercial request window is
          intended to provide additional time where applicable.
        </p>

        <h3 className={headingClass}>Return assistance</h3>
        <p className={paragraphClass}>
          For assistance, email <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
          Include your order number and tell us whether the product is unopened,
          damaged, defective, incorrect, or otherwise not as expected.
        </p>
      </article>
    );
  }

  if (document === "shipping") {
    return (
      <article>
        <p className={paragraphClass}>
          We ship INFIBETTER products to customers worldwide. Available
          shipping methods, final charges, and estimated delivery information
          are displayed at checkout.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>Order processing:</strong> Generally 1–2 business days before dispatch.</li>
          <li><strong>Delivery estimates:</strong> Transit times begin after dispatch.</li>
          <li><strong>Shipping options and charges:</strong> Displayed at checkout before payment.</li>
          <li><strong>Tracking:</strong> Normally emailed after your order has been dispatched.</li>
        </ul>

        <h3 className={headingClass}>Order processing</h3>
        <p className={paragraphClass}>
          Orders are generally processed within <strong>1–2 business days</strong>
          before dispatch. Processing may take longer during product launches,
          promotional events, public holidays, unusually high demand, or when
          additional order verification is required.
        </p>

        <h3 className={headingClass}>Estimated delivery times</h3>
        <p className={paragraphClass}>
          The following estimates apply <strong>after dispatch</strong>:
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5e5e5]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-[#f7f7f7]">
              <tr>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Estimated transit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              <tr><td className="px-4 py-3">United States, Canada, and Europe</td><td className="px-4 py-3">5–9 business days</td></tr>
              <tr><td className="px-4 py-3">United Kingdom</td><td className="px-4 py-3">5–8 business days</td></tr>
              <tr><td className="px-4 py-3">Australia and New Zealand</td><td className="px-4 py-3">5–9 business days</td></tr>
              <tr><td className="px-4 py-3">Other destinations</td><td className="px-4 py-3">5–12 business days</td></tr>
            </tbody>
          </table>
        </div>

        <p className={paragraphClass}>
          These estimates are guidance and are not guaranteed delivery dates.
          Products containing batteries may require specialized shipping and
          can take approximately <strong>4–10 business days after dispatch</strong>,
          depending on destination and carrier service.
        </p>

        <h3 className={headingClass}>Express shipping</h3>
        <p className={paragraphClass}>
          Express shipping may be displayed at checkout for supported products,
          destinations, and orders. When available, processing is usually 1–2
          business days before dispatch and transit is usually 2–4 business days
          after dispatch.
        </p>

        <h3 className={headingClass}>Shipping charges</h3>
        <p className={paragraphClass}>
          Available shipping methods and charges are shown at checkout before
          payment. Any free-shipping promotion applies only when the order meets
          the conditions displayed during checkout.
        </p>

        <h3 className={headingClass}>Tracking</h3>
        <p className={paragraphClass}>
          Tracking information is normally emailed after your order has been
          dispatched. Temporary gaps between carrier scans are normal while a
          parcel moves between facilities, carriers, or customs authorities.
        </p>

        <h3 className={headingClass}>Delivery estimates and delays</h3>
        <ul className={listClass}>
          <li>Customs processing</li>
          <li>Carrier congestion</li>
          <li>Severe weather</li>
          <li>Local disruptions and public holidays</li>
          <li>Remote delivery locations</li>
          <li>Incomplete or incorrect address information</li>
          <li>Security or customs inspections</li>
          <li>Peak shopping periods</li>
        </ul>

        <h3 className={headingClass}>Pre-orders</h3>
        <p className={paragraphClass}>
          A product identified as a <strong>Pre-order</strong> is not ready for
          immediate dispatch. The product page or checkout will display an
          estimated shipping timeframe where available. This is an estimate and
          may change because of production, transportation, customs, or
          supply-chain circumstances.
        </p>

        <h3 className={headingClass}>Products containing batteries</h3>
        <p className={paragraphClass}>
          Products containing lithium batteries may be unavailable in certain
          countries or regions and may require additional transit time. Express
          delivery may not be available for these products. Available options
          will be shown at checkout.
        </p>

        <h3 className={headingClass}>Address changes and cancellations</h3>
        <p className={paragraphClass}>
          Review your delivery details carefully before completing checkout. If
          an address needs to be changed, contact us immediately. We will try to
          assist before dispatch, but cannot guarantee changes after fulfillment
          has started.
        </p>

        <h3 className={headingClass}>Tracking shows delivered</h3>
        <ol className={numberedClass}>
          <li>Confirm that the delivery address is correct.</li>
          <li>Check safe locations around the property.</li>
          <li>Ask household members and nearby neighbors.</li>
          <li>Check for carrier notices or pickup instructions.</li>
          <li>Contact the carrier for delivery details or proof of delivery.</li>
        </ol>

        <h3 className={headingClass}>Lost or damaged shipments</h3>
        <p className={paragraphClass}>
          If a parcel appears lost, arrives visibly damaged, or contains a
          damaged product, contact INFIBETTER at{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>
      </article>
    );
  }

  if (document === "privacy") {
    return (
      <article>
        <p className={paragraphClass}>Last updated: September 3, 2026</p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>How we use information:</strong> To process orders, provide support, improve the Services, and support marketing.</li>
          <li><strong>Your rights:</strong> Access, correction, deletion, and other choices may be available under applicable law.</li>
          <li><strong>Marketing emails:</strong> You can unsubscribe using the link in each promotional email.</li>
          <li><strong>Privacy requests:</strong> Email <a className={linkClass} href={mailto}>infibetter@gmail.com</a> with the subject line <strong>Privacy Request</strong>.</li>
        </ul>

        <h3 className={headingClass}>Personal information we collect or process</h3>
        <p className={paragraphClass}>
          We may collect or process information that identifies or can reasonably
          be linked to you, depending on how you interact with the Services,
          where you live, and as permitted or required by applicable law.
        </p>
        <ul className={listClass}>
          <li><strong>Contact details</strong> including name, address, billing address, shipping address, phone number, and email address.</li>
          <li><strong>Financial information</strong> including payment and transaction details.</li>
          <li><strong>Account information</strong> including username, password, preferences, and settings.</li>
          <li><strong>Transaction information</strong> including items viewed, cart items, purchases, returns, exchanges, and cancellations.</li>
          <li><strong>Communications with us</strong> including customer support inquiries.</li>
          <li><strong>Device information</strong> including device, browser, network, IP address, and similar identifiers.</li>
          <li><strong>Usage information</strong> including interactions with and navigation of the Services.</li>
        </ul>

        <h3 className={headingClass}>Personal information sources</h3>
        <ul className={listClass}>
          <li>Directly from you when you use the Services or provide information.</li>
          <li>Automatically through the Services, including cookies and similar technologies.</li>
          <li>From service providers that enable technology and process information on our behalf.</li>
          <li>From partners or other third parties.</li>
        </ul>

        <h3 className={headingClass}>How we use your personal information</h3>
        <ul className={listClass}>
          <li><strong>Provide, tailor, and improve the Services:</strong> Process payments, fulfill orders, arrange shipping, facilitate returns and exchanges, manage accounts, and improve the shopping experience.</li>
          <li><strong>Marketing and advertising:</strong> Send promotional communications and show relevant advertising where permitted by law.</li>
          <li><strong>Security and fraud prevention:</strong> Secure payments and services and detect, investigate, or prevent fraudulent, illegal, unsafe, or malicious activity.</li>
          <li><strong>Communicating with you:</strong> Provide customer support and maintain our business relationship.</li>
          <li><strong>Legal reasons:</strong> Comply with applicable law and respond to valid legal process.</li>
        </ul>

        <h3 className={headingClass}>How we disclose personal information</h3>
        <ul className={listClass}>
          <li>With vendors and service providers that perform payment processing, analytics, customer support, cloud storage, fulfillment, or shipping.</li>
          <li>With business and marketing partners where permitted and subject to applicable privacy notices.</li>
          <li>When you direct, request, or consent to disclosure.</li>
          <li>With affiliates or within our corporate group.</li>
          <li>In connection with business transactions or legal obligations.</li>
        </ul>

        <h3 className={headingClass}>Third-party websites and links</h3>
        <p className={paragraphClass}>
          The Services may provide links to third-party websites or platforms.
          Review their privacy and security policies before providing
          information. We are not responsible for independent third-party
          websites except where applicable law provides otherwise.
        </p>

        <h3 className={headingClass}>Children's data</h3>
        <p className={paragraphClass}>
          The Services are not intended for children, and we do not knowingly
          collect personal information from children under the age of majority
          in the applicable jurisdiction.
        </p>

        <h3 className={headingClass}>Security and retention</h3>
        <p className={paragraphClass}>
          No security measure is perfect or impenetrable. Retention periods
          depend on factors such as account maintenance, service delivery,
          legal obligations, dispute resolution, and enforcement of agreements.
        </p>

        <h3 className={headingClass}>Your rights and choices</h3>
        <ul className={listClass}>
          <li>Request access to personal information we hold about you.</li>
          <li>Request deletion of eligible information.</li>
          <li>Request correction of inaccurate information.</li>
          <li>Request a portable copy in applicable circumstances.</li>
          <li>Object to or restrict certain processing where available.</li>
          <li>Withdraw consent where processing is based on consent.</li>
          <li>Opt out of certain marketing or targeted advertising where applicable.</li>
        </ul>

        <h3 className={headingClass}>Marketing communications</h3>
        <p className={paragraphClass}>
          You may opt out of promotional emails using the unsubscribe option
          provided in those emails. We may still send non-promotional messages
          relating to your account or orders.
        </p>

        <h3 className={headingClass}>International transfers</h3>
        <p className={paragraphClass}>
          Your personal information may be transferred, stored, or processed
          outside the country where you live. Where required by law, we use
          recognized safeguards for applicable international transfers.
        </p>

        <h3 className={headingClass}>Contact</h3>
        <p className={paragraphClass}>
          For privacy questions or requests, email{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a> with
          the subject line <strong>Privacy Request</strong>.
        </p>
      </article>
    );
  }

  if (document === "terms") {
    return (
      <article>
        <p className={paragraphClass}>
          These Terms of Service govern your use of INFIBETTER and purchases
          made through the store. By accessing the website or placing an order,
          you agree to these Terms. Mandatory consumer rights remain unaffected.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>Shipping and delivery:</strong> See our Shipping policy for processing, delivery, and tracking information.</li>
          <li><strong>Returns and refunds:</strong> See our Refund policy for eligibility, return costs, and refund processing.</li>
          <li><strong>No restocking fee:</strong> We charge 0% on approved standard returns.</li>
          <li><strong>Your consumer rights:</strong> Mandatory rights under applicable law remain unaffected.</li>
        </ul>

        <h3 className={headingClass}>1. Online store terms</h3>
        <p className={paragraphClass}>
          You must be legally capable of entering into a binding agreement to
          place an order. You may not use our products, website, or services for
          unlawful or unauthorized purposes.
        </p>

        <h3 className={headingClass}>2. Product information</h3>
        <p className={paragraphClass}>
          We aim to present product descriptions, specifications, compatibility
          information, colors, prices, and images accurately. Screen settings,
          lighting, manufacturing updates, and reasonable production variations
          may cause minor differences.
        </p>

        <h3 className={headingClass}>3. Prices and payment</h3>
        <p className={paragraphClass}>
          Prices are displayed in the currency shown at checkout. The checkout
          total reflects applicable discounts and the shipping charges shown
          before payment. Payment is processed through the method selected at
          checkout.
        </p>

        <h3 className={headingClass}>4. Orders and acceptance</h3>
        <p className={paragraphClass}>
          Your order is an offer to purchase the selected products. An order
          confirmation acknowledges receipt but does not necessarily mean that
          the order has been accepted. We may refuse or cancel an order for
          legitimate reasons such as suspected fraud, product unavailability,
          delivery restrictions, or obvious pricing errors. If we cancel a paid
          order, the affected amount will be refunded to the original payment
          method.
        </p>

        <h3 className={headingClass}>5. Pre-orders</h3>
        <p className={paragraphClass}>
          Products clearly marked <strong>Pre-order</strong> are not available
          for immediate dispatch. Any shipping or release date shown is an
          estimate unless expressly stated otherwise.
        </p>

        <h3 className={headingClass}>6. Shipping and delivery</h3>
        <p className={paragraphClass}>
          Processing times, estimated transit times, tracking, customs
          information, and delivery limitations are explained in the Shipping
          policy. Delivery estimates are not guarantees. You are responsible
          for entering a complete and accurate delivery address.
        </p>

        <h3 className={headingClass}>7. Returns and refunds</h3>
        <p className={paragraphClass}>
          Returns, eligibility requirements, return shipping costs, damaged or
          incorrect products, and refund processing are governed by the Refund
          policy. <strong>We do not charge a restocking fee (0%).</strong>
        </p>

        <h3 className={headingClass}>8. Promotions and discount codes</h3>
        <ul className={listClass}>
          <li>Discount codes may be subject to eligibility requirements and usage limits.</li>
          <li>Discounts cannot be applied retroactively unless stated otherwise.</li>
          <li>Promotional offers have no cash value.</li>
          <li>Fraudulent or abusive use of a promotion may be cancelled.</li>
        </ul>

        <h3 className={headingClass}>9. Intellectual property</h3>
        <p className={paragraphClass}>
          Website content including text, graphics, logos, images, videos,
          product names, designs, and software is owned by or licensed to
          INFIBETTER and protected by applicable intellectual-property laws.
        </p>

        <h3 className={headingClass}>10. Reviews and submitted content</h3>
        <p className={paragraphClass}>
          If you submit a review, photograph, comment, suggestion, or other
          content, you confirm that you have the right to submit it and that it
          does not violate another person's rights or applicable law.
        </p>

        <h3 className={headingClass}>11. Third-party services and links</h3>
        <p className={paragraphClass}>
          The website may contain third-party tools, payment services,
          integrations, applications, or links. Third-party services may be
          governed by their own terms and privacy policies.
        </p>

        <h3 className={headingClass}>12. Prohibited conduct</h3>
        <ul className={listClass}>
          <li>Use the website for unlawful or fraudulent activity.</li>
          <li>Infringe intellectual-property or privacy rights.</li>
          <li>Submit false or misleading information.</li>
          <li>Introduce malware or harmful code.</li>
          <li>Scrape or extract website data without permission.</li>
          <li>Circumvent security or access restrictions.</li>
          <li>Interfere with the website or another customer's use.</li>
          <li>Place orders for unauthorized commercial resale.</li>
        </ul>

        <h3 className={headingClass}>13. Disclaimer and liability</h3>
        <p className={paragraphClass}>
          We do not guarantee that the website will always be uninterrupted,
          error-free, or available. Nothing in these Terms excludes or limits
          liability or consumer rights that cannot legally be excluded or
          limited.
        </p>

        <h3 className={headingClass}>14. Changes to these Terms</h3>
        <p className={paragraphClass}>
          We may update these Terms when our services, business practices, or
          legal obligations change. The version applying to your purchase is
          generally the version made available when the order was placed, unless
          a change is required by law or accepted by you.
        </p>

        <h3 className={headingClass}>15. Contact</h3>
        <p className={paragraphClass}>
          Questions about these Terms may be sent to{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>
      </article>
    );
  }

  if (document === "legal") {
    return (
      <article>
        <h3 className={headingClass}>Legal notice</h3>
        <p className={paragraphClass}>
          This website is operated by <strong>INFIBETTER</strong>.
        </p>

        <h3 className={headingClass}>Customer service</h3>
        <p className={paragraphClass}>
          For customer service, order assistance, product questions, delivery
          issues, returns, or complaints, email{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>

        <h3 className={headingClass}>Intellectual property</h3>
        <p className={paragraphClass}>
          Unless otherwise stated, website content including text, logos,
          graphics, photographs, videos, product names, layouts, and designs is
          owned by or licensed to INFIBETTER and protected by applicable
          intellectual-property laws.
        </p>

        <h3 className={headingClass}>Mandatory consumer rights</h3>
        <p className={paragraphClass}>
          Nothing in this Legal Notice excludes or restricts mandatory consumer
          rights available under applicable law.
        </p>
      </article>
    );
  }

  if (document === "cancellations") {
    return (
      <article>
        <p className={paragraphClass}>
          This policy applies to products clearly identified as{" "}
          <strong>Pre-order</strong> before purchase.
        </p>

        <h3 className={headingClass}>At a glance</h3>
        <ul className={listClass}>
          <li><strong>Before dispatch:</strong> You may request cancellation of your pre-order.</li>
          <li><strong>Cancellation refunds:</strong> Issued to the original payment method.</li>
          <li><strong>Shipping timeframes:</strong> Estimated unless expressly stated otherwise.</li>
          <li><strong>After delivery:</strong> Our Refund policy and mandatory consumer rights apply.</li>
        </ul>

        <h3 className={headingClass}>What a pre-order means</h3>
        <p className={paragraphClass}>
          A pre-order allows you to purchase a product before it is ready for
          immediate dispatch. The product page or checkout may provide an
          estimated release or shipping timeframe. Unless expressly stated
          otherwise, this timeframe is an estimate and may change because of
          production, transportation, customs, carrier, or supply-chain
          circumstances.
        </p>

        <h3 className={headingClass}>Canceling before dispatch</h3>
        <p className={paragraphClass}>
          You may request cancellation of a pre-order at any time before it has
          been dispatched. Contact{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a> with
          your <strong>order number</strong>. If the pre-order has not been
          dispatched, the canceled product will be refunded to the original
          payment method.
        </p>

        <h3 className={headingClass}>After dispatch</h3>
        <p className={paragraphClass}>
          A pre-order cannot be canceled after dispatch. After delivery, the
          order is subject to our Refund policy and mandatory consumer rights.
        </p>

        <h3 className={headingClass}>Changes to the estimated shipping date</h3>
        <p className={paragraphClass}>
          If we cannot ship within the timeframe stated at purchase, we will
          notify you and provide a revised estimate. Where required by
          applicable law, you may have cancellation or refund options.
        </p>

        <h3 className={headingClass}>Orders containing multiple products</h3>
        <p className={paragraphClass}>
          If an order contains both in-stock and pre-order products, they may be
          shipped together or separately depending on fulfillment availability.
        </p>

        <h3 className={headingClass}>Cancellation by INFIBETTER</h3>
        <p className={paragraphClass}>
          We may cancel a pre-order if the product cannot be supplied,
          production is discontinued, a material pricing or product-information
          error occurred, shipping restrictions prevent fulfillment, or fraud
          or unauthorized payment is reasonably suspected. If we cancel a paid
          pre-order, the affected amount will be refunded to the original
          payment method.
        </p>

        <h3 className={headingClass}>Contact</h3>
        <p className={paragraphClass}>
          For pre-order assistance, email{" "}
          <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        </p>
      </article>
    );
  }

  return (
    <article>
      <h3 className={headingClass}>Contact information</h3>
      <p className={paragraphClass}>
        <strong>Trading name:</strong> INFIBETTER
      </p>
      <p className={paragraphClass}>
        <strong>Email:</strong>{" "}
        <a className={linkClass} href={mailto}>infibetter@gmail.com</a>
      </p>

      <h3 className={headingClass}>Customer support</h3>
      <p className={paragraphClass}>
        For assistance with an order, delivery, return, or product, email{" "}
        <a className={linkClass} href={mailto}>infibetter@gmail.com</a>.
        Include your <strong>order number</strong> when contacting us about an
        existing order.
      </p>

      <h3 className={headingClass}>Returns</h3>
      <p className={paragraphClass}>
        You must request and receive return approval, instructions, and the
        correct return address before shipping anything. Contact INFIBETTER
        before sending a return.
      </p>
    </article>
  );
}


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





function FooterColumn({



  title,



  links,



}: {



  title: string;



  links: {



    label: string;



    onClick: () => void;



  }[];



}) {



  return (



    <div>



      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#111827]">



        {title}



      </h3>



      <nav className="mt-3 flex flex-col gap-2">



        {links.map((link) => (



          <button
            key={link.label}
            type="button"
            onClick={link.onClick}
            className="



              w-fit



              text-[11px]



              text-[#64748B]



              transition-colors



              duration-200



              hover:text-[#0066E6]



            "



          >



            {link.label}



          </button>



        ))}



      </nav>



    </div>



  );



}





function FooterAccordion({



  title,



  links,



  open,



  onClick,



}: {



  title: string;



  links: {



    label: string;



    onClick: () => void;



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



        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111827]">



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



        <nav className="grid w-full grid-cols-2 justify-items-start gap-x-5 gap-y-2 pb-3 pl-10 pr-2">



          {links.map((link) => (



            <button
            key={link.label}
            type="button"
            onClick={link.onClick}
            className="w-full text-left text-[10px] leading-4 text-[#64748B]



                transition-colors



                hover:text-[#0066E6]



              "



            >



              {link.label}



            </button>



          ))}



        </nav>



      ) : null}



    </div>



  );



}





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
