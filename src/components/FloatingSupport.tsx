import { useEffect, useState } from "react";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  Headset,
  Loader2,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

const ISSUE_TYPES = [
  "Product Information",
  "Order & Payment",
  "Shipping & Delivery",
  "Returns & Refunds",
  "Warranty",
  "Other Questions",
];

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Allow support links across the site to open this one shared support panel.
  useEffect(() => {
    const openSupportPanel = () => {
      setOpen(true);
      setSubmitted(false);
      setDropdownOpen(false);
      setError("");
    };

    window.addEventListener("infibetter:open-support", openSupportPanel);
    return () => {
      window.removeEventListener("infibetter:open-support", openSupportPanel);
    };
  }, []);

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMessage = message.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (normalizedMessage.length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("support_requests")
        .insert({
          customer_email: normalizedEmail,
          issue_type: issueType,
          message: normalizedMessage,
          page_url: window.location.href,
          status: "new",
        });

      if (insertError) throw insertError;

      // Track only after Supabase confirms the request was saved.
      // Never send email address or message content to GA4.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "form_submit",
        form_name: "floating_support",
        form_destination: window.location.pathname,
      });

      setSubmitted(true);
      setEmail("");
      setMessage("");
      setDropdownOpen(false);
    } catch (err) {
      console.error("Support request submission failed:", err);
      setError("We couldn't send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="INFIBETTER Support Center"
          className="mb-3 w-[min(calc(100vw-32px),380px)] overflow-visible rounded-[22px] border border-slate-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.14)]"
        >
          <header className="flex items-center justify-between rounded-t-[21px] border-b border-slate-100 bg-white px-5 py-4 text-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Headset size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">INFIBETTER Support</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  How can we help you?
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setDropdownOpen(false);
              }}
              aria-label="Close support"
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </header>

          <div className="rounded-b-[22px] bg-white p-5">
            {submitted ? (
              <div className="py-5 text-center">
                <CheckCircle2 className="mx-auto h-11 w-11 text-blue-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  Request received
                </h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
                  Thank you. Our support team has received your message and
                  will get back to you by email.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setOpen(false);
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="space-y-3.5">
                <p className="text-xs leading-5 text-slate-500">
                  Send us your question. Our team will review your request and
                  reply by email.
                </p>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </label>

                <div className="relative">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    What do you need help with?
                  </span>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen((value) => !value)}
                    className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm outline-none transition ${
                      dropdownOpen
                        ? "border-blue-500 ring-2 ring-blue-500/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium text-slate-800">
                      {issueType}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      role="listbox"
                      aria-label="Support topic"
                      className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.16)]"
                    >
                      {ISSUE_TYPES.map((item) => {
                        const selected = issueType === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              setIssueType(item);
                              setDropdownOpen(false);
                            }}
                            className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition ${
                              selected
                                ? "bg-blue-600 font-semibold text-white"
                                : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                          >
                            <span>{item}</span>
                            {selected && <Check size={16} strokeWidth={2.5} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Message
                  </span>
                  <textarea
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-5 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </label>

                {error && (
                  <p role="alert" className="text-xs text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {loading ? "Sending..." : "Submit request"}
                </button>

                <p className="text-center text-[10px] text-slate-400">
                  Your information is used only to respond to your request.
                </p>
              </form>
            )}
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close support" : "Open support"}
          aria-expanded={open}
          className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-white/90 text-slate-700 shadow-[0_10px_28px_rgba(0,0,0,0.14)] backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_14px_34px_rgba(0,0,0,0.18)]"
        >
          {open ? (
            <X size={22} className="relative z-10" />
          ) : (
            <MessageCircle
              size={23}
              strokeWidth={1.7}
              className="relative z-10 transition-transform group-hover:scale-110"
            />
          )}
          {!open && (
            <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
          )}
        </button>
      </div>
    </div>
  );
}
