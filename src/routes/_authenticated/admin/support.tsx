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
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7F8FA] px-3 pb-6 pt-2 sm:px-6 sm:pt-6 lg:px-8 lg:pt-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className={`${mobileDetailOpen ? "hidden lg:flex" : "flex"} flex-col gap-3 sm:flex-row sm:items-end sm:justify-between`}>
          <div className="min-w-0">
            <Link
              to="/account"
              className="mb-2.5 inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:mb-4 sm:h-9 sm:gap-2 sm:rounded-xl sm:px-3.5 sm:text-xs"
            >
              <ArrowLeft size={14} />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0066E6] sm:text-xs">
              <Headset size={15} /> Customer care
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#171717] sm:mt-2 sm:text-3xl">
              Support Inbox
            </h1>
            <p className="mt-1 text-[11px] leading-4 text-neutral-500 sm:text-sm">
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
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:h-9 sm:w-auto sm:rounded-xl sm:px-4 sm:text-xs"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <section className={`${mobileDetailOpen ? "hidden lg:grid" : "grid"} mt-3 grid-cols-3 gap-1.5 sm:mt-6 sm:gap-3`}>
          {(
            [
              ["New", counts.new, "text-blue-600", "bg-blue-50"],
              ["In progress", counts.in_progress, "text-amber-600", "bg-amber-50"],
              ["Resolved", counts.resolved, "text-emerald-600", "bg-emerald-50"],
            ] as const
          ).map(([label, count, color, bg]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-slate-200/90 bg-white px-2.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:rounded-2xl sm:p-4"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[9px] leading-3 text-neutral-500 sm:text-xs">
                  {label}
                </span>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl ${bg} ${color}`}
                >
                  {label === "New" ? (
                    <MessageSquareText size={12} />
                  ) : label === "Resolved" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Clock3 size={12} />
                  )}
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold leading-none text-[#171717] sm:mt-2 sm:text-2xl">
                {count}
              </p>
            </div>
          ))}
        </section>

        <section className={`${mobileDetailOpen ? "mt-0" : "mt-3"} min-h-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)] sm:mt-6 sm:rounded-2xl lg:mt-6 lg:grid lg:min-h-[560px] lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.4fr)]`}>
          {/* Request list: full view on mobile until a request is selected. */}
          <div
            className={`min-w-0 border-neutral-200 lg:block lg:border-r ${
              mobileDetailOpen ? "hidden" : "block"
            }`}
          >
            <div className="border-b border-slate-100 p-2.5 sm:p-4">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search email or message..."
                  className="h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[11px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0066E6] focus:ring-2 focus:ring-blue-100 sm:h-10 sm:rounded-xl sm:text-xs"
                />
              </div>

              <div className="mt-2 flex min-w-0 gap-1 overflow-x-auto pb-0.5 sm:mt-3 sm:gap-1.5 sm:pb-1">
                {["all", "new", "in_progress", "resolved"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-semibold transition sm:px-3.5 sm:py-2 sm:text-[10px] ${
                      filter === item
                        ? "bg-[#0066E6] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item === "all" ? "All" : statusLabels[item as keyof typeof statusLabels]}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[52vh] overflow-y-auto overscroll-contain sm:max-h-[60vh] lg:max-h-[650px]">
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
                    className={`block w-full min-w-0 border-b border-slate-100 px-3 py-3 text-left transition hover:bg-slate-50 sm:p-4 ${
                      selected?.id === item.id ? "bg-blue-50/70" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 break-all text-[11px] font-semibold leading-4 text-slate-800 sm:text-xs">
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
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-600 sm:mt-2 sm:text-[11px]">
                      {item.issue_type}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                      {item.message}
                    </p>
                    <p className="mt-1.5 text-[9px] text-slate-400 sm:mt-2 sm:text-[10px]">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Request details: split pane on desktop, dedicated screen on mobile. */}
          <div
            className={`min-w-0 bg-white p-2.5 sm:p-5 lg:block lg:p-7 ${
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
                  className="mb-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 lg:hidden"
                >
                  <ArrowLeft size={14} /> Back to requests
                </button>

                <div className="rounded-xl border border-slate-200 bg-white p-3 sm:rounded-2xl sm:p-4">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                      Customer request
                    </p>
                    <h2 className="mt-0.5 break-all text-sm font-semibold leading-5 text-[#171717] sm:mt-1 sm:text-lg">
                      {selected.customer_email}
                    </h2>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                        {selected.issue_type} <span className="px-1 text-slate-300">·</span>
                        {new Date(selected.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                        selected.status === "new"
                          ? "bg-blue-50 text-blue-700"
                          : selected.status === "in_progress"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {statusLabels[selected.status]}
                    </span>
                  </div>
                  <a
                    href={`mailto:${selected.customer_email}`}
                    className="mt-2.5 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:mt-3 sm:h-9 sm:w-fit sm:gap-2 sm:rounded-xl sm:text-xs"
                  >
                    <Mail size={14} /> Email customer
                  </a>
                </div>

                <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3 sm:mt-4 sm:p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-5 text-slate-700 sm:text-sm sm:leading-6">
                    {selected.message}
                  </p>
                  {selected.page_url && (
                    <a
                      href={selected.page_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-[10px] text-blue-600 hover:underline sm:mt-3 sm:text-[11px]"
                    >
                      Page: {selected.page_url}
                    </a>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 sm:mt-5 sm:p-4">
                  <label
                    htmlFor="support-reply"
                    className="text-[11px] font-semibold text-slate-800 sm:text-xs"
                  >
                    Internal reply / response draft
                  </label>
                  <textarea
                    id="support-reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    maxLength={5000}
                    placeholder="Write a response for this customer..."
                    className="mt-2 min-h-[104px] w-full resize-y rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-[12px] leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0066E6] focus:bg-white focus:ring-2 focus:ring-blue-100 sm:min-h-[140px] sm:rounded-xl sm:text-sm"
                  />

                  <div className="mt-2 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2 sm:mt-3 sm:flex sm:items-center sm:justify-between">
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        updateRequest(selected.id, {
                          status: e.target.value as SupportRequest["status"],
                        })
                      }
                      className="h-9 min-w-0 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-[#0066E6] focus:ring-2 focus:ring-blue-100 sm:h-10 sm:w-auto sm:rounded-xl sm:px-3 sm:text-xs"
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
                      className="inline-flex h-9 min-w-0 w-full items-center justify-center gap-1.5 rounded-lg bg-[#0066E6] px-2 text-[10px] font-semibold text-white shadow-sm shadow-blue-600/15 transition hover:bg-[#0052CC] sm:h-10 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs"
                    >
                      <CheckCircle2 size={13} /> <span className="truncate">Save draft</span>
                    </button>
                  </div>

                  <p className="mt-2 text-[9px] leading-4 text-slate-400 sm:mt-3 sm:text-[10px] sm:leading-5">
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
