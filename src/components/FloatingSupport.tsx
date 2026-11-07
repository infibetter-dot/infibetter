import { useState } from "react";
import {
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

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
      setSubmitted(true);
      setEmail("");
      setMessage("");
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
          className="mb-3 w-[min( calc(100vw - 32px), 380px)] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.20)]"
        >
          <header className="flex items-center justify-between bg-[#111827] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Headset size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">INFIBETTER Support</p>
                <p className="mt-0.5 text-[11px] text-white/65">How can we help you?</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support"
              className="rounded-full p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </header>

          <div className="p-5">
            {submitted ? (
              <div className="py-5 text-center">
                <CheckCircle2 className="mx-auto h-11 w-11 text-emerald-500" />
                <h3 className="mt-3 text-base font-semibold text-[#171717]">Request received</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-neutral-500">
                  Thank you. Our support team has received your message and will get back to you by email.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setOpen(false);
                  }}
                  className="mt-5 rounded-full bg-[#111827] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-black"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="space-y-3.5">
                <p className="text-xs leading-5 text-neutral-500">
                  Send us your question. Our team will review your request and reply by email.
                </p>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Email address</span>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none transition focus:border-[#0066E6] focus:ring-2 focus:ring-[#0066E6]/10"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-neutral-700">What do you need help with?</span>
                  <span className="relative block">
                    <select
                      value={issueType}
                      onChange={(event) => setIssueType(event.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 pr-9 text-sm text-neutral-700 outline-none focus:border-[#0066E6] focus:ring-2 focus:ring-[#0066E6]/10"
                    >
                      {ISSUE_TYPES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-neutral-700">Message</span>
                  <textarea
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full resize-y rounded-xl border border-neutral-200 px-3.5 py-3 text-sm leading-5 outline-none transition focus:border-[#0066E6] focus:ring-2 focus:ring-[#0066E6]/10"
                  />
                </label>

                {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  {loading ? "Sending..." : "Submit request"}
                </button>
                <p className="text-center text-[10px] text-neutral-400">Your information is used only to respond to your request.</p>
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
          className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-gradient-to-br from-white/90 via-white/70 to-neutral-200/60 text-[#20242B] shadow-[0_10px_28px_rgba(0,0,0,0.18),inset_0_1px_1px_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-300 hover:scale-105 hover:shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
        >
          <span className="pointer-events-none absolute inset-[2px] rounded-full border border-white/80" />
          {open ? <X size={22} className="relative z-10" /> : <MessageCircle size={23} strokeWidth={1.7} className="relative z-10 transition-transform group-hover:scale-110" />}
          {!open && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
        </button>
      </div>
    </div>
  );
}
