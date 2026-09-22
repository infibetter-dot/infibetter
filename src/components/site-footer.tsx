import { Instagram, Facebook, Mail, ArrowRight } from "lucide-react";

export function SiteFooter() {
  const paymentMethods = [
    {
      name: "Visa",
      src: "https://cdn.simpleicons.org/visa/1434CB",
      className: "h-[24px] w-[40px]",
    },
    {
      name: "Mastercard",
      src: "https://cdn.simpleicons.org/mastercard",
      className: "h-[24px] w-[40px]",
    },
    {
      name: "American Express",
      src: "https://cdn.simpleicons.org/americanexpress",
      className: "h-[25px] w-[40px]",
    },
    {
      name: "PayPal",
      src: "https://cdn.simpleicons.org/paypal",
      className: "h-[25px] w-[40px]",
    },
    {
      name: "Diners Club",
      src: "https://cdn.simpleicons.org/dinersclub",
      className: "h-[25px] w-[40px]",
    },
    {
      name: "Discover",
      src: "https://cdn.simpleicons.org/discover",
      className: "h-[25px] w-[40px]",
    },
  ];

  return (
    <footer className="mt-12 border-t border-neutral-200 bg-[#F8F6F2] sm:mt-20">
      <div className="container-x">
        {/* =========================================================
            MINIMAL FOOTER — US / UK EDITORIAL STYLE
            Shop + Olive navigation columns removed
           ========================================================= */}
        <div className="grid gap-10 py-12 sm:py-14 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-16">
          {/* BRAND */}
          <div className="max-w-xl">
            <div className="font-display text-[28px] tracking-[0.14em] text-neutral-900 sm:text-[32px]">
              OLIVE LIVING
            </div>

            <p className="mt-5 font-display text-xl font-normal tracking-[-0.01em] text-neutral-800 sm:text-2xl">
              Designed for slower, simpler living.
            </p>

            <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
              Những thiết kế tối giản cho không gian sống hiện đại.
            </p>

            <a
              href="mailto:hello@olivelivingvn.com"
              className="mt-4 inline-block text-xs text-neutral-600 underline-offset-4 transition hover:text-neutral-900 hover:underline"
            >
              hello@olivelivingvn.com
            </a>

            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/olivelivingvn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                <Instagram size={15} strokeWidth={1.5} />
              </a>

              <a
                href="https://www.facebook.com/oliveliving/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                <Facebook size={15} strokeWidth={1.5} />
              </a>

              <a
                href="mailto:hello@olivelivingvn.com"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                <Mail size={15} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="lg:justify-self-end lg:w-full lg:max-w-md">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-neutral-500">
              Stay in the loop
            </p>

            <h3 className="mt-3 font-display text-2xl font-normal tracking-[-0.02em] text-neutral-900 sm:text-[28px]">
              Những điều đáng sống.
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Nhận những sản phẩm mới, cảm hứng không gian và câu chuyện từ
              Olive Living.
            </p>

            <form className="mt-6 flex h-12 overflow-hidden border border-neutral-300 bg-white">
              <input
                type="email"
                placeholder="Email của bạn"
                aria-label="Email của bạn"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />

              <button
                type="submit"
                aria-label="Đăng ký newsletter"
                className="flex w-12 shrink-0 items-center justify-center bg-neutral-900 text-white transition-colors duration-300 hover:bg-neutral-700"
              >
                <ArrowRight size={17} strokeWidth={1.5} />
              </button>
            </form>

            <p className="mt-2 text-[9px] leading-4 text-neutral-400">
              New arrivals · Inspiration · Olive Journal
            </p>

            <p className="mt-1 text-[9px] leading-4 text-neutral-400">
              Bằng việc đăng ký, bạn đồng ý nhận email từ Olive Living.
            </p>
          </div>
        </div>

        <div className="pb-8 text-[10px] uppercase tracking-[0.28em] text-neutral-400">
          Objects for everyday living.
        </div>
      </div>

      {/* =========================================================
          PAYMENT METHODS
          ========================================================= */}
      <div className="border-t border-neutral-200">
        <div className="container-x flex justify-center py-7">
          <div
            className="flex flex-wrap items-center justify-center gap-5 sm:gap-6"
            aria-label="Accepted payment methods"
          >
            {paymentMethods.map((payment) => (
              <div
                key={payment.name}
                className="flex h-7 w-10 items-center justify-center"
                title={payment.name}
              >
                <img
                  src={payment.src}
                  alt={payment.name}
                  className={`${payment.className} object-contain`}
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM BAR
          ========================================================= */}
      <div className="border-t border-neutral-200">
        <div className="container-x flex flex-col gap-3 py-5 text-[10px] uppercase tracking-[0.12em] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Olive Living</p>

          <div className="flex items-center gap-5">
            <a href="#" className="transition hover:text-neutral-900">
              Privacy
            </a>

            <a href="#" className="transition hover:text-neutral-900">
              Terms
            </a>

            <span>Vietnam</span>
          </div>
        </div>
      </div>
    </footer>
  );
}