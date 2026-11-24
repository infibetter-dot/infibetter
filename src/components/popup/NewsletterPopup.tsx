
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import popupImage from "@/assets/hero/popup.png";

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
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
    >
      <div className="relative grid w-full max-w-[850px] overflow-hidden rounded-[22px] bg-white shadow-2xl md:min-h-[500px] md:grid-cols-2">
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close newsletter popup"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-2xl leading-none text-gray-700 shadow-sm transition hover:bg-gray-100"
        >
          ×
        </button>

        <div className="relative h-[190px] overflow-hidden bg-[#F5F5F5] sm:h-[240px] md:h-full">
          <img
            src={popupImage}
            alt="INFIBETTER products"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-8 text-center sm:px-10 sm:py-10 md:px-11">
          <p className="mb-8 text-[17px] font-bold tracking-[0.16em] text-[#252525]">
            INFIBETTER
          </p>

          {!submitted ? (
            <>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#777777]">
                A little something for you
              </p>

              <h2
                id="newsletter-popup-title"
                className="text-[30px] font-semibold leading-[1.08] tracking-[-0.04em] text-black sm:text-[36px]"
              >
                Get 30% Off
                <br />
                Your First Order
              </h2>

              <p className="mx-auto mt-4 max-w-[340px] text-sm leading-6 text-[#666666]">
                Sign up with your email and receive an exclusive 30% discount
                voucher from INFIBETTER.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-full border border-[#D8D8D8] bg-white px-5 text-sm text-[#252525] outline-none transition placeholder:text-[#999999] focus:border-[#252525]"
                />

                {error && (
                  <p className="text-left text-xs text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-full bg-[#171717] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Get My 30% Voucher"}
                </button>
              </form>

              <p className="mt-4 text-[11px] leading-5 text-[#999999]">
                By signing up, you agree to receive occasional emails from
                INFIBETTER. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="py-8">
              <h2 className="text-3xl font-semibold tracking-tight text-black">
                Thank you!
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#666666]">
                Your email has been successfully registered with INFIBETTER.
              </p>

              <button
                type="button"
                onClick={closePopup}
                className="mt-7 h-11 rounded-full bg-[#171717] px-8 text-sm font-semibold text-white hover:bg-black"
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
