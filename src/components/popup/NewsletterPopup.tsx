
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import popupImage from "@/assets/hero/popup.png";
import popupMobileImage from "@/assets/hero/popupmobile.png";

const STORAGE_KEY = "infibetter_newsletter_popup_dismissed";
const SUBSCRIBED_KEY = "infibetter_newsletter_subscribed";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
      if (localStorage.getItem(SUBSCRIBED_KEY) === "1") return;
    } catch {
      // Continue if browser storage is unavailable.
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsOpen(false);

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors.
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: normalizedEmail,
          source: "newsletter_popup",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("This email is already registered.");
          return;
        }

        console.error("NEWSLETTER SIGNUP ERROR:", insertError);
        throw insertError;
      }

      setSubmitted(true);

      try {
        localStorage.setItem(SUBSCRIBED_KEY, "1");
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // Ignore storage errors.
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/65 p-3 backdrop-blur-[3px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
    >
      {/* Popup container */}
      <div className="relative my-auto grid max-h-[90dvh] w-full max-w-[820px] grid-cols-1 overflow-y-auto overscroll-contain rounded-[18px] bg-white shadow-2xl sm:rounded-[22px] md:min-h-[460px] md:grid-cols-2 md:overflow-hidden">

        {/* Close button */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close newsletter popup"
          className="absolute right-2.5 top-2.5 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-xl leading-none text-gray-700 shadow-sm transition hover:bg-gray-100 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          ×
        </button>

        {/* Image area */}
        <div className="relative w-full shrink-0 overflow-hidden bg-white md:h-full md:min-h-[460px]">

          {/* Mobile image - full width, natural aspect ratio */}
          <img
            src={popupMobileImage}
            alt="INFIBETTER wireless charging products"
            loading="lazy"
            draggable={false}
            className="block h-auto w-full object-contain md:hidden"
          />

          {/* Desktop image */}
          <img
            src={popupImage}
            alt="INFIBETTER wireless charging products"
            loading="lazy"
            draggable={false}
            className="hidden h-full w-full object-contain object-center p-5 md:block"
          />
        </div>

        {/* Form content */}
        <div className="flex flex-col justify-center px-5 py-5 text-center sm:px-8 sm:py-7 md:px-9 md:py-9 lg:px-11">

          {/* Brand */}
          <p className="mb-4 text-[13px] font-bold tracking-[0.16em] text-[#252525] sm:mb-6 sm:text-[15px] md:mb-8 md:text-[17px]">
            INFIBETTER
          </p>

          {!submitted ? (
            <>
              {/* Eyebrow */}
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#777777] sm:mb-2 sm:text-[10px] md:text-[11px]">
                A little something for you
              </p>

              {/* Heading */}
              <h2
                id="newsletter-popup-title"
                className="text-[25px] font-semibold leading-[1.08] tracking-[-0.04em] text-black sm:text-[30px] md:text-[36px]"
              >
                Get 30% Off
                <br />
                Your First Order
              </h2>

              {/* Description */}
              <p className="mx-auto mt-2.5 max-w-[340px] text-[12px] leading-[1.55] text-[#666666] sm:mt-3 sm:text-[13px] md:mt-4 md:text-sm md:leading-6">
                Sign up with your email and receive an exclusive 30% discount
                voucher from INFIBETTER.
              </p>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5 md:mt-7 md:space-y-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="h-10 w-full rounded-full border border-[#D8D8D8] bg-white px-4 text-[12px] text-[#252525] outline-none transition placeholder:text-[#999999] focus:border-[#252525] sm:h-11 sm:px-5 sm:text-sm md:h-12"
                />

                {error && (
                  <p className="text-left text-[11px] text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-full bg-[#171717] px-5 text-[12px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-sm md:h-12"
                >
                  {isSubmitting ? "Submitting..." : "Get My 30% Voucher"}
                </button>
              </form>

              {/* Disclaimer */}
              <p className="mt-3 text-[9px] leading-[1.6] text-[#999999] sm:mt-3.5 sm:text-[10px] md:mt-4 md:text-[11px] md:leading-5">
                By signing up, you agree to receive occasional emails from
                INFIBETTER. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="py-4 sm:py-6 md:py-8">
              <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Thank you!
              </h2>

              <p className="mt-2.5 text-[12px] leading-5 text-[#666666] sm:text-sm sm:leading-6">
                Your email has been successfully registered with INFIBETTER.
              </p>

              <button
                type="button"
                onClick={closePopup}
                className="mt-5 h-10 rounded-full bg-[#171717] px-7 text-[12px] font-semibold text-white transition hover:bg-black sm:mt-7 sm:h-11 sm:px-8 sm:text-sm"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
