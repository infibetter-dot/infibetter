import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CircleCheck,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: ReviewsAdminPage,
});

type Product = {
  id: string;
  name: string;
  slug: string | null;
};

type Review = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  content: string;
  image_url: string | null;
  video_url: string | null;
  verified_purchase: boolean;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
};

type ReviewForm = {
  customer_name: string;
  rating: number;
  title: string;
  content: string;
  image_url: string;
  video_url: string;
  verified_purchase: boolean;
  is_visible: boolean;
  sort_order: number;
};

const emptyForm: ReviewForm = {
  customer_name: "",
  rating: 5,
  title: "",
  content: "",
  image_url: "",
  video_url: "",
  verified_purchase: true,
  is_visible: true,
  sort_order: 0,
};

function ReviewsAdminPage() {
  const queryClient = useQueryClient();

  const [selectedProductId, setSelectedProductId] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-review-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin-product-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const filteredReviews = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return reviews.filter((review) => {
      const product = productMap.get(review.product_id);

      const matchProduct =
        selectedProductId === "all" ||
        review.product_id === selectedProductId;

      const matchKeyword =
        !search ||
        review.customer_name.toLowerCase().includes(search) ||
        review.title?.toLowerCase().includes(search) ||
        review.content.toLowerCase().includes(search) ||
        product?.name.toLowerCase().includes(search);

      return matchProduct && matchKeyword;
    });
  }, [reviews, products, productMap, selectedProductId, keyword]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const visible = reviews.filter((review) => review.is_visible).length;
    const verified = reviews.filter((review) => review.verified_purchase).length;
    const average =
      total > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          total
        : 0;

    return {
      total,
      visible,
      verified,
      average: average.toFixed(1),
    };
  }, [reviews]);

  function openCreate() {
    setEditingReview(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(review: Review) {
    setEditingReview(review);
    setForm({
      customer_name: review.customer_name,
      rating: review.rating,
      title: review.title ?? "",
      content: review.content,
      image_url: review.image_url ?? "",
      video_url: review.video_url ?? "",
      verified_purchase: review.verified_purchase,
      is_visible: review.is_visible,
      sort_order: review.sort_order,
    });
    setSelectedProductId(review.product_id);
    setShowForm(true);
  }

  async function saveReview() {
    if (selectedProductId === "all") {
      alert("Please select a product first.");
      return;
    }

    if (!form.customer_name.trim() || !form.content.trim()) {
      alert("Customer name and review content are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        product_id: selectedProductId,
        customer_name: form.customer_name.trim(),
        rating: Number(form.rating),
        title: form.title.trim() || null,
        content: form.content.trim(),
        image_url: form.image_url.trim() || null,
        video_url: form.video_url.trim() || null,
        verified_purchase: form.verified_purchase,
        is_visible: form.is_visible,
        sort_order: Number(form.sort_order) || 0,
      };

      if (editingReview) {
        const { error } = await supabase
          .from("product_reviews")
          .update(payload)
          .eq("id", editingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("product_reviews")
          .insert(payload);

        if (error) throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: ["admin-product-reviews"],
      });

      setShowForm(false);
      setEditingReview(null);
      setForm(emptyForm);
    } catch (error: any) {
      console.error("SAVE REVIEW ERROR:", error);
      alert(error?.message ?? "Unable to save review.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview(review: Review) {
    if (
      !window.confirm(
        `Delete the review from "${review.customer_name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(review.id);

    try {
      const { error } = await supabase
        .from("product_reviews")
        .delete()
        .eq("id", review.id);

      if (error) throw error;

      await queryClient.invalidateQueries({
        queryKey: ["admin-product-reviews"],
      });
    } catch (error: any) {
      console.error("DELETE REVIEW ERROR:", error);
      alert(error?.message ?? "Unable to delete review.");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleVisibility(review: Review) {
    const { error } = await supabase
      .from("product_reviews")
      .update({ is_visible: !review.is_visible })
      .eq("id", review.id);

    if (error) {
      console.error("TOGGLE REVIEW ERROR:", error);
      alert(error.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["admin-product-reviews"],
    });
  }

  const loading = productsLoading || reviewsLoading;

  return (
    <div
      className="min-h-screen bg-[#F8F7F3]"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="mx-auto max-w-[1180px] px-4 py-3 sm:px-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                INFIBETTER Admin
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-neutral-900">
              Reviews
            </h1>

            <p className="mt-1 text-[11px] text-neutral-500">
              Manage customer reviews for each product.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            Add review
          </button>
        </div>

        <div className="mb-3 grid grid-cols-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.025)]">
          <StatCard label="Total reviews" value={stats.total} />
          <StatCard label="Visible" value={stats.visible} />
          <StatCard label="Verified" value={stats.verified} />
          <StatCard label="Average rating" value={`${stats.average} / 5`} />
        </div>

        <div className="mb-3 rounded-xl border border-neutral-200 bg-white p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="grid gap-2 lg:grid-cols-[1fr_300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search customer, product or review..."
                className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-[11px] outline-none transition focus:border-neutral-400"
              />
            </div>

            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="h-9 rounded-lg border border-neutral-200 bg-white px-3 text-[11px] text-neutral-700 outline-none"
            >
              <option value="all">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="hidden border-b border-neutral-200 bg-[#FBFBF9] px-4 py-3 lg:grid lg:grid-cols-[minmax(300px,1.4fr)_180px_100px_100px_100px] lg:items-center lg:gap-4">
            <HeaderLabel>Review</HeaderLabel>
            <HeaderLabel>Product</HeaderLabel>
            <HeaderLabel>Rating</HeaderLabel>
            <HeaderLabel>Status</HeaderLabel>
            <HeaderLabel className="text-right">Actions</HeaderLabel>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
                <Star className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-800">
                No reviews yet
              </p>
              <p className="mt-1 text-[11px] text-neutral-500">
                Add the first review for a product.
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const product = productMap.get(review.product_id);

              return (
                <div
                  key={review.id}
                  className="grid gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0 lg:grid-cols-[minmax(300px,1.4fr)_180px_100px_100px_100px] lg:items-center lg:gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12px] font-semibold text-neutral-900">
                        {review.customer_name}
                      </span>

                      {review.verified_purchase && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700">
                          <Check className="h-2.5 w-2.5" />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-[11px] font-medium text-neutral-800">
                      {review.title || "Customer review"}
                    </p>

                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-neutral-500">
                      {review.content}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-[9px] text-neutral-400">
                      {review.image_url && (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          Photo
                        </span>
                      )}
                      {review.video_url && (
                        <span className="inline-flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Video
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] font-medium text-neutral-600">
                    {product?.name ?? "Unknown product"}
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-3.5 w-3.5 ${
                          index < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleVisibility(review)}
                    className={`inline-flex h-7 w-fit items-center gap-1.5 rounded-full px-2 text-[9px] font-semibold ${
                      review.is_visible
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {review.is_visible ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </>
                    )}
                  </button>

                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(review)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
                      title="Edit review"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === review.id}
                      onClick={() => deleteReview(review)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                      title="Delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-[680px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold text-neutral-900">
                  {editingReview ? "Edit review" : "Add review"}
                </h2>
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  Review content belongs to the selected product.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product">
                  <select
                    value={selectedProductId}
                    onChange={(event) =>
                      setSelectedProductId(event.target.value)
                    }
                    className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[11px] outline-none"
                  >
                    <option value="all">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Customer name">
                  <input
                    value={form.customer_name}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        customer_name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Alex"
                    className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-[11px] outline-none focus:border-neutral-400"
                  />
                </Field>

                <Field label="Rating">
                  <select
                    value={form.rating}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        rating: Number(event.target.value),
                      }))
                    }
                    className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[11px] outline-none"
                  >
                    <option value={5}>5 stars</option>
                    <option value={4}>4 stars</option>
                    <option value={3}>3 stars</option>
                    <option value={2}>2 stars</option>
                    <option value={1}>1 star</option>
                  </select>
                </Field>

                <Field label="Review title">
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Great case"
                    className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-[11px] outline-none focus:border-neutral-400"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Review content">
                    <textarea
                      value={form.content}
                      onChange={(event) =>
                        setForm((value) => ({
                          ...value,
                          content: event.target.value,
                        }))
                      }
                      rows={5}
                      placeholder="Write the customer review..."
                      className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-[11px] leading-5 outline-none focus:border-neutral-400"
                    />
                  </Field>
                </div>

                <Field label="Image URL">
                  <input
                    value={form.image_url}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        image_url: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-[11px] outline-none focus:border-neutral-400"
                  />
                </Field>

                <Field label="Video URL">
                  <input
                    value={form.video_url}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        video_url: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-[11px] outline-none focus:border-neutral-400"
                  />
                </Field>

                <Field label="Sort order">
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        sort_order: Number(event.target.value),
                      }))
                    }
                    className="h-9 w-full rounded-lg border border-neutral-200 px-3 text-[11px] outline-none focus:border-neutral-400"
                  />
                </Field>

                <div className="flex items-end gap-5 pb-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={form.verified_purchase}
                      onChange={(event) =>
                        setForm((value) => ({
                          ...value,
                          verified_purchase: event.target.checked,
                        }))
                      }
                    />
                    Verified purchase
                  </label>

                  <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      checked={form.is_visible}
                      onChange={(event) =>
                        setForm((value) => ({
                          ...value,
                          is_visible: event.target.checked,
                        }))
                      }
                    />
                    Visible
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-200 bg-[#FBFBF9] px-5 py-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 rounded-lg border border-neutral-200 bg-white px-4 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={saveReview}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-[11px] font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                <CircleCheck className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="min-w-0 border-r border-neutral-100 px-4 py-3 last:border-r-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold leading-none tracking-tight text-neutral-900">
        {value}
      </p>
    </div>
  );
}

function HeaderLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 ${className}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
