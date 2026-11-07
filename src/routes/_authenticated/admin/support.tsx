import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Headset,
  Loader2,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/support")({
  component: SupportInboxPage,
});

type SupportRequest = {
  id: string;
  customer_email: string;
  issue_type: string;
  message: string;
  page_url: string | null;
  status: "new" | "in_progress" | "resolved";
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
};

const statusLabels = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

function SupportInboxPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const requestsQuery = useQuery({
    queryKey: ["admin-support-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select(
          "id, customer_email, issue_type, message, page_url, status, admin_reply, created_at, updated_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupportRequest[];
    },
  });

  const requests = requestsQuery.data ?? [];
  const selected =
    requests.find((item) => item.id === selectedId) ?? requests[0] ?? null;

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter;
      const matchesSearch =
        !q ||
        item.customer_email.toLowerCase().includes(q) ||
        item.issue_type.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requests, filter, keyword]);

  async function updateRequest(
    id: string,
    patch: Partial<Pick<SupportRequest, "status" | "admin_reply">>,
  ) {
    const { error } = await supabase
      .from("support_requests")
      .update(patch)
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Support request updated.");
    await queryClient.invalidateQueries({
      queryKey: ["admin-support-requests"],
    });
  }

  const counts = {
    new: requests.filter((item) => item.status === "new").length,
    in_progress: requests.filter((item) => item.status === "in_progress").length,
    resolved: requests.filter((item) => item.status === "resolved").length,
  };

  function selectRequest(item: SupportRequest) {
    setSelectedId(item.id);
    setReply(item.admin_reply ?? "");
    setMobileDetailOpen(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F8FA] px-3 pb-8 pt-24 sm:px-6 sm:pt-24 lg:px-8 lg:pt-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <Link
              to="/account"
              className="mb-4 inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeft size={14} />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0066E6] sm:text-xs">
              <Headset size={15} /> Customer care
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#171717] sm:mt-2 sm:text-3xl">
              Support Inbox
            </h1>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              Review and manage customer support requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["admin-support-requests"],
              })
            }
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 sm:w-auto"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <section className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
          {(
            [
              ["New", counts.new, "text-blue-600", "bg-blue-50"],
              ["In progress", counts.in_progress, "text-amber-600", "bg-amber-50"],
              ["Resolved", counts.resolved, "text-emerald-600", "bg-emerald-50"],
            ] as const
          ).map(([label, count, color, bg]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-neutral-200 bg-white p-2.5 sm:rounded-2xl sm:p-4"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[10px] text-neutral-500 sm:text-xs">
                  {label}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl ${bg} ${color}`}
                >
                  {label === "New" ? (
                    <MessageSquareText size={14} />
                  ) : label === "Resolved" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Clock3 size={14} />
                  )}
                </span>
              </div>
              <p className="mt-1.5 text-xl font-semibold text-[#171717] sm:mt-2 sm:text-2xl">
                {count}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-4 min-h-[560px] overflow-hidden rounded-2xl border border-neutral-200 bg-white sm:mt-6 lg:grid lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]">
          {/* Request list: full view on mobile until a request is selected. */}
          <div
            className={`min-w-0 border-neutral-200 lg:block lg:border-r ${
              mobileDetailOpen ? "hidden" : "block"
            }`}
          >
            <div className="border-b border-neutral-100 p-3 sm:p-4">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search email or message..."
                  className="h-10 w-full rounded-xl border border-neutral-200 pl-9 pr-3 text-xs outline-none focus:border-[#0066E6]"
                />
              </div>

              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                {["all", "new", "in_progress", "resolved"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-semibold transition ${
                      filter === item
                        ? "bg-[#111827] text-white"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    {item === "all" ? "All" : statusLabels[item as keyof typeof statusLabels]}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto lg:max-h-[650px]">
              {requestsQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 p-10 text-sm text-neutral-400">
                  <Loader2 size={16} className="animate-spin" /> Loading requests...
                </div>
              ) : requestsQuery.isError ? (
                <p className="p-6 text-sm text-red-600">
                  Unable to load support requests. Check the table and admin access policies.
                </p>
              ) : filtered.length === 0 ? (
                <p className="p-8 text-center text-sm text-neutral-400">
                  No support requests found.
                </p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectRequest(item)}
                    className={`block w-full border-b border-neutral-100 p-3.5 text-left transition hover:bg-neutral-50 sm:p-4 ${
                      selected?.id === item.id ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 break-all text-xs font-semibold text-neutral-800">
                        {item.customer_email}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                          item.status === "new"
                            ? "bg-blue-50 text-blue-700"
                            : item.status === "in_progress"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-neutral-600">
                      {item.issue_type}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-neutral-400">
                      {item.message}
                    </p>
                    <p className="mt-2 text-[10px] text-neutral-400">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Request details: split pane on desktop, dedicated screen on mobile. */}
          <div
            className={`min-w-0 p-3 sm:p-5 lg:block lg:p-7 ${
              mobileDetailOpen ? "block" : "hidden"
            }`}
          >
            {!selected ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <Headset size={28} className="text-neutral-300" />
                <p className="mt-3 text-sm font-semibold text-neutral-600">
                  Select a support request
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Customer details and message will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-neutral-600 lg:hidden"
                >
                  <ArrowLeft size={14} /> Back to requests
                </button>
              </div>
            ) : (
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="mb-4 inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 lg:hidden"
                >
                  <ArrowLeft size={14} /> Back to requests
                </button>

                <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      Customer request
                    </p>
                    <h2 className="mt-1 break-all text-base font-semibold text-[#171717] sm:text-lg">
                      {selected.customer_email}
                    </h2>
                    <p className="mt-1 text-[11px] leading-5 text-neutral-500 sm:text-xs">
                      {selected.issue_type} ·{" "}
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>

                  <a
                    href={`mailto:${selected.customer_email}`}
                    className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 sm:w-auto"
                  >
                    <Mail size={14} /> Email customer
                  </a>
                </div>

                <div className="mt-4 rounded-xl bg-[#F7F8FA] p-3.5 sm:mt-6 sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">
                    {selected.message}
                  </p>
                  {selected.page_url && (
                    <a
                      href={selected.page_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block break-all text-[11px] text-blue-600 hover:underline"
                    >
                      Page: {selected.page_url}
                    </a>
                  )}
                </div>

                <div className="mt-5 sm:mt-6">
                  <label
                    htmlFor="support-reply"
                    className="text-xs font-semibold text-neutral-700"
                  >
                    Internal reply / response draft
                  </label>
                  <textarea
                    id="support-reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={5}
                    maxLength={5000}
                    placeholder="Write a response for this customer..."
                    className="mt-2 min-h-[140px] w-full resize-y rounded-xl border border-neutral-200 p-3 text-sm leading-6 outline-none focus:border-[#0066E6]"
                  />

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        updateRequest(selected.id, {
                          status: e.target.value as SupportRequest["status"],
                        })
                      }
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 outline-none focus:border-[#0066E6] sm:w-auto"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        updateRequest(selected.id, { admin_reply: reply })
                      }
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black sm:w-auto"
                    >
                      <CheckCircle2 size={14} /> Save response draft
                    </button>
                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-neutral-400">
                    Saving a response here stores a draft in the inbox. Use
                    “Email customer” to send an email manually. Automated email
                    delivery requires an email provider and server-side function.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
