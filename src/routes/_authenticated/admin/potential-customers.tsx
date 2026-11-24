
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Download,
  Users,
  Mail,
  CalendarDays,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute(
  "/_authenticated/admin/potential-customers",
)({
  component: PotentialCustomersPage,
});

type NewsletterSubscriber = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
};

function formatDate(dateString: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function PotentialCustomersPage() {
  const [subscribers, setSubscribers] = useState<
    NewsletterSubscriber[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");

  async function loadSubscribers(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, source, created_at")
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("LOAD NEWSLETTER SUBSCRIBERS ERROR:", queryError);
        setError(
          `Không thể tải email đăng ký: ${queryError.message}`,
        );
        return;
      }

      setSubscribers((data ?? []) as NewsletterSubscriber[]);
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  const filteredSubscribers = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return subscribers;

    return subscribers.filter((subscriber) =>
      subscriber.email?.toLowerCase().includes(value),
    );
  }, [subscribers, keyword]);

  const todaySubscribers = subscribers.filter((subscriber) => {
    const date = new Date(subscriber.created_at);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  const uniqueEmailCount = new Set(
    subscribers.map((subscriber) => subscriber.email?.toLowerCase()),
  ).size;

  function exportCSV() {
    if (!filteredSubscribers.length) return;

    const header = ["Email", "Nguồn đăng ký", "Ngày đăng ký"];

    const rows = filteredSubscribers.map((subscriber) => [
      subscriber.email,
      subscriber.source || "Không xác định",
      formatDate(subscriber.created_at),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `infibetter-newsletter-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <a
          href="/account"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </a>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400">
              INFIBETTER ADMIN
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#252525]">
              Newsletter Subscribers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Danh sách khách hàng đăng ký nhận ưu đãi qua email.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadSubscribers(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Làm mới
            </button>

            <button
              type="button"
              onClick={exportCSV}
              disabled={!filteredSubscribers.length}
              className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={15} />
              Xuất CSV
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Tổng email đăng ký
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#252525]">
                  {subscribers.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Users size={19} className="text-gray-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Đăng ký hôm nay
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#252525]">
                  {todaySubscribers}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <CalendarDays size={19} className="text-gray-700" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Email duy nhất
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[#252525]">
                  {uniqueEmailCount}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Mail size={19} className="text-gray-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm email..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#252525]">
                Danh sách đăng ký
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                {keyword
                  ? `${filteredSubscribers.length} kết quả`
                  : `${subscribers.length} email`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw size={16} className="animate-spin" />
                Đang tải dữ liệu...
              </div>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Mail size={20} className="text-gray-400" />
              </div>

              <p className="mt-3 text-sm font-medium text-gray-700">
                Chưa có email đăng ký
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Email khách hàng đăng ký qua popup sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Email
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Nguồn đăng ký
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Ngày đăng ký
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      className="border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <Mail size={14} className="text-gray-400" />
                          {subscriber.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                          {subscriber.source || "Không xác định"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-gray-500">
                        {formatDate(subscriber.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
